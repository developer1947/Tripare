import React, { memo, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { NormalizedBreed, SizeBand } from '../../types';
import { useAppTheme } from '../../hooks/useAppTheme';
import { capitalize, formatRange } from '../../utils/formatters';

interface BreedCardProps {
  breed: NormalizedBreed;
  onPress: (breed: NormalizedBreed) => void;
  viewMode?: 'rich' | 'compact';
}

function getSizeIcon(size: SizeBand): string {
  switch (size) {
    case 'small':
      return '🐕';
    case 'medium':
      return '🐩';
    case 'large':
      return '🦮';
    case 'giant':
      return '🦁';
    default:
      return '🐾';
  }
}

export const BreedCard = memo<BreedCardProps>(({ breed, onPress, viewMode = 'rich' }) => {
  const { colors, isDark } = useAppTheme();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const arrowTranslateX = useRef(new Animated.Value(0)).current;
  const imageOpacity = useRef(new Animated.Value(breed.thumbnailUrl ? 0 : 1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.975,
        useNativeDriver: true,
        speed: 40,
        bounciness: 3,
      }),
      Animated.timing(arrowTranslateX, {
        toValue: 4,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 6,
      }),
      Animated.timing(arrowTranslateX, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleImageLoad = () => {
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    onPress(breed);
  };

  const lifeSpan = useMemo(() => {
    if (breed.lifeSpanText) return breed.lifeSpanText;
    if (breed.lifeMin > 0 || breed.lifeMax > 0) {
      return formatRange(breed.lifeMin, breed.lifeMax, 'years');
    }
    return null;
  }, [breed.lifeSpanText, breed.lifeMin, breed.lifeMax]);

  const weight = useMemo(() => {
    if (breed.maleWeightMin > 0 || breed.maleWeightMax > 0) {
      return formatRange(breed.maleWeightMin, breed.maleWeightMax, 'kg');
    }
    if (breed.femaleWeightMin > 0 || breed.femaleWeightMax > 0) {
      return formatRange(breed.femaleWeightMin, breed.femaleWeightMax, 'kg');
    }
    return null;
  }, [breed.maleWeightMin, breed.maleWeightMax, breed.femaleWeightMin, breed.femaleWeightMax]);

  const temperaments = useMemo(() => {
    if (breed.traits?.temperament && Array.isArray(breed.traits.temperament)) {
      return breed.traits.temperament.slice(0, 3);
    }
    return [];
  }, [breed.traits?.temperament]);

  const accessibilityLabel = `${breed.name}, ${breed.groupName}, ${breed.sizeBand} size, ${
    breed.isHypoallergenic ? 'Hypoallergenic, ' : ''
  }energy rating ${breed.traits.energy} of 5. Tap to view detailed breed profile.`;

  if (viewMode === 'compact') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.compactCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
              shadowColor: isDark ? '#000000' : '#475569',
              shadowOpacity: isDark ? 0.35 : 0.06,
            },
          ]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint="Navigates to breed details"
        >
          <View
            style={[
              styles.compactImageContainer,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            {breed.thumbnailUrl ? (
              <Animated.Image
                source={{ uri: breed.thumbnailUrl }}
                style={[styles.compactImage, { opacity: imageOpacity }]}
                resizeMode="cover"
                onLoad={handleImageLoad}
              />
            ) : (
              <Text style={styles.compactFallbackIcon}>🐕</Text>
            )}
          </View>

          <View style={styles.compactDetails}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.name, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {breed.name}
              </Text>
              {breed.isHypoallergenic && (
                <View style={[styles.hypoBadge, { backgroundColor: colors.badgeSuccessBg }]}>
                  <Text style={styles.badgeIcon}>✨ </Text>
                  <Text style={[styles.hypoText, { color: colors.badgeSuccessText }]}>
                    Hypo
                  </Text>
                </View>
              )}
            </View>

            {breed.otherNames.length > 0 ? (
              <Text
                style={[styles.akaText, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                aka: {breed.otherNames.join(', ')}
              </Text>
            ) : (
              <Text
                style={[styles.groupSubtitle, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {breed.groupName}
              </Text>
            )}

            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.traitBadge,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle },
                ]}
              >
                <Text style={styles.badgeIcon}>{getSizeIcon(breed.sizeBand)} </Text>
                <Text style={[styles.traitBadgeText, { color: colors.textSecondary }]}>
                  {capitalize(breed.sizeBand)}
                </Text>
              </View>

              <View
                style={[
                  styles.traitBadge,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle },
                ]}
              >
                <Text style={[styles.traitBadgeText, { color: colors.textSecondary }]}>
                  {capitalize(breed.coatLength)} coat
                </Text>
              </View>

              <View
                style={[
                  styles.traitBadge,
                  { backgroundColor: colors.badgeAccentBg, borderColor: 'transparent' },
                ]}
              >
                <Text style={[styles.traitBadgeText, { color: colors.accent, fontWeight: '700' }]}>
                  ⚡ {breed.traits.energy}/5
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.arrowContainer,
              { backgroundColor: colors.surfaceSubtle },
            ]}
          >
            <Animated.Text
              style={[
                styles.arrow,
                {
                  color: colors.textMuted,
                  transform: [{ translateX: arrowTranslateX }],
                },
              ]}
            >
              ›
            </Animated.Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Default Rich Card Container with Tactile Animations
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.richCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.cardBorder,
            shadowColor: isDark ? '#000000' : '#475569',
            shadowOpacity: isDark ? 0.42 : 0.08,
          },
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Navigates to breed details"
      >
        <View style={styles.richHeaderRow}>
          <View
            style={[
              styles.richImageWrapper,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            {breed.thumbnailUrl ? (
              <Animated.Image
                source={{ uri: breed.thumbnailUrl }}
                style={[styles.richImage, { opacity: imageOpacity }]}
                resizeMode="cover"
                onLoad={handleImageLoad}
              />
            ) : (
              <View style={styles.richFallbackBox}>
                <Text style={styles.richFallbackIcon}>🐕</Text>
                <Text style={[styles.richFallbackLabel, { color: colors.textMuted }]}>
                  {capitalize(breed.sizeBand)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.richDetailsColumn}>
            <View style={styles.richTopBadges}>
              <View
                style={[
                  styles.groupTagPill,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle },
                ]}
              >
                <Text style={[styles.groupTagText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {breed.groupName}
                </Text>
              </View>

              {breed.isHypoallergenic && (
                <View
                  style={[
                    styles.hypoBadge,
                    { backgroundColor: colors.badgeSuccessBg },
                  ]}
                >
                  <Text style={styles.badgeIcon}>✨ </Text>
                  <Text style={[styles.hypoText, { color: colors.badgeSuccessText }]}>
                    Hypo
                  </Text>
                </View>
              )}
            </View>

            <Text
              style={[styles.name, { color: colors.textPrimary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {breed.name}
            </Text>

            {breed.otherNames.length > 0 ? (
              <Text
                style={[styles.akaText, { color: colors.textMuted }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                aka: {breed.otherNames.join(', ')}
              </Text>
            ) : breed.originCountry ? (
              <Text
                style={[styles.originText, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                📍 {breed.originCountry}
              </Text>
            ) : (
              <Text
                style={[styles.groupSubtitle, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {breed.groupName}
              </Text>
            )}

            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.traitBadge,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle },
                ]}
              >
                <Text style={styles.badgeIcon}>{getSizeIcon(breed.sizeBand)} </Text>
                <Text style={[styles.traitBadgeText, { color: colors.textSecondary }]}>
                  {capitalize(breed.sizeBand)}
                </Text>
              </View>

              <View
                style={[
                  styles.traitBadge,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle },
                ]}
              >
                <Text style={[styles.traitBadgeText, { color: colors.textSecondary }]}>
                  {capitalize(breed.coatLength)} coat
                </Text>
              </View>
            </View>
          </View>
        </View>

        {temperaments.length > 0 && (
          <View style={styles.temperamentRow}>
            {temperaments.map((trait, index) => (
              <View
                key={index}
                style={[
                  styles.temperamentChip,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle },
                ]}
              >
                <Text style={[styles.temperamentText, { color: colors.textSecondary }]}>
                  ✨ {trait}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View
          style={[
            styles.energyRowContainer,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <View style={styles.energyLabelGroup}>
            <Text style={styles.energyBolt}>⚡</Text>
            <Text style={[styles.energyHeading, { color: colors.textSecondary }]}>
              Energy Level
            </Text>
            <Text style={[styles.energyValueText, { color: colors.accent }]}>
              {breed.traits.energy}/5
            </Text>
          </View>

          <View style={styles.energyPipsBar}>
            {[1, 2, 3, 4, 5].map((pip) => (
              <View
                key={pip}
                style={[
                  styles.energyPip,
                  {
                    backgroundColor:
                      pip <= breed.traits.energy
                        ? colors.accent
                        : (isDark ? '#222E45' : '#D1D9E6'),
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={[styles.richCardFooter, { borderTopColor: colors.borderSubtle }]}>
          <View style={styles.vitalsGroup}>
            {lifeSpan && (
              <View style={styles.vitalPill}>
                <Text style={styles.vitalIcon}>⏳</Text>
                <Text style={[styles.vitalValue, { color: colors.textMuted }]}>
                  {lifeSpan}
                </Text>
              </View>
            )}
            {weight && (
              <View style={styles.vitalPill}>
                <Text style={styles.vitalIcon}>⚖️</Text>
                <Text style={[styles.vitalValue, { color: colors.textMuted }]}>
                  {weight}
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.exploreBtn, { backgroundColor: colors.badgeAccentBg }]}>
            <Animated.View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                transform: [{ translateX: arrowTranslateX }],
              }}
            >
              <Text style={[styles.exploreBtnText, { color: colors.accent }]}>
                View Breed ›
              </Text>
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

BreedCard.displayName = 'BreedCard';

const styles = StyleSheet.create({
  richCard: {
    marginHorizontal: 16,
    marginVertical: 7,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  richHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  richImageWrapper: {
    width: 90,
    height: 90,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  richImage: {
    width: '100%',
    height: '100%',
  },
  richFallbackBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  richFallbackIcon: {
    fontSize: 34,
  },
  richFallbackLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  richDetailsColumn: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  richTopBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  groupTagPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    maxWidth: '70%',
  },
  groupTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  originText: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  akaText: {
    fontSize: 12,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  groupSubtitle: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  traitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  traitBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeIcon: {
    fontSize: 10,
  },
  hypoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  hypoText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  temperamentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  temperamentChip: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  temperamentText: {
    fontSize: 11,
    fontWeight: '600',
  },
  energyRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 0.5,
    marginTop: 10,
  },
  energyLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  energyBolt: {
    fontSize: 13,
  },
  energyHeading: {
    fontSize: 12,
    fontWeight: '600',
  },
  energyValueText: {
    fontSize: 12,
    fontWeight: '800',
  },
  energyPipsBar: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  energyPip: {
    width: 14,
    height: 6,
    borderRadius: 3,
  },
  richCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 11,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  vitalsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    flexWrap: 'wrap',
  },
  vitalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vitalIcon: {
    fontSize: 12,
  },
  vitalValue: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  exploreBtn: {
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 10,
    flexShrink: 0,
  },
  exploreBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 5,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  compactImageContainer: {
    width: 68,
    height: 68,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  compactFallbackIcon: {
    fontSize: 30,
  },
  compactDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  compactSubtext: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  compactBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: -2,
    marginLeft: 1,
  },
});
