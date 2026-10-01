import {
  DogApiBreed,
  DogApiGroup,
  DogApiTraits,
  NormalizedBreed,
  NormalizedGroup,
  SizeBand,
  CoatFilter,
  FilterState,
  GroupSectionData,
} from '../types';

export function deriveSizeBand(
  maleWeightMax?: number,
  femaleWeightMax?: number,
  maleHeightMax?: number
): SizeBand {
  const effectiveWeight = maleWeightMax || femaleWeightMax || 0;

  if (effectiveWeight > 0) {
    if (effectiveWeight < 10) return 'small';
    if (effectiveWeight <= 25) return 'medium';
    if (effectiveWeight <= 45) return 'large';
    return 'giant';
  }

  const effectiveHeight = maleHeightMax || 0;
  if (effectiveHeight > 0) {
    if (effectiveHeight < 35) return 'small';
    if (effectiveHeight <= 55) return 'medium';
    if (effectiveHeight <= 70) return 'large';
    return 'giant';
  }

  return 'medium';
}

export function deriveCoatFilter(
  coatLength?: string,
  coatType?: string
): CoatFilter | 'unknown' {
  const normLength = coatLength?.toLowerCase().trim() || '';
  const normType = coatType?.toLowerCase().trim() || '';

  if (normType.includes('wire') || normLength.includes('wire')) {
    return 'wire';
  }
  if (normLength.includes('short')) return 'short';
  if (normLength.includes('medium')) return 'medium';
  if (normLength.includes('long')) return 'long';

  return 'unknown';
}

const DEFAULT_TRAITS: DogApiTraits = {
  energy: 3,
  barking: 2,
  drooling: 1,
  grooming: 3,
  shedding: 3,
  temperament: [],
  trainability: 3,
  good_with_dogs: 3,
  exercise_minutes: 30,
  apartment_friendly: 3,
  good_with_children: 3,
  good_with_strangers: 3,
};

export function normalizeBreed(
  raw: DogApiBreed,
  groupMap: Map<string, string>
): NormalizedBreed {
  const attr = raw.attributes;
  const groupId = raw.relationships?.group?.data?.id ?? 'ungrouped';
  const groupName = groupMap.get(groupId) ?? 'Other Breeds';

  const maleWeightMin = attr.male_weight?.min ?? 0;
  const maleWeightMax = attr.male_weight?.max ?? 0;
  const femaleWeightMin = attr.female_weight?.min ?? 0;
  const femaleWeightMax = attr.female_weight?.max ?? 0;

  const sizeBand = deriveSizeBand(
    maleWeightMax,
    femaleWeightMax,
    attr.male_height?.max
  );

  const coatLength = deriveCoatFilter(attr.coat?.length, attr.coat?.type);
  const coatType = attr.coat?.type ?? 'Standard';
  const coatColors = attr.coat?.colors ?? [];

  const images = attr.images ?? [];
  const firstImage = images[0];
  const thumbnailUrl =
    firstImage?.thumb || firstImage?.medium || firstImage?.url || '';
  const mediumHeroUrl =
    firstImage?.medium || firstImage?.large || firstImage?.url || '';

  const lifeMin = attr.life?.min ?? 0;
  const lifeMax = attr.life?.max ?? 0;
  const lifeSpanText =
    lifeMin && lifeMax
      ? `${lifeMin} - ${lifeMax} years`
      : lifeMax
        ? `Up to ${lifeMax} years`
        : 'Unknown';

  const traits = {
    ...DEFAULT_TRAITS,
    ...(attr.traits ?? {}),
  };

  return {
    id: raw.id,
    name: attr.name,
    description: attr.description ?? 'No description available for this breed.',
    groupId,
    groupName,
    sizeBand,
    coatLength,
    coatType,
    coatColors,
    isHypoallergenic: !!attr.hypoallergenic,
    lifeSpanText,
    lifeMin,
    lifeMax,
    maleWeightMin,
    maleWeightMax,
    femaleWeightMin,
    femaleWeightMax,
    maleHeightMin: attr.male_height?.min ?? 0,
    maleHeightMax: attr.male_height?.max ?? 0,
    femaleHeightMin: attr.female_height?.min ?? 0,
    femaleHeightMax: attr.female_height?.max ?? 0,
    originCountry: attr.origin?.country ?? 'Global',
    originRegion: attr.origin?.region ?? '',
    originEra: attr.origin?.era ?? '',
    otherNames: attr.other_names ?? [],
    recognizedBy: attr.recognized_by ?? [],
    sources: attr.sources ?? [],
    traits,
    images,
    thumbnailUrl,
    mediumHeroUrl,
    rawAttributes: attr,
  };
}

