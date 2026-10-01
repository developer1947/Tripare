import { StorageService } from '../services/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DogApiBreed, DogApiGroup } from '../types';

describe('StorageService persistence and seed fallback', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('loads seed data when storage is empty', async () => {
    const { breeds, isFromStorage } = await StorageService.loadBreeds();
    expect(isFromStorage).toBe(false);
    expect(breeds.length).toBe(283);

    const { groups, isFromStorage: isGroupFromStorage } = await StorageService.loadGroups();
    expect(isGroupFromStorage).toBe(false);
    expect(groups.length).toBe(9);
  });

  it('persists breeds and reloads from AsyncStorage', async () => {
    const mockBreed: DogApiBreed = {
      id: 'test-breed-1',
      type: 'breed',
      attributes: {
        name: 'Test Retriever',
      },
    };

    await StorageService.saveBreeds([mockBreed]);
    const { breeds, isFromStorage } = await StorageService.loadBreeds();

    expect(isFromStorage).toBe(true);
    expect(breeds).toHaveLength(1);
    expect(breeds[0].attributes.name).toBe('Test Retriever');
  });

  it('persists groups and reloads from AsyncStorage', async () => {
    const mockGroup: DogApiGroup = {
      id: 'test-group-1',
      type: 'group',
      attributes: {
        name: 'Test Sporting Group',
      },
    };

    await StorageService.saveGroups([mockGroup]);
    const { groups, isFromStorage } = await StorageService.loadGroups();

    expect(isFromStorage).toBe(true);
    expect(groups).toHaveLength(1);
    expect(groups[0].attributes.name).toBe('Test Sporting Group');
  });

  it('persists and retrieves lastSynced timestamp', async () => {
    const timestamp = 1711800000000;
    await StorageService.saveLastSyncedAt(timestamp);
    const retrieved = await StorageService.getLastSyncedAt();
    expect(retrieved).toBe(timestamp);
  });
});
