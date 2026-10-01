import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DogApiTraits } from '../../types';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getTraitScoreLabel } from '../../utils/formatters';

interface TraitScaleProps {
  traits: DogApiTraits;
}

interface TraitMetric {
  key: keyof Omit<DogApiTraits, 'temperament' | 'exercise_minutes'>;
  label: string;
  icon: string;
}

const TRAIT_METRICS: TraitMetric[] = [
  { key: 'energy', label: 'Energy Level', icon: '⚡' },
  { key: 'trainability', label: 'Trainability', icon: '🎓' },
  { key: 'apartment_friendly', label: 'Apartment Friendly', icon: '🏢' },
  { key: 'good_with_children', label: 'Good With Children', icon: '👶' },
  { key: 'good_with_dogs', label: 'Good With Other Dogs', icon: '🐕' },
  { key: 'good_with_strangers', label: 'Good With Strangers', icon: '🤝' },
  { key: 'barking', label: 'Barking Level', icon: '🔊' },
  { key: 'shedding', label: 'Shedding Level', icon: '✂️' },
  { key: 'grooming', label: 'Grooming Needs', icon: '🛁' },
  { key: 'drooling', label: 'Drooling Tendency', icon: '💧' },
];

export const TraitScale: React.FC<TraitScaleProps> = ({ traits }) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.exerciseCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <View style={styles.exerciseLeft}>
          <Text style={styles.exerciseIcon}>🏃‍♂️</Text>
          <View>
            <Text style={[styles.exerciseTitle, { color: colors.textPrimary }]}>
              Daily Exercise Needs
            </Text>
            <Text style={[styles.exerciseSubtitle, { color: colors.textSecondary }]}>
              Recommended daily physical activity
            </Text>
          </View>
        </View>
        <View style={[styles.exerciseBadge, { backgroundColor: colors.accentLight }]}>
          <Text style={[styles.exerciseMinutes, { color: colors.accent }]}>
            {traits.exercise_minutes || 30} mins/day
          </Text>
        </View>
      </View>

      {traits.temperament && traits.temperament.length > 0 && (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Temperament & Personality
          </Text>
          <View style={styles.tagCloud}>
            {traits.temperament.map((tag, idx) => (
              <View
                key={`${tag}-${idx}`}
                style={[styles.temperamentPill, { backgroundColor: colors.accentLight }]}
              >
                <Text style={[styles.temperamentText, { color: colors.accent }]}>
                  {tag.trim()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          Behavioral & Physical Traits
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
          Rated on a scale of 1 (Minimal) to 5 (Exceptional)
        </Text>

        <View style={styles.traitsList}>
          {TRAIT_METRICS.map((metric) => {
            const rawScore = traits[metric.key] ?? 3;
            const score = Math.max(1, Math.min(5, Number(rawScore) || 3));
            const { label: scoreText, color: traitColor } = getTraitScoreLabel(score);

            return (
              <View
                key={metric.key}
                style={styles.traitItem}
                accessibilityRole="progressbar"
                accessibilityValue={{ min: 1, max: 5, now: score }}
                accessibilityLabel={`${metric.label}: ${score} out of 5, ${scoreText}`}
              >
                <View style={styles.traitHeader}>
                  <View style={styles.traitNameRow}>
                    <Text style={styles.metricIcon}>{metric.icon}</Text>
                    <Text style={[styles.traitName, { color: colors.textPrimary }]}>
                      {metric.label}
                    </Text>
                  </View>
                  <View style={styles.scoreRow}>
                    <Text style={[styles.scoreLabel, { color: traitColor }]}>
                      {scoreText}
                    </Text>
                    <View style={[styles.scoreBadge, { backgroundColor: traitColor + '20' }]}>
                      <Text style={[styles.scoreBadgeText, { color: traitColor }]}>
                        {score}/5
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.scaleTrack}>
                  {[1, 2, 3, 4, 5].map((seg) => {
                    const isFilled = seg <= score;
                    return (
                      <View
                        key={seg}
                        style={[
                          styles.scaleSegment,
                          {
                            backgroundColor: isFilled
                              ? traitColor
                              : colors.surfaceSubtle,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  exerciseTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  exerciseSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  exerciseBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  exerciseMinutes: {
    fontSize: 13,
    fontWeight: '700',
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
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  temperamentPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  temperamentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  traitsList: {
    gap: 16,
    marginTop: 6,
  },
  traitItem: {
    gap: 8,
  },
  traitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  traitNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  traitName: {
    fontSize: 14,
    fontWeight: '600',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  scoreBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  scoreBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scaleTrack: {
    flexDirection: 'row',
    height: 8,
    gap: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scaleSegment: {
    flex: 1,
    borderRadius: 4,
  },
});
