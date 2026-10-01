import {
  DogApiBreed,
  DogApiGroup,
  DogApiResponse,
  isDogApiBreedList,
  isDogApiGroupList,
  isDogApiBreed,
} from '../types';

export const DOG_API_BASE_URL = 'https://dogapi.dog/api/v2';
export const DEFAULT_PAGE_SIZE = 48;
export const MAX_PAGES = 6;
export const DEFAULT_TIMEOUT_MS = 10000;
export const DEFAULT_MAX_RETRIES = 3;

export interface FetchAllResult {
  breeds: DogApiBreed[];
  partialFailure: boolean;
  failedPages: number[];
  error?: string;
}

export async function withExponentialBackoff<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    backoffFactor?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const initialDelayMs = options.initialDelayMs ?? 800;
  const backoffFactor = options.backoffFactor ?? 2;

  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      if (attempt > maxRetries) {
        throw error;
      }

      if (options.onRetry) {
        options.onRetry(attempt, error);
      }

      const jitter = 0.8 + Math.random() * 0.4;
      const delay = Math.round(
        initialDelayMs * Math.pow(backoffFactor, attempt - 1) * jitter
      );

      await new Promise<void>((resolve) => setTimeout(() => resolve(), delay));
    }
  }
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/vnd.api+json, application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} for ${url}`);
    }

    return response;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchBreedGroups(): Promise<DogApiGroup[]> {
  return withExponentialBackoff(async () => {
    const res = await fetchWithTimeout(`${DOG_API_BASE_URL}/groups`);
    const json: unknown = await res.json();

    if (
      typeof json === 'object' &&
      json !== null &&
      'data' in json &&
      isDogApiGroupList((json as DogApiResponse<unknown[]>).data)
    ) {
      return (json as DogApiResponse<DogApiGroup[]>).data;
    }

    throw new Error('Malformed Dog API groups response format');
  });
}

export async function fetchBreedPage(
  pageNumber: number,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<DogApiBreed[]> {
  const url = `${DOG_API_BASE_URL}/breeds?page[number]=${pageNumber}&page[size]=${pageSize}`;
  return withExponentialBackoff(async () => {
    const res = await fetchWithTimeout(url);
    const json: unknown = await res.json();

    if (
      typeof json === 'object' &&
      json !== null &&
      'data' in json &&
      isDogApiBreedList((json as DogApiResponse<unknown[]>).data)
    ) {
      return (json as DogApiResponse<DogApiBreed[]>).data;
    }

    throw new Error(`Malformed Dog API breeds response format on page ${pageNumber}`);
  });
}

export async function fetchSingleBreed(breedId: string): Promise<DogApiBreed> {
  const url = `${DOG_API_BASE_URL}/breeds/${breedId}`;
  return withExponentialBackoff(async () => {
    const res = await fetchWithTimeout(url);
    const json: unknown = await res.json();

    if (
      typeof json === 'object' &&
      json !== null &&
      'data' in json &&
      isDogApiBreed((json as { data: unknown }).data)
    ) {
      return (json as { data: DogApiBreed }).data;
    }

    throw new Error(`Malformed Dog API single breed response for ${breedId}`);
  });
}

export async function fetchAllBreedsWindowed(
  onProgress?: (loadedCount: number, totalEstimated: number) => void
): Promise<FetchAllResult> {
  const allBreeds: DogApiBreed[] = [];
  const failedPages: number[] = [];
  const pages = [1, 2, 3, 4, 5, 6];
  const BATCH_SIZE = 2;

  for (let i = 0; i < pages.length; i += BATCH_SIZE) {
    const batch = pages.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (pageNumber) => {
      try {
        const pageData = await fetchBreedPage(pageNumber, DEFAULT_PAGE_SIZE);
        return { pageNumber, data: pageData, error: null };
      } catch (err: unknown) {
        return {
          pageNumber,
          data: [] as DogApiBreed[],
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });

    const results = await Promise.all(promises);

    for (const res of results) {
      if (res.error) {
        failedPages.push(res.pageNumber);
      } else {
        allBreeds.push(...res.data);
      }
    }

    if (onProgress) {
      onProgress(allBreeds.length, 283);
    }
  }

  const seen = new Set<string>();
  const deduplicatedBreeds: DogApiBreed[] = [];
  for (const breed of allBreeds) {
    if (!seen.has(breed.id)) {
      seen.add(breed.id);
      deduplicatedBreeds.push(breed);
    }
  }

  return {
    breeds: deduplicatedBreeds,
    partialFailure: failedPages.length > 0 && failedPages.length < MAX_PAGES,
    failedPages,
    error:
      failedPages.length === MAX_PAGES
        ? 'Failed to fetch any breed pages'
        : failedPages.length > 0
          ? `Partial failure on pages: ${failedPages.join(', ')}`
          : undefined,
  };
}
