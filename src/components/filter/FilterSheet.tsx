import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBreedStore } from '../../store/useBreedStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import { SizeBand, CoatFilter, HypoallergenicFilter, TraitThresholds } from '../../types';
import { capitalize } from '../../utils/formatters';

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
}

const SIZE_OPTIONS: Array<{ key: SizeBand; label: string; desc: string }> = [
  { key: 'small', label: 'Small', desc: '< 10 kg' },
  { key: 'medium', label: 'Medium', desc: '10 – 25 kg' },
  { key: 'large', label: 'Large', desc: '25 – 45 kg' },
  { key: 'giant', label: 'Giant', desc: '> 45 kg' },
];

const COAT_OPTIONS: CoatFilter[] = ['short', 'medium', 'long', 'wire'];

const HYPO_OPTIONS: Array<{ key: HypoallergenicFilter; label: string }> = [
  { key: 'all', label: 'All Breeds' },
  { key: 'yes', label: 'Hypoallergenic Only' },
  { key: 'no', label: 'Non-Hypoallergenic' },
];

const TRAIT_THRESHOLDS_CONFIG: Array<{
  key: keyof TraitThresholds;
  label: string;
  icon: string;
}> = [
    { key: 'good_with_children', label: 'Good With Children', icon: '👶' },
    { key: 'good_with_dogs', label: 'Good With Dogs', icon: '🐕' },
    { key: 'good_with_strangers', label: 'Good With Strangers', icon: '🤝' },
    { key: 'apartment_friendly', label: 'Apartment Friendly', icon: '🏢' },
    { key: 'energy', label: 'High Energy Level', icon: '⚡' },
    { key: 'trainability', label: 'Easy to Train', icon: '🎓' },
  ];

