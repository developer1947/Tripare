import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, DetailTabKey } from '../types';
import { useBreedStore } from '../store/useBreedStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { OverviewTab } from '../components/detail/OverviewTab';
import { TraitScale } from '../components/detail/TraitScale';
import { GalleryCarousel } from '../components/detail/GalleryCarousel';
import { SyncIcon } from '../components/common/SyncIcon';
import { capitalize } from '../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'BreedDetail'>;

export const BreedDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { breedId } = route.params;
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0
  );

  const [activeTab, setActiveTab] = useState<DetailTabKey>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getBreedById = useBreedStore((state) => state.getBreedById);
  const refreshSingleBreed = useBreedStore((state) => state.refreshSingleBreed);

  const breed = getBreedById(breedId);

  useEffect(() => {
    refreshSingleBreed(breedId).catch(() => {
    });
  }, [breedId, refreshSingleBreed]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSingleBreed(breedId);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!breed) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset }]}>
        <StatusBar
          barStyle={colors.statusBar}
          backgroundColor={colors.surface}
          translucent={Platform.OS === 'android'}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🐕❓</Text>
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
            Breed not found in catalog
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.accent }]}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back to breed list"
          >
            <Text style={styles.backButtonText}>Return to Explorer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.surface}
        translucent={Platform.OS === 'android'}
      />

      <View
        style={[
          styles.navBarWrapper,
          {
            backgroundColor: colors.surface,
            paddingTop: topInset > 0 ? topInset : 10,
            borderBottomColor: colors.borderSubtle,
          },
        ]}
      >
        <View style={styles.navBar}>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle }]}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back to breed catalog"
          >
            <Text style={[styles.navBtnIcon, { color: colors.textPrimary }]}>‹ Back</Text>
          </TouchableOpacity>

          <Text
            style={[styles.navTitle, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {breed.name}
          </Text>

          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle }]}
            onPress={handleManualRefresh}
            disabled={isRefreshing}
            accessibilityRole="button"
            accessibilityLabel="Refresh breed details from server"
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <SyncIcon color={colors.textPrimary} size={15} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.cardBorder,
              shadowColor: isDark ? '#000' : '#6A4E1A',
              shadowOpacity: isDark ? 0.4 : 0.09,
            },
          ]}
        >
          <View style={[styles.heroImageContainer, { backgroundColor: colors.surfaceSubtle }]}>
            {breed.mediumHeroUrl ? (
              <Image
                source={{ uri: breed.mediumHeroUrl }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.heroFallbackIcon}>🐕</Text>
            )}
          </View>

          <View style={styles.heroMeta}>
            <View style={styles.badgesRow}>
              <View style={[styles.groupBadge, { backgroundColor: colors.badgeAccentBg }]}>
                <Text style={[styles.groupBadgeText, { color: colors.accent }]}>
                  {breed.groupName}
                </Text>
              </View>

              {breed.isHypoallergenic && (
                <View style={[styles.hypoBadge, { backgroundColor: colors.badgeSuccessBg }]}>
                  <Text style={[styles.hypoBadgeText, { color: colors.badgeSuccessText }]}>
                    ✨ Hypoallergenic
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.breedHeroName, { color: colors.textPrimary }]}>
              {breed.name}
            </Text>

            {breed.otherNames.length > 0 && (
              <Text style={[styles.aliases, { color: colors.textMuted }]}>
                Also known as: {breed.otherNames.join(', ')}
              </Text>
            )}

            <View style={styles.heroStatsRow}>
              <View style={[styles.heroStatChip, { backgroundColor: colors.surfaceSubtle }]}>
                <Text style={styles.heroStatIcon}>⏳</Text>
                <Text style={[styles.heroStatText, { color: colors.textSecondary }]}>
                  {breed.lifeSpanText}
                </Text>
              </View>

              <View style={[styles.heroStatChip, { backgroundColor: colors.surfaceSubtle }]}>
                <Text style={styles.heroStatIcon}>🐾</Text>
                <Text style={[styles.heroStatText, { color: colors.textSecondary }]}>
                  {capitalize(breed.sizeBand)}
                </Text>
              </View>

              <View style={[styles.heroStatChip, { backgroundColor: colors.surfaceSubtle }]}>
                <Text style={styles.heroStatIcon}>✂️</Text>
                <Text style={[styles.heroStatText, { color: colors.textSecondary }]}>
                  {capitalize(breed.coatLength)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.tabBar, { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle }]}>
          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'overview' && { backgroundColor: colors.surface },
            ]}
            onPress={() => setActiveTab('overview')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'overview' }}
            accessibilityLabel="Overview tab"
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === 'overview' ? colors.accent : colors.textSecondary,
                  fontWeight: activeTab === 'overview' ? '700' : '500',
                },
              ]}
            >
              📖 Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'traits' && { backgroundColor: colors.surface },
            ]}
            onPress={() => setActiveTab('traits')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'traits' }}
            accessibilityLabel="Traits and scales tab"
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === 'traits' ? colors.accent : colors.textSecondary,
                  fontWeight: activeTab === 'traits' ? '700' : '500',
                },
              ]}
            >
              ⚡ Traits & Scores
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'gallery' && { backgroundColor: colors.surface },
            ]}
            onPress={() => setActiveTab('gallery')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'gallery' }}
            accessibilityLabel="Image gallery tab"
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === 'gallery' ? colors.accent : colors.textSecondary,
                  fontWeight: activeTab === 'gallery' ? '700' : '500',
                },
              ]}
            >
              🖼️ Gallery ({breed.images.length})
            </Text>
          </TouchableOpacity>
        </View>
        {activeTab === 'overview' && <OverviewTab breed={breed} />}
        {activeTab === 'traits' && <TraitScale traits={breed.traits} />}
        {activeTab === 'gallery' && (
          <GalleryCarousel images={breed.images} breedName={breed.name} />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBarWrapper: {
    borderBottomWidth: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  navBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnIcon: {
    fontSize: 14,
    fontWeight: '700',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroCard: {
    margin: 16,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  heroImageContainer: {
    width: '100%',
    height: 230,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFallbackIcon: {
    fontSize: 64,
  },
  heroMeta: {
    padding: 18,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  groupBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  groupBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  hypoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  hypoBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  breedHeroName: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  aliases: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  heroStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  heroStatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4.5,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 5,
  },
  heroStatIcon: {
    fontSize: 12,
  },
  heroStatText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
