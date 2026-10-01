export interface DogApiAttribution {
  author?: string;
  license?: string;
  license_url?: string;
  source?: string;
  source_url?: string;
}

export interface DogApiImage {
  id: string;
  url: string;
  thumb: string;
  medium: string;
  large: string;
  attribution: DogApiAttribution;
}

export interface DogApiTraits {
  energy: number;
  barking: number;
  drooling: number;
  grooming: number;
  shedding: number;
  temperament: string[];
  trainability: number;
  good_with_dogs: number;
  exercise_minutes: number;
  apartment_friendly: number;
  good_with_children: number;
  good_with_strangers: number;
}

export interface DogApiOrigin {
  era?: string;
  region?: string;
  country?: string;
}

export interface DogApiCoat {
  type?: string;
  colors?: string[];
  length?: string;
}

export interface DogApiRange {
  min: number;
  max: number;
}

export interface DogApiSource {
  url: string;
  title: string;
}

export interface DogApiBreedAttributes {
  name: string;
  description?: string;
  life?: DogApiRange;
  male_weight?: DogApiRange;
  female_weight?: DogApiRange;
  male_height?: DogApiRange;
  female_height?: DogApiRange;
  hypoallergenic?: boolean;
  origin?: DogApiOrigin;
  coat?: DogApiCoat;
  traits?: DogApiTraits;
  other_names?: string[];
  recognized_by?: string[];
  sources?: DogApiSource[];
  images?: DogApiImage[];
}

export interface DogApiBreed {
  id: string;
  type: 'breed';
  attributes: DogApiBreedAttributes;
  relationships?: {
    group?: {
      data?: {
        id: string;
        type: 'group';
      };
    };
  };
}

export interface DogApiGroupAttributes {
  name: string;
}

export interface DogApiGroup {
  id: string;
  type: 'group';
  attributes: DogApiGroupAttributes;
  relationships?: {
    breeds?: {
      data?: Array<{
        id: string;
        type: 'breed';
      }>;
    };
  };
}

export interface PaginationMeta {
  current: number;
  next?: number;
  last?: number;
  records: number;
}

export interface DogApiResponse<T> {
  data: T;
  meta?: {
    pagination?: PaginationMeta;
  };
  links?: {
    self?: string;
    current?: string;
    next?: string;
    last?: string;
  };
}

export type SizeBand = 'small' | 'medium' | 'large' | 'giant';
export type CoatFilter = 'short' | 'medium' | 'long' | 'wire';
export type HypoallergenicFilter = 'all' | 'yes' | 'no';

export interface TraitThresholds {
  good_with_children?: number;
  good_with_dogs?: number;
  good_with_strangers?: number;
  apartment_friendly?: number;
  energy?: number;
  trainability?: number;
}

export interface FilterState {
  searchQuery: string;
  selectedGroupIds: string[];
  selectedSizes: SizeBand[];
  selectedCoatLengths: CoatFilter[];
  hypoallergenic: HypoallergenicFilter;
  traitThresholds: TraitThresholds;
}

export interface SyncStatus {
  isSyncing: boolean;
  isInitialLoading: boolean;
  lastSyncedAt: number | null;
  isOffline: boolean;
  error: string | null;
  partialFailure: boolean;
}

export interface NormalizedBreed {
  id: string;
  name: string;
  description: string;
  groupId: string;
  groupName: string;
  sizeBand: SizeBand;
  coatLength: CoatFilter | 'unknown';
  coatType: string;
  coatColors: string[];
  isHypoallergenic: boolean;
  lifeSpanText: string;
  lifeMin: number;
  lifeMax: number;
  maleWeightMin: number;
  maleWeightMax: number;
  femaleWeightMin: number;
  femaleWeightMax: number;
  maleHeightMin: number;
  maleHeightMax: number;
  femaleHeightMin: number;
  femaleHeightMax: number;
  originCountry: string;
  originRegion: string;
  originEra: string;
  otherNames: string[];
  recognizedBy: string[];
  sources: DogApiSource[];
  traits: DogApiTraits;
  images: DogApiImage[];
  thumbnailUrl: string;
  mediumHeroUrl: string;
  rawAttributes: DogApiBreedAttributes;
}

export interface NormalizedGroup {
  id: string;
  name: string;
  breedIds: string[];
}

export interface GroupSectionData {
  groupId: string;
  groupName: string;
  data: NormalizedBreed[];
}

export type RootStackParamList = {
  BreedList: undefined;
  BreedDetail: {
    breedId: string;
    breedName: string;
  };
};

export type DetailTabKey = 'overview' | 'traits' | 'gallery';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isDogApiBreed(value: unknown): value is DogApiBreed {
  if (!isRecord(value)) return false;
  if (value.type !== 'breed' || typeof value.id !== 'string') return false;
  if (!isRecord(value.attributes)) return false;
  return typeof value.attributes.name === 'string';
}

export function isDogApiGroup(value: unknown): value is DogApiGroup {
  if (!isRecord(value)) return false;
  if (value.type !== 'group' || typeof value.id !== 'string') return false;
  if (!isRecord(value.attributes)) return false;
  return typeof value.attributes.name === 'string';
}

export function isDogApiBreedList(value: unknown): value is DogApiBreed[] {
  return Array.isArray(value) && value.every(isDogApiBreed);
}

export function isDogApiGroupList(value: unknown): value is DogApiGroup[] {
  return Array.isArray(value) && value.every(isDogApiGroup);
}
