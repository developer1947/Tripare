import { create } from 'zustand';
import {
  NormalizedBreed,
  NormalizedGroup,
  SizeBand,
  CoatFilter,
  HypoallergenicFilter,
  TraitThresholds,
  FilterState,
  GroupSectionData,
  DogApiBreed,
  DogApiGroup,
} from '../types';
import {
  normalizeBreed,
  normalizeGroups,
  filterBreeds,
  groupBreedsByGroup,
} from '../utils/normalizer';
import {
  fetchBreedGroups,
  fetchAllBreedsWindowed,
  fetchSingleBreed,
} from '../api/dogApi';
import { StorageService } from '../services/storage';

export const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  selectedGroupIds: [],
  selectedSizes: [],
  selectedCoatLengths: [],
  hypoallergenic: 'all',
  traitThresholds: {},
};

export interface BreedState {
  breedsById: Record<string, NormalizedBreed>;
  breedIds: string[];
  groupsById: Record<string, NormalizedGroup>;
  groupIds: string[];

  filters: FilterState;

  isInitialLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  isOffline: boolean;
  error: string | null;
  partialFailure: boolean;
  failedPages: number[];
  syncProgress: { loaded: number; total: number };

  isDarkMode: boolean;

  initialize: () => Promise<void>;
  syncData: (force?: boolean) => Promise<void>;
  refreshSingleBreed: (breedId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  toggleGroupFilter: (groupId: string) => void;
  toggleSizeFilter: (size: SizeBand) => void;
  toggleCoatFilter: (coat: CoatFilter) => void;
  setHypoallergenicFilter: (filter: HypoallergenicFilter) => void;
  setTraitThreshold: (trait: keyof TraitThresholds, value: number | undefined) => void;
  resetFilters: () => void;
  setOfflineStatus: (isOffline: boolean) => void;
  toggleTheme: () => void;

  getFilteredBreeds: () => NormalizedBreed[];
  getGroupedSections: () => GroupSectionData[];
  getBreedById: (id: string) => NormalizedBreed | undefined;
  getActiveFilterCount: () => number;
}

const initialSeed = StorageService.getSeedData();
const { groups: initialGroups, groupMap: initialGroupMap } = normalizeGroups(initialSeed.groups);
const initialGroupsById: Record<string, NormalizedGroup> = {};
const initialGroupIds: string[] = [];
for (const g of initialGroups) {
  initialGroupsById[g.id] = g;
  initialGroupIds.push(g.id);
}
const initialBreedsById: Record<string, NormalizedBreed> = {};
const initialBreedIds: string[] = [];
for (const rb of initialSeed.breeds) {
  const nb = normalizeBreed(rb, initialGroupMap);
  initialBreedsById[nb.id] = nb;
  initialBreedIds.push(nb.id);
}

export const useBreedStore = create<BreedState>((set, get) => ({
  breedsById: initialBreedsById,
  breedIds: initialBreedIds,
  groupsById: initialGroupsById,
  groupIds: initialGroupIds,

  filters: INITIAL_FILTERS,

  isInitialLoading: true,
  isSyncing: false,
  lastSyncedAt: null,
  isOffline: false,
  error: null,
  partialFailure: false,
  failedPages: [],
  syncProgress: { loaded: 0, total: 283 },

  isDarkMode: false,

  initialize: async () => {
    try {
      const [storedBreedsRes, storedGroupsRes, lastSynced, savedTheme] = await Promise.all([
        StorageService.loadBreeds(),
        StorageService.loadGroups(),
        StorageService.getLastSyncedAt(),
        StorageService.loadThemeMode(),
      ]);

      const rawGroups: DogApiGroup[] = storedGroupsRes.groups;
      const rawBreeds: DogApiBreed[] = storedBreedsRes.breeds;

      const { groups, groupMap } = normalizeGroups(rawGroups);

      const groupsById: Record<string, NormalizedGroup> = {};
      const groupIds: string[] = [];
      for (const g of groups) {
        groupsById[g.id] = g;
        groupIds.push(g.id);
      }

      const breedsById: Record<string, NormalizedBreed> = {};
      const breedIds: string[] = [];
      for (const rb of rawBreeds) {
        const nb = normalizeBreed(rb, groupMap);
        breedsById[nb.id] = nb;
        breedIds.push(nb.id);
      }

      set({
        breedsById,
        breedIds,
        groupsById,
        groupIds,
        lastSyncedAt: lastSynced,
        isDarkMode: savedTheme !== null ? savedTheme : get().isDarkMode,
        isInitialLoading: false,
      });

      if (!get().isOffline) {
        get().syncData();
      }
    } catch (err: unknown) {
      console.error('Failed to initialize breed store:', err);
      set({
        isInitialLoading: false,
        error: 'Failed to load initial cache',
      });
    }
  },

  syncData: async (force: boolean = false) => {
    const state = get();
    if (state.isSyncing && !force) return;

    set({ isSyncing: true, error: null });

    try {
      let rawGroups: DogApiGroup[] = [];
      try {
        rawGroups = await fetchBreedGroups();
        await StorageService.saveGroups(rawGroups);
      } catch (groupErr) {
        console.warn('Groups fetch failed, keeping existing groups:', groupErr);
        rawGroups = Object.values(state.groupsById).map((g) => ({
          id: g.id,
          type: 'group' as const,
          attributes: { name: g.name },
          relationships: {
            breeds: {
              data: g.breedIds.map((id) => ({ id, type: 'breed' as const })),
            },
          },
        }));
      }

      const { groups, groupMap } = normalizeGroups(rawGroups);
      const groupsById: Record<string, NormalizedGroup> = {};
      const groupIds: string[] = [];
      for (const g of groups) {
        groupsById[g.id] = g;
        groupIds.push(g.id);
      }

      const result = await fetchAllBreedsWindowed((loaded, total) => {
        set({ syncProgress: { loaded, total } });
      });

      if (result.breeds.length > 0) {
        const newBreedsById = { ...get().breedsById };
        const newBreedIdsSet = new Set(get().breedIds);

        for (const rb of result.breeds) {
          const nb = normalizeBreed(rb, groupMap);
          newBreedsById[nb.id] = nb;
          newBreedIdsSet.add(nb.id);
        }

        const now = Date.now();
        await Promise.all([
          StorageService.saveBreeds(result.breeds),
          StorageService.saveLastSyncedAt(now),
        ]);

        set({
          breedsById: newBreedsById,
          breedIds: Array.from(newBreedIdsSet),
          groupsById,
          groupIds,
          lastSyncedAt: now,
          isSyncing: false,
          partialFailure: result.partialFailure,
          failedPages: result.failedPages,
          error: result.error ?? null,
        });
      } else {
        set({
          isSyncing: false,
          error: result.error ?? 'Could not reach Dog API',
          partialFailure: true,
        });
      }
    } catch (err: unknown) {
      set({
        isSyncing: false,
        error: err instanceof Error ? err.message : 'Network sync failed',
        partialFailure: true,
      });
    }
  },

  refreshSingleBreed: async (breedId: string) => {
    try {
      const rawBreed = await fetchSingleBreed(breedId);
      const groupMap = new Map<string, string>();
      for (const g of Object.values(get().groupsById)) {
        groupMap.set(g.id, g.name);
      }

      const normalized = normalizeBreed(rawBreed, groupMap);
      await StorageService.updateSingleBreed(rawBreed);

      set((prev) => ({
        breedsById: {
          ...prev.breedsById,
          [breedId]: normalized,
        },
      }));
    } catch (err) {
      console.warn(`Failed to refresh breed ${breedId}:`, err);
    }
  },

  setSearchQuery: (query: string) => {
    set((prev) => ({
      filters: { ...prev.filters, searchQuery: query },
    }));
  },

  toggleGroupFilter: (groupId: string) => {
    set((prev) => {
      const current = prev.filters.selectedGroupIds;
      const next = current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId];
      return {
        filters: { ...prev.filters, selectedGroupIds: next },
      };
    });
  },

  toggleSizeFilter: (size: SizeBand) => {
    set((prev) => {
      const current = prev.filters.selectedSizes;
      const next = current.includes(size)
        ? current.filter((s) => s !== size)
        : [...current, size];
      return {
        filters: { ...prev.filters, selectedSizes: next },
      };
    });
  },

  toggleCoatFilter: (coat: CoatFilter) => {
    set((prev) => {
      const current = prev.filters.selectedCoatLengths;
      const next = current.includes(coat)
        ? current.filter((c) => c !== coat)
        : [...current, coat];
      return {
        filters: { ...prev.filters, selectedCoatLengths: next },
      };
    });
  },

  setHypoallergenicFilter: (filter: HypoallergenicFilter) => {
    set((prev) => ({
      filters: { ...prev.filters, hypoallergenic: filter },
    }));
  },

  setTraitThreshold: (trait: keyof TraitThresholds, value: number | undefined) => {
    set((prev) => {
      const nextThresholds = { ...prev.filters.traitThresholds };
      if (value === undefined || value <= 0) {
        delete nextThresholds[trait];
      } else {
        nextThresholds[trait] = value;
      }
      return {
        filters: { ...prev.filters, traitThresholds: nextThresholds },
      };
    });
  },

  resetFilters: () => {
    set({ filters: INITIAL_FILTERS });
  },

  setOfflineStatus: (isOffline: boolean) => {
    const wasOffline = get().isOffline;
    set({ isOffline });
    if (wasOffline && !isOffline) {
      get().syncData();
    }
  },

  toggleTheme: () => {
    const nextMode = !get().isDarkMode;
    set({ isDarkMode: nextMode });
    StorageService.saveThemeMode(nextMode);
  },

  getFilteredBreeds: () => {
    const { breedsById, breedIds, filters } = get();
    const allBreeds = breedIds.map((id) => breedsById[id]).filter(Boolean);
    return filterBreeds(allBreeds, filters);
  },

  getGroupedSections: () => {
    const { groupsById, groupIds } = get();
    const filtered = get().getFilteredBreeds();
    const groups = groupIds.map((id) => groupsById[id]).filter(Boolean);
    return groupBreedsByGroup(filtered, groups);
  },

  getBreedById: (id: string) => {
    return get().breedsById[id];
  },

  getActiveFilterCount: () => {
    const f = get().filters;
    let count = 0;
    if (f.selectedGroupIds.length > 0) count += f.selectedGroupIds.length;
    if (f.selectedSizes.length > 0) count += f.selectedSizes.length;
    if (f.selectedCoatLengths.length > 0) count += f.selectedCoatLengths.length;
    if (f.hypoallergenic !== 'all') count += 1;
    count += Object.keys(f.traitThresholds).length;
    return count;
  },
}));