export function normalizeGroups(
  rawGroups: DogApiGroup[]
): {
  groups: NormalizedGroup[];
  groupMap: Map<string, string>;
} {
  const groupMap = new Map<string, string>();
  const groups: NormalizedGroup[] = rawGroups.map((g) => {
    const name = g.attributes.name;
    groupMap.set(g.id, name);
    const breedIds =
      g.relationships?.breeds?.data?.map((b) => b.id) ?? [];
    return {
      id: g.id,
      name,
      breedIds,
    };
  });

  return { groups, groupMap };
}

export function filterBreeds(
  breeds: NormalizedBreed[],
  filters: FilterState
): NormalizedBreed[] {
  const query = filters.searchQuery.trim().toLowerCase();
  const hasGroupFilter = filters.selectedGroupIds.length > 0;
  const hasSizeFilter = filters.selectedSizes.length > 0;
  const hasCoatFilter = filters.selectedCoatLengths.length > 0;
  const hypo = filters.hypoallergenic;
  const thresholds = filters.traitThresholds;

  return breeds.filter((breed) => {
    if (query) {
      const nameMatch = breed.name.toLowerCase().includes(query);
      const otherNamesMatch = breed.otherNames.some((alias) =>
        alias.toLowerCase().includes(query)
      );
      if (!nameMatch && !otherNamesMatch) {
        return false;
      }
    }

    if (hasGroupFilter) {
      if (!filters.selectedGroupIds.includes(breed.groupId)) {
        return false;
      }
    }

    if (hasSizeFilter) {
      if (!filters.selectedSizes.includes(breed.sizeBand)) {
        return false;
      }
    }

    if (hasCoatFilter) {
      if (
        breed.coatLength === 'unknown' ||
        !filters.selectedCoatLengths.includes(breed.coatLength as CoatFilter)
      ) {
        return false;
      }
    }

    if (hypo === 'yes' && !breed.isHypoallergenic) return false;
    if (hypo === 'no' && breed.isHypoallergenic) return false;

    if (
      thresholds.good_with_children !== undefined &&
      breed.traits.good_with_children < thresholds.good_with_children
    ) {
      return false;
    }
    if (
      thresholds.good_with_dogs !== undefined &&
      breed.traits.good_with_dogs < thresholds.good_with_dogs
    ) {
      return false;
    }
    if (
      thresholds.good_with_strangers !== undefined &&
      breed.traits.good_with_strangers < thresholds.good_with_strangers
    ) {
      return false;
    }
    if (
      thresholds.apartment_friendly !== undefined &&
      breed.traits.apartment_friendly < thresholds.apartment_friendly
    ) {
      return false;
    }
    if (
      thresholds.energy !== undefined &&
      breed.traits.energy < thresholds.energy
    ) {
      return false;
    }
    if (
      thresholds.trainability !== undefined &&
      breed.traits.trainability < thresholds.trainability
    ) {
      return false;
    }

    return true;
  });
}

export function groupBreedsByGroup(
  breeds: NormalizedBreed[],
  groups: NormalizedGroup[]
): GroupSectionData[] {
  const groupOrderMap = new Map<string, number>();
  groups.forEach((g, index) => groupOrderMap.set(g.id, index));

  const sectionsMap = new Map<string, { groupName: string; data: NormalizedBreed[] }>();

  for (const breed of breeds) {
    let section = sectionsMap.get(breed.groupId);
    if (!section) {
      section = { groupName: breed.groupName, data: [] };
      sectionsMap.set(breed.groupId, section);
    }
    section.data.push(breed);
  }

  const sections: GroupSectionData[] = [];
  for (const [groupId, sec] of sectionsMap.entries()) {
    sec.data.sort((a, b) => a.name.localeCompare(b.name));
    sections.push({
      groupId,
      groupName: sec.groupName,
      data: sec.data,
    });
  }

  sections.sort((a, b) => {
    const orderA = groupOrderMap.get(a.groupId) ?? 999;
    const orderB = groupOrderMap.get(b.groupId) ?? 999;
    return orderA - orderB;
  });

  return sections;
}
