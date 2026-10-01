import AsyncStorage from '@react-native-async-storage/async-storage';
import { DogApiBreed, DogApiGroup, isDogApiBreedList, isDogApiGroupList } from '../types';

const SEED_GROUPS = require('../assets/data/seedGroups.json') as DogApiGroup[];
const SEED_BREEDS = require('../assets/data/seedBreeds.json') as DogApiBreed[];

const STORAGE_KEYS = {
  BREEDS: '@tripare_breeds_v1',
  GROUPS: '@tripare_groups_v1',
  LAST_SYNCED: '@tripare_last_synced_at',
  IMAGE_CACHE_METRICS: '@tripare_image_cache_metrics_v1',
  THEME_MODE: '@tripare_theme_mode_v1',
} as const;

export class StorageService {

  static getSeedData(): { breeds: DogApiBreed[]; groups: DogApiGroup[] } {
    return {
      breeds: SEED_BREEDS,
      groups: SEED_GROUPS,
    };
  }

  static async loadBreeds(): Promise<{ breeds: DogApiBreed[]; isFromStorage: boolean }> {
    try {
      const serialized = await AsyncStorage.getItem(STORAGE_KEYS.BREEDS);
      if (serialized) {
        const parsed: unknown = JSON.parse(serialized);
        if (isDogApiBreedList(parsed) && parsed.length > 0) {
          return { breeds: parsed, isFromStorage: true };
        }
      }
    } catch (error) {
      console.warn('StorageService.loadBreeds error, falling back to seed:', error);
    }

    return { breeds: SEED_BREEDS, isFromStorage: false };
  }

  static async saveBreeds(breeds: DogApiBreed[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BREEDS, JSON.stringify(breeds));
    } catch (error) {
      console.error('StorageService.saveBreeds failed:', error);
    }
  }

  static async updateSingleBreed(updatedBreed: DogApiBreed): Promise<void> {
    try {
      const { breeds } = await this.loadBreeds();
      const index = breeds.findIndex((b) => b.id === updatedBreed.id);
      if (index >= 0) {
        breeds[index] = updatedBreed;
      } else {
        breeds.push(updatedBreed);
      }
      await this.saveBreeds(breeds);
    } catch (error) {
      console.warn('StorageService.updateSingleBreed failed:', error);
    }
  }

  static async loadGroups(): Promise<{ groups: DogApiGroup[]; isFromStorage: boolean }> {
    try {
      const serialized = await AsyncStorage.getItem(STORAGE_KEYS.GROUPS);
      if (serialized) {
        const parsed: unknown = JSON.parse(serialized);
        if (isDogApiGroupList(parsed) && parsed.length > 0) {
          return { groups: parsed, isFromStorage: true };
        }
      }
    } catch (error) {
      console.warn('StorageService.loadGroups error, falling back to seed:', error);
    }

    return { groups: SEED_GROUPS, isFromStorage: false };
  }

  static async saveGroups(groups: DogApiGroup[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    } catch (error) {
      console.error('StorageService.saveGroups failed:', error);
    }
  }

  static async saveLastSyncedAt(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNCED, String(timestamp));
    } catch (error) {
      console.error('StorageService.saveLastSyncedAt failed:', error);
    }
  }

  static async getLastSyncedAt(): Promise<number | null> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNCED);
      if (val) {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? null : parsed;
      }
    } catch (error) {
      console.warn('StorageService.getLastSyncedAt failed:', error);
    }
    return null;
  }

  static async saveThemeMode(isDark: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, isDark ? 'dark' : 'light');
    } catch (error) {
      console.warn('StorageService.saveThemeMode failed:', error);
    }
  }

  static async loadThemeMode(): Promise<boolean | null> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
      if (val !== null) {
        return val === 'dark';
      }
    } catch (error) {
      console.warn('StorageService.loadThemeMode failed:', error);
    }
    return null;
  }

  static async clearAll(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.BREEDS),
        AsyncStorage.removeItem(STORAGE_KEYS.GROUPS),
        AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNCED),
        AsyncStorage.removeItem(STORAGE_KEYS.IMAGE_CACHE_METRICS),
        AsyncStorage.removeItem(STORAGE_KEYS.THEME_MODE),
      ]);
    } catch (error) {
      console.error('StorageService.clearAll failed:', error);
    }
  }
}
