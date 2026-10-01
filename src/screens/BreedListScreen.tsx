import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Platform,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, NormalizedBreed, GroupSectionData, SizeBand } from '../types';
import { useBreedStore } from '../store/useBreedStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { BreedCard } from '../components/breed/BreedCard';
import { SectionHeader } from '../components/breed/SectionHeader';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { FilterSheet } from '../components/filter/FilterSheet';
import { SearchIcon } from '../components/common/SearchIcon';
import { FilterIcon } from '../components/common/FilterIcon';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<RootStackParamList, 'BreedList'>;

const QUICK_FILTERS: Array<{
  id: string;
  label: string;
  icon: string;
  type: 'all' | 'hypo' | 'size';
  value?: SizeBand;
}> = [
  { id: 'all', label: 'All', icon: '🐾', type: 'all' },
  { id: 'hypo', label: 'Hypoallergenic', icon: '✨', type: 'hypo' },
  { id: 'small', label: 'Small', icon: '🐕', type: 'size', value: 'small' },
  { id: 'medium', label: 'Medium', icon: '🐩', type: 'size', value: 'medium' },
  { id: 'large', label: 'Large', icon: '🦮', type: 'size', value: 'large' },
  { id: 'giant', label: 'Giant', icon: '🦁', type: 'size', value: 'giant' },
];