export const FilterSheet: React.FC<FilterSheetProps> = ({ visible, onClose }) => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0
  );

  const groupsById = useBreedStore((state) => state.groupsById);
  const groupIds = useBreedStore((state) => state.groupIds);
  const filters = useBreedStore((state) => state.filters);
  const toggleGroupFilter = useBreedStore((state) => state.toggleGroupFilter);
  const toggleSizeFilter = useBreedStore((state) => state.toggleSizeFilter);
  const toggleCoatFilter = useBreedStore((state) => state.toggleCoatFilter);
  const setHypoallergenicFilter = useBreedStore((state) => state.setHypoallergenicFilter);
  const setTraitThreshold = useBreedStore((state) => state.setTraitThreshold);
  const resetFilters = useBreedStore((state) => state.resetFilters);
  const getFilteredBreeds = useBreedStore((state) => state.getFilteredBreeds);
  const activeCount = useBreedStore((state) => state.getActiveFilterCount());

  const matchingBreedsCount = getFilteredBreeds().length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={colors.statusBar}
          backgroundColor={colors.surface}
          translucent={Platform.OS === 'android'}
        />

        <View
          style={[
            styles.headerWrapper,
            {
              backgroundColor: colors.surface,
              paddingTop: topInset > 0 ? topInset : 8,
              borderBottomColor: colors.borderSubtle,
            },
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.header}>
            <TouchableOpacity
              onPress={resetFilters}
              disabled={activeCount === 0}
              accessibilityRole="button"
              accessibilityLabel="Reset all filters"
            >
              <Text
                style={[
                  styles.resetText,
                  { color: activeCount > 0 ? colors.danger : colors.textMuted },
                ]}
              >
                Reset ({activeCount})
              </Text>
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Filters & Discovery
            </Text>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.doneBtn, { backgroundColor: colors.accent }]}
              accessibilityRole="button"
              accessibilityLabel="Done and apply filters"
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Section: Breed Groups */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              🐶 Breed Groups
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Select one or more kennel club groups
            </Text>
            <View style={styles.chipsWrap}>
              {groupIds.map((gid) => {
                const group = groupsById[gid];
                if (!group) return null;
                const isSelected = filters.selectedGroupIds.includes(gid);
                return (
                  <TouchableOpacity
                    key={gid}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.accent : colors.surfaceSubtle,
                        borderColor: isSelected ? colors.accent : colors.borderSubtle,
                      },
                    ]}
                    onPress={() => toggleGroupFilter(gid)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`${group.name} group`}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {group.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Size Band
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Standard veterinary weight classifications
            </Text>
            <View style={styles.chipsWrap}>
              {SIZE_OPTIONS.map((opt) => {
                const isSelected = filters.selectedSizes.includes(opt.key);
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.sizeChip,
                      {
                        backgroundColor: isSelected ? colors.accent : colors.surfaceSubtle,
                        borderColor: isSelected ? colors.accent : colors.borderSubtle,
                      },
                    ]}
                    onPress={() => toggleSizeFilter(opt.key)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`${opt.label} size, ${opt.desc}`}
                  >
                    <Text
                      style={[
                        styles.sizeChipTitle,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <Text
                      style={[
                        styles.sizeChipDesc,
                        { color: isSelected ? '#E0E7FF' : colors.textMuted },
                      ]}
                    >
                      {opt.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Coat Length & Texture
            </Text>
            <View style={styles.chipsWrap}>
              {COAT_OPTIONS.map((coat) => {
                const isSelected = filters.selectedCoatLengths.includes(coat);
                return (
                  <TouchableOpacity
                    key={coat}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.accent : colors.surfaceSubtle,
                        borderColor: isSelected ? colors.accent : colors.borderSubtle,
                      },
                    ]}
                    onPress={() => toggleCoatFilter(coat)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`${capitalize(coat)} coat`}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {capitalize(coat)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Hypoallergenic Compatibility
            </Text>
            <View style={styles.segmentedRow}>
              {HYPO_OPTIONS.map((opt) => {
                const isSelected = filters.hypoallergenic === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.segmentBtn,
                      {
                        backgroundColor: isSelected ? colors.accent : colors.surfaceSubtle,
                      },
                    ]}
                    onPress={() => setHypoallergenicFilter(opt.key)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Trait Thresholds
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Show breeds scoring at or above chosen score (1 – 5)
            </Text>

            {TRAIT_THRESHOLDS_CONFIG.map((trait) => {
              const currentVal = filters.traitThresholds[trait.key] ?? 0;
              return (
                <View
                  key={trait.key}
                  style={[
                    styles.traitRow,
                    { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle },
                  ]}
                >
                  <View style={styles.traitLabelCol}>
                    <Text style={styles.traitIcon}>{trait.icon}</Text>
                    <Text style={[styles.traitTitle, { color: colors.textPrimary }]}>
                      {trait.label}
                    </Text>
                  </View>

                  <View style={styles.scoreButtonsRow}>
                    {[1, 2, 3, 4, 5].map((score) => {
                      const isActive = currentVal === score;
                      return (
                        <TouchableOpacity
                          key={score}
                          style={[
                            styles.scoreBtn,
                            {
                              backgroundColor: isActive ? colors.accent : colors.surface,
                              borderColor: isActive ? colors.accent : colors.borderSubtle,
                            },
                          ]}
                          onPress={() => {
                            if (currentVal === score) {
                              setTraitThreshold(trait.key, undefined); // toggle off
                            } else {
                              setTraitThreshold(trait.key, score);
                            }
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`Require ${trait.label} minimum score of ${score}`}
                        >
                          <Text
                            style={[
                              styles.scoreBtnText,
                              { color: isActive ? '#FFFFFF' : colors.textSecondary },
                            ]}
                          >
                            {score}+
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.borderSubtle,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.accent }]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={`Apply filters and show ${matchingBreedsCount} breeds`}
          >
            <Text style={styles.applyButtonText}>
              Show {matchingBreedsCount} Matching {matchingBreedsCount === 1 ? 'Breed' : 'Breeds'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    borderBottomWidth: 1,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  doneBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sizeChip: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  sizeChipTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  sizeChipDesc: {
    fontSize: 11,
    fontWeight: '500',
  },
  segmentedRow: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    gap: 6,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  traitRow: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  traitLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  traitIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  traitTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  scoreButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  scoreBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  scoreBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  applyButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
