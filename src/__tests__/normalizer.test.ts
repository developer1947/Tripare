import {
  deriveSizeBand,
  deriveCoatFilter,
  filterBreeds,
  groupBreedsByGroup,
} from '../utils/normalizer';
import { NormalizedBreed, FilterState, NormalizedGroup } from '../types';

describe('normalizer utils', () => {
  describe('deriveSizeBand', () => {
    it('correctly classifies small dogs (< 10 kg)', () => {
      expect(deriveSizeBand(6, 5)).toBe('small');
      expect(deriveSizeBand(9.5, 9.0)).toBe('small');
    });

    it('correctly classifies medium dogs (10 - 25 kg)', () => {
      expect(deriveSizeBand(15, 14)).toBe('medium');
      expect(deriveSizeBand(25, 23)).toBe('medium');
    });

    it('correctly classifies large dogs (25 - 45 kg)', () => {
      expect(deriveSizeBand(32, 28)).toBe('large');
      expect(deriveSizeBand(45, 40)).toBe('large');
    });

    it('correctly classifies giant dogs (> 45 kg)', () => {
      expect(deriveSizeBand(60, 55)).toBe('giant');
      expect(deriveSizeBand(46, 42)).toBe('giant');
    });

    it('falls back to height if weight is missing', () => {
      expect(deriveSizeBand(0, 0, 25)).toBe('small');
      expect(deriveSizeBand(0, 0, 45)).toBe('medium');
      expect(deriveSizeBand(0, 0, 65)).toBe('large');
      expect(deriveSizeBand(0, 0, 80)).toBe('giant');
    });
  });

  describe('deriveCoatFilter', () => {
    it('detects wire coat from type or length', () => {
      expect(deriveCoatFilter('short', 'wire')).toBe('wire');
      expect(deriveCoatFilter('wire', 'double')).toBe('wire');
    });

    it('detects standard coat lengths', () => {
      expect(deriveCoatFilter('short', 'smooth')).toBe('short');
      expect(deriveCoatFilter('medium', 'double')).toBe('medium');
      expect(deriveCoatFilter('long', 'silky')).toBe('long');
    });

    it('returns unknown for undefined or invalid coat values', () => {
      expect(deriveCoatFilter(undefined, undefined)).toBe('unknown');
    });
  });

  describe('filterBreeds', () => {
    const mockBreeds: NormalizedBreed[] = [
      {
        id: '1',
        name: 'Golden Retriever',
        description: 'Friendly and devoted',
        groupId: 'sporting',
        groupName: 'Sporting Group',
        sizeBand: 'large',
        coatLength: 'medium',
        coatType: 'double',
        coatColors: ['golden'],
        isHypoallergenic: false,
        lifeSpanText: '10 - 12 years',
        lifeMin: 10,
        lifeMax: 12,
        maleWeightMin: 29,
        maleWeightMax: 34,
        femaleWeightMin: 25,
        femaleWeightMax: 32,
        maleHeightMin: 56,
        maleHeightMax: 61,
        femaleHeightMin: 51,
        femaleHeightMax: 56,
        originCountry: 'Scotland',
        originRegion: 'United Kingdom',
        originEra: '19th century',
        otherNames: ['Golden', 'Yellow Retriever'],
        recognizedBy: ['AKC', 'FCI'],
        sources: [],
        traits: {
          energy: 4,
          barking: 2,
          drooling: 2,
          grooming: 3,
          shedding: 4,
          temperament: ['Intelligent', 'Friendly'],
          trainability: 5,
          good_with_dogs: 5,
          exercise_minutes: 60,
          apartment_friendly: 2,
          good_with_children: 5,
          good_with_strangers: 5,
        },
        images: [],
        thumbnailUrl: '',
        mediumHeroUrl: '',
        rawAttributes: { name: 'Golden Retriever' },
      },
      {
        id: '2',
        name: 'Poodle (Toy)',
        description: 'Clever and active',
        groupId: 'toy',
        groupName: 'Toy Group',
        sizeBand: 'small',
        coatLength: 'medium',
        coatType: 'curly',
        coatColors: ['white', 'black'],
        isHypoallergenic: true,
        lifeSpanText: '12 - 15 years',
        lifeMin: 12,
        lifeMax: 15,
        maleWeightMin: 2,
        maleWeightMax: 4,
        femaleWeightMin: 2,
        femaleWeightMax: 4,
        maleHeightMin: 24,
        maleHeightMax: 28,
        femaleHeightMin: 24,
        femaleHeightMax: 28,
        originCountry: 'France',
        originRegion: 'Western Europe',
        originEra: '15th century',
        otherNames: ['Caniche'],
        recognizedBy: ['AKC', 'FCI'],
        sources: [],
        traits: {
          energy: 3,
          barking: 3,
          drooling: 1,
          grooming: 5,
          shedding: 1,
          temperament: ['Alert', 'Intelligent'],
          trainability: 5,
          good_with_dogs: 4,
          exercise_minutes: 30,
          apartment_friendly: 5,
          good_with_children: 4,
          good_with_strangers: 4,
        },
        images: [],
        thumbnailUrl: '',
        mediumHeroUrl: '',
        rawAttributes: { name: 'Poodle (Toy)' },
      },
    ];

    const baseFilter: FilterState = {
      searchQuery: '',
      selectedGroupIds: [],
      selectedSizes: [],
      selectedCoatLengths: [],
      hypoallergenic: 'all',
      traitThresholds: {},
    };

    it('filters by breed name search query', () => {
      const res = filterBreeds(mockBreeds, { ...baseFilter, searchQuery: 'Golden' });
      expect(res).toHaveLength(1);
      expect(res[0].name).toBe('Golden Retriever');
    });

    it('filters by alias / other_names search query', () => {
      const res = filterBreeds(mockBreeds, { ...baseFilter, searchQuery: 'Caniche' });
      expect(res).toHaveLength(1);
      expect(res[0].name).toBe('Poodle (Toy)');
    });

    it('filters by breed group', () => {
      const res = filterBreeds(mockBreeds, {
        ...baseFilter,
        selectedGroupIds: ['toy'],
      });
      expect(res).toHaveLength(1);
      expect(res[0].name).toBe('Poodle (Toy)');
    });

    it('filters by size band', () => {
      const res = filterBreeds(mockBreeds, {
        ...baseFilter,
        selectedSizes: ['large'],
      });
      expect(res).toHaveLength(1);
      expect(res[0].name).toBe('Golden Retriever');
    });

    it('filters by hypoallergenic flag', () => {
      const resYes = filterBreeds(mockBreeds, {
        ...baseFilter,
        hypoallergenic: 'yes',
      });
      expect(resYes).toHaveLength(1);
      expect(resYes[0].name).toBe('Poodle (Toy)');

      const resNo = filterBreeds(mockBreeds, {
        ...baseFilter,
        hypoallergenic: 'no',
      });
      expect(resNo).toHaveLength(1);
      expect(resNo[0].name).toBe('Golden Retriever');
    });

    it('filters by trait thresholds', () => {
      const res = filterBreeds(mockBreeds, {
        ...baseFilter,
        traitThresholds: { apartment_friendly: 4 },
      });
      expect(res).toHaveLength(1);
      expect(res[0].name).toBe('Poodle (Toy)');
    });
  });

  describe('groupBreedsByGroup', () => {
    it('creates sorted sections based on group order', () => {
      const groups: NormalizedGroup[] = [
        { id: 'g1', name: 'Sporting Group', breedIds: ['1'] },
        { id: 'g2', name: 'Toy Group', breedIds: ['2'] },
      ];
      const breeds: NormalizedBreed[] = [
        {
          id: '2',
          name: 'Poodle',
          groupId: 'g2',
          groupName: 'Toy Group',
        } as NormalizedBreed,
        {
          id: '1',
          name: 'Golden',
          groupId: 'g1',
          groupName: 'Sporting Group',
        } as NormalizedBreed,
      ];

      const sections = groupBreedsByGroup(breeds, groups);
      expect(sections).toHaveLength(2);
      expect(sections[0].groupId).toBe('g1');
      expect(sections[1].groupId).toBe('g2');
    });
  });
});
