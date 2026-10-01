import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { NormalizedBreed } from '../../types';
import { useAppTheme } from '../../hooks/useAppTheme';
import { formatRange, capitalize } from '../../utils/formatters';

interface OverviewTabProps {
  breed: NormalizedBreed;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ breed }) => {
  const { colors } = useAppTheme();

  const openLink = async (url: string) => {
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          About the Breed
        </Text>
        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
          {breed.description}
        </Text>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Vital Statistics
        </Text>

        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: colors.surfaceSubtle }]}>
            <Text style={styles.statIcon}>⏳</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Life Expectancy
            </Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {breed.lifeSpanText}
            </Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.surfaceSubtle }]}>
            <Text style={styles.statIcon}>📏</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Size Class
            </Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {capitalize(breed.sizeBand)}
            </Text>
          </View>
        </View>

        <View style={styles.measurementsBlock}>
          <Text style={[styles.measurementHeader, { color: colors.textPrimary }]}>
            Weight Ranges (kg)
          </Text>
          <View style={styles.measureRow}>
            <View style={[styles.measurePill, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.genderTag, { color: colors.accent }]}>♂ Male</Text>
              <Text style={[styles.measureValue, { color: colors.textSecondary }]}>
                {formatRange(breed.maleWeightMin, breed.maleWeightMax, 'kg')}
              </Text>
            </View>
            <View style={[styles.measurePill, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.genderTag, { color: colors.accentSecondary }]}>♀ Female</Text>
              <Text style={[styles.measureValue, { color: colors.textSecondary }]}>
                {formatRange(breed.femaleWeightMin, breed.femaleWeightMax, 'kg')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.measurementsBlock}>
          <Text style={[styles.measurementHeader, { color: colors.textPrimary }]}>
            Height Ranges (cm)
          </Text>
          <View style={styles.measureRow}>
            <View style={[styles.measurePill, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.genderTag, { color: colors.accent }]}>♂ Male</Text>
              <Text style={[styles.measureValue, { color: colors.textSecondary }]}>
                {formatRange(breed.maleHeightMin, breed.maleHeightMax, 'cm')}
              </Text>
            </View>
            <View style={[styles.measurePill, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.genderTag, { color: colors.accentSecondary }]}>♀ Female</Text>
              <Text style={[styles.measureValue, { color: colors.textSecondary }]}>
                {formatRange(breed.femaleHeightMin, breed.femaleHeightMax, 'cm')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Heritage & Origin
        </Text>

        <View style={styles.originList}>
          <View style={styles.originItem}>
            <Text style={[styles.originKey, { color: colors.textMuted }]}>Country:</Text>
            <Text style={[styles.originVal, { color: colors.textPrimary }]}>
              🌍 {breed.originCountry || 'Global / Unrecorded'}
            </Text>
          </View>

          {breed.originRegion ? (
            <View style={styles.originItem}>
              <Text style={[styles.originKey, { color: colors.textMuted }]}>Region:</Text>
              <Text style={[styles.originVal, { color: colors.textPrimary }]}>
                📍 {breed.originRegion}
              </Text>
            </View>
          ) : null}

          {breed.originEra ? (
            <View style={styles.originItem}>
              <Text style={[styles.originKey, { color: colors.textMuted }]}>Era:</Text>
              <Text style={[styles.originVal, { color: colors.textPrimary }]}>
                🏛️ {breed.originEra}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Coat & Colors
        </Text>

        <View style={styles.coatStatsRow}>
          <View style={[styles.coatStatBox, { backgroundColor: colors.surfaceSubtle }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Coat Type</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {capitalize(breed.coatType)}
            </Text>
          </View>
          <View style={[styles.coatStatBox, { backgroundColor: colors.surfaceSubtle }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Length</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {capitalize(breed.coatLength)}
            </Text>
          </View>
        </View>

        {breed.coatColors.length > 0 && (
          <View style={styles.colorsWrap}>
            <Text style={[styles.colorsTitle, { color: colors.textSecondary }]}>
              Recognized Colors:
            </Text>
            <View style={styles.tagWrap}>
              {breed.coatColors.map((color, i) => (
                <View
                  key={i}
                  style={[styles.colorTag, { backgroundColor: colors.surfaceSubtle }]}
                >
                  <Text style={[styles.colorTagText, { color: colors.textPrimary }]}>
                    {color}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
      {breed.recognizedBy.length > 0 && (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Recognizing Kennel Clubs
          </Text>
          <View style={styles.tagWrap}>
            {breed.recognizedBy.map((club, idx) => (
              <View
                key={idx}
                style={[styles.clubBadge, { backgroundColor: colors.badgeBg }]}
              >
                <Text style={[styles.clubText, { color: colors.badgeText }]}>
                  {club}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {breed.sources.length > 0 && (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Official Standards & Literature
          </Text>
          <View style={styles.sourcesList}>
            {breed.sources.map((src, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.sourceItem, { borderBottomColor: colors.borderSubtle }]}
                onPress={() => openLink(src.url)}
                accessibilityRole="link"
                accessibilityLabel={`${src.title}. Opens external official standard document.`}
              >
                <Text style={[styles.sourceTitle, { color: colors.accent }]} numberOfLines={2}>
                  📄 {src.title || 'Official Breed Standard'} ↗
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  measurementsBlock: {
    marginBottom: 14,
  },
  measurementHeader: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  measureRow: {
    flexDirection: 'row',
    gap: 8,
  },
  measurePill: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  genderTag: {
    fontSize: 12,
    fontWeight: '700',
  },
  measureValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  originList: {
    gap: 8,
  },
  originItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originKey: {
    fontSize: 13,
    width: 70,
    fontWeight: '500',
  },
  originVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  coatStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  coatStatBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  colorsWrap: {
    marginTop: 4,
  },
  colorsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  colorTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  colorTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  clubBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clubText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sourcesList: {
    gap: 8,
  },
  sourceItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  sourceTitle: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
