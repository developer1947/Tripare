import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

interface SectionHeaderProps {
  title: string;
  count: number;
}

function getGroupIcon(groupName: string): string {
  const norm = groupName.toLowerCase();
  if (norm.includes('toy')) return '🧸';
  if (norm.includes('hound')) return '🐕‍🦺';
  if (norm.includes('terrier')) return '🦊';
  if (norm.includes('working')) return '🦺';
  if (norm.includes('sporting') && !norm.includes('non')) return '🎾';
  if (norm.includes('herding')) return '🐑';
  if (norm.includes('non-sporting')) return '🐶';
  if (norm.includes('foundation') || norm.includes('service')) return '📜';
  return '🐾';
}

export const SectionHeader = memo<SectionHeaderProps>(({ title, count }) => {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.outerContainer,
        {
          backgroundColor: colors.background,
        },
      ]}
      accessibilityRole="header"
      accessibilityLabel={`${title}, containing ${count} ${count === 1 ? 'breed' : 'breeds'}`}
    >
      <View
        style={[
          styles.innerPill,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.borderSubtle,
            shadowColor: isDark ? '#000000' : '#475569',
            shadowOpacity: isDark ? 0.3 : 0.05,
          },
        ]}
      >
        <View style={styles.leftGroup}>
          <View style={[styles.iconBadge, { backgroundColor: colors.badgeAccentBg }]}>
            <Text style={styles.groupIcon}>{getGroupIcon(title)}</Text>
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={[styles.counterBadge, { backgroundColor: colors.badgeWarmBg }]}>
          <Text style={[styles.countText, { color: colors.badgeWarmText }]}>
            {count} {count === 1 ? 'breed' : 'breeds'}
          </Text>
        </View>
      </View>
    </View>
  );
});

SectionHeader.displayName = 'SectionHeader';

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  innerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },
  groupIcon: {
    fontSize: 14,
  },
  title: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.2,
    flex: 1,
  },
  counterBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
});