export const BreedListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0
  );

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [viewMode, setViewMode] = useState<'rich' | 'compact'>('rich');

  const searchScaleAnim = useRef(new Animated.Value(1)).current;

  const breedIds = useBreedStore((state) => state.breedIds);
  const breedsById = useBreedStore((state) => state.breedsById);
  const groupIds = useBreedStore((state) => state.groupIds);
  const groupsById = useBreedStore((state) => state.groupsById);
  const filters = useBreedStore((state) => state.filters);
  const setSearchQuery = useBreedStore((state) => state.setSearchQuery);
  const isSyncing = useBreedStore((state) => state.isSyncing);
  const syncData = useBreedStore((state) => state.syncData);
  const resetFilters = useBreedStore((state) => state.resetFilters);
  const toggleSizeFilter = useBreedStore((state) => state.toggleSizeFilter);
  const setHypoallergenicFilter = useBreedStore((state) => state.setHypoallergenicFilter);
  const activeFilterCount = useBreedStore((state) => state.getActiveFilterCount());
  const getGroupedSections = useBreedStore((state) => state.getGroupedSections);

  const sections: GroupSectionData[] = useMemo(() => {
    return getGroupedSections();
  }, [getGroupedSections, breedIds, breedsById, groupIds, groupsById, filters]);

  const totalMatches = useMemo(() => {
    return sections.reduce((acc, curr) => acc + curr.data.length, 0);
  }, [sections]);

  const triggerLayoutAnimation = () => {
    if (Platform.OS !== 'web') {
      try {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      } catch {
        // Safe fallback in test or unsupported environments
      }
    }
  };

  const handleBreedPress = useCallback(
    (breed: NormalizedBreed) => {
      navigation.navigate('BreedDetail', {
        breedId: breed.id,
        breedName: breed.name,
      });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: NormalizedBreed }) => (
      <BreedCard breed={item} onPress={handleBreedPress} viewMode={viewMode} />
    ),
    [handleBreedPress, viewMode]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: GroupSectionData }) => (
      <SectionHeader title={section.groupName} count={section.data.length} />
    ),
    []
  );

  const keyExtractor = useCallback((item: NormalizedBreed) => item.id, []);

  const isQuickFilterActive = (qf: (typeof QUICK_FILTERS)[number]) => {
    if (qf.type === 'all') {
      return (
        filters.hypoallergenic === 'all' &&
        filters.selectedSizes.length === 0 &&
        filters.selectedGroupIds.length === 0 &&
        filters.selectedCoatLengths.length === 0 &&
        Object.keys(filters.traitThresholds).length === 0 &&
        !filters.searchQuery
      );
    }
    if (qf.type === 'hypo') {
      return filters.hypoallergenic === 'yes';
    }
    if (qf.type === 'size' && qf.value) {
      return filters.selectedSizes.includes(qf.value);
    }
    return false;
  };

  const handleQuickFilterPress = (qf: (typeof QUICK_FILTERS)[number]) => {
    triggerLayoutAnimation();
    if (qf.type === 'all') {
      resetFilters();
    } else if (qf.type === 'hypo') {
      setHypoallergenicFilter(filters.hypoallergenic === 'yes' ? 'all' : 'yes');
    } else if (qf.type === 'size' && qf.value) {
      toggleSizeFilter(qf.value);
    }
  };

  const handleViewModeToggle = (mode: 'rich' | 'compact') => {
    if (mode !== viewMode) {
      triggerLayoutAnimation();
      setViewMode(mode);
    }
  };

  const handleResetAllFilters = () => {
    triggerLayoutAnimation();
    resetFilters();
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    Animated.spring(searchScaleAnim, {
      toValue: 1.01,
      speed: 40,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    Animated.spring(searchScaleAnim, {
      toValue: 1,
      speed: 30,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
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
            paddingTop: topInset > 0 ? topInset : 10,
            borderBottomColor: colors.borderSubtle,
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.brandRow}>
              <View style={[styles.brandBadge, { backgroundColor: colors.badgeAccentBg }]}>
                <Text style={styles.brandIcon}>🐾</Text>
              </View>
              <Text
                style={[styles.appTitle, { color: colors.textPrimary }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Tripare Dog Explorer
              </Text>
            </View>
            <Text
              style={[styles.appSubtitle, { color: colors.textMuted }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {totalMatches} of {breedIds.length} Breeds • Instant Search
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.iconButton,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.borderSubtle,
                },
              ]}
              onPress={toggleTheme}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              <Text style={styles.actionIcon}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.iconButton,
                {
                  backgroundColor:
                    activeFilterCount > 0 ? colors.accent : colors.surfaceSubtle,
                  borderColor:
                    activeFilterCount > 0 ? colors.accent : colors.borderSubtle,
                },
              ]}
              onPress={() => setFilterModalOpen(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Filter options${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
            >
              <FilterIcon
                color={activeFilterCount > 0 ? '#FFFFFF' : colors.textPrimary}
                size={16}
              />
              {activeFilterCount > 0 && (
                <View
                  style={[
                    styles.filterBadgeDot,
                    { backgroundColor: colors.accentSecondary || '#F43F5E' },
                  ]}
                >
                  <Text style={styles.filterBadgeDotText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBarWrapper}>
          <Animated.View
            style={[
              styles.searchInputContainer,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: isSearchFocused ? colors.accent : colors.borderSubtle,
                transform: [{ scale: searchScaleAnim }],
              },
            ]}
          >
            <View style={styles.searchIconWrapper}>
              <SearchIcon
                color={isSearchFocused ? colors.accent : colors.textMuted}
                size={18}
                strokeWidth={2}
              />
            </View>
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search by breed or alias..."
              placeholderTextColor={colors.textMuted}
              value={filters.searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="never"
              accessibilityLabel="Search breeds by name or alternative names"
            />
            {filters.searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={[styles.clearBtn, { backgroundColor: colors.border }]}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Clear search text"
              >
                <Text style={[styles.clearBtnText, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFiltersContent}
          style={styles.quickFiltersScroll}
        >
          {QUICK_FILTERS.map((qf) => {
            const active = isQuickFilterActive(qf);
            return (
              <TouchableOpacity
                key={qf.id}
                style={[
                  styles.quickFilterChip,
                  {
                    backgroundColor: active ? colors.accent : colors.surfaceSubtle,
                    borderColor: active ? colors.accent : colors.borderSubtle,
                  },
                ]}
                onPress={() => handleQuickFilterPress(qf)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`${qf.label} quick filter`}
              >
                <Text style={styles.quickFilterIcon}>{qf.icon}</Text>
                <Text
                  style={[
                    styles.quickFilterText,
                    {
                      color: active ? '#FFFFFF' : colors.textPrimary,
                      fontWeight: active ? '700' : '600',
                    },
                  ]}
                >
                  {qf.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View
          style={[
            styles.utilityBar,
            {
              borderTopColor: colors.borderSubtle,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <View style={styles.utilityLeft}>
            <Text style={[styles.showingCountText, { color: colors.textSecondary }]}>
              Showing <Text style={{ fontWeight: '800', color: colors.textPrimary }}>{totalMatches}</Text>{' '}
              {totalMatches === 1 ? 'breed' : 'breeds'}
            </Text>
            {activeFilterCount > 0 && (
              <View
                style={[
                  styles.activeFilterCountBadge,
                  { backgroundColor: colors.badgeAccentBg },
                ]}
              >
                <Text style={[styles.activeFilterCountText, { color: colors.accent }]}>
                  {activeFilterCount} active
                </Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.viewToggleGroup,
              { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.viewToggleBtn,
                viewMode === 'rich' && [
                  styles.viewToggleBtnActive,
                  {
                    backgroundColor: colors.cardBackground,
                    shadowColor: isDark ? '#000000' : '#475569',
                  },
                ],
              ]}
              onPress={() => handleViewModeToggle('rich')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Switch to rich cards layout"
            >
              <Text
                style={[
                  styles.viewToggleIcon,
                  viewMode === 'rich' && { color: colors.accent },
                ]}
              >
                🎴
              </Text>
              <Text
                style={[
                  styles.viewToggleText,
                  {
                    color: viewMode === 'rich' ? colors.textPrimary : colors.textMuted,
                    fontWeight: viewMode === 'rich' ? '800' : '600',
                  },
                ]}
              >
                Cards
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.viewToggleBtn,
                viewMode === 'compact' && [
                  styles.viewToggleBtnActive,
                  {
                    backgroundColor: colors.cardBackground,
                    shadowColor: isDark ? '#000000' : '#475569',
                  },
                ],
              ]}
              onPress={() => handleViewModeToggle('compact')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Switch to compact list layout"
            >
              <Text
                style={[
                  styles.viewToggleIcon,
                  viewMode === 'compact' && { color: colors.accent },
                ]}
              >
                ☰
              </Text>
              <Text
                style={[
                  styles.viewToggleText,
                  {
                    color: viewMode === 'compact' ? colors.textPrimary : colors.textMuted,
                    fontWeight: viewMode === 'compact' ? '800' : '600',
                  },
                ]}
              >
                List
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <OfflineBanner />

      <SectionList
        style={styles.sectionList}
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={true}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.listContent}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={9}
        removeClippedSubviews={false}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={() => syncData(true)}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <View
              style={[
                styles.emptyIconBadge,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <SearchIcon color={colors.accent} size={32} strokeWidth={2.5} />
            </View>
            <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>
              No matching dog breeds found
            </Text>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Try adjusting your search query or loosening applied trait filters to explore more furry companions.
            </Text>
            {activeFilterCount > 0 && (
              <TouchableOpacity
                style={[styles.resetFiltersBtn, { backgroundColor: colors.accent }]}
                onPress={handleResetAllFilters}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Reset all filters to default"
              >
                <Text style={styles.resetFiltersBtnText}>Reset All Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <FilterSheet
        visible={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    borderBottomWidth: 1,
  },
  sectionList: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    gap: 10,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  brandBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  brandIcon: {
    fontSize: 16,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
    flexShrink: 1,
  },
  appSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    flexShrink: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  actionIcon: {
    fontSize: 16,
    lineHeight: 18,
  },
  filterBadgeDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  filterBadgeDotText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1.5,
  },
  searchIconWrapper: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  quickFiltersScroll: {
    paddingBottom: 8,
    marginTop: 2,
  },
  quickFiltersContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  quickFilterIcon: {
    fontSize: 13,
  },
  quickFilterText: {
    fontSize: 12,
  },
  utilityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderTopWidth: 1,
  },
  utilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  showingCountText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  activeFilterCountBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeFilterCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  viewToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    borderRadius: 11,
    borderWidth: 1,
  },
  viewToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 9,
    gap: 4,
  },
  viewToggleBtnActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  viewToggleIcon: {
    fontSize: 12,
  },
  viewToggleText: {
    fontSize: 11.5,
  },
  listContent: {
    paddingBottom: 28,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 36,
  },
  emptyIconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  resetFiltersBtn: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  resetFiltersBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
