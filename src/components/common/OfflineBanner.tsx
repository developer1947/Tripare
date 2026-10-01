import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useBreedStore } from '../../store/useBreedStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import { formatLastSynced } from '../../utils/formatters';
import { SyncIcon } from './SyncIcon';

export const OfflineBanner: React.FC = () => {
  const { colors } = useAppTheme();
  const isOffline = useBreedStore((state) => state.isOffline);
  const isSyncing = useBreedStore((state) => state.isSyncing);
  const partialFailure = useBreedStore((state) => state.partialFailure);
  const lastSyncedAt = useBreedStore((state) => state.lastSyncedAt);
  const syncProgress = useBreedStore((state) => state.syncProgress);
  const syncData = useBreedStore((state) => state.syncData);

  if (isSyncing) {
    return (
      <View
        style={[styles.container, { backgroundColor: colors.info + '18', borderColor: colors.info + '40' }]}
        accessibilityRole="summary"
        accessibilityLabel={`Syncing breeds. ${syncProgress.loaded} of ${syncProgress.total} loaded.`}
      >
        <ActivityIndicator size="small" color={colors.info} style={styles.indicator} />
        <Text style={[styles.text, { color: colors.info }]}>
          Syncing breed catalog ({syncProgress.loaded} / {syncProgress.total})...
        </Text>
      </View>
    );
  }

  if (isOffline) {
    return (
      <View
        style={[styles.container, { backgroundColor: colors.warning + '20', borderColor: colors.warning + '50' }]}
        accessibilityRole="alert"
        accessibilityLabel={`Offline mode. Showing cached data. ${formatLastSynced(lastSyncedAt)}.`}
      >
        <Text style={styles.icon}>📡</Text>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.warning }]}>
            Offline Mode • Showing Cached Data
          </Text>
          <Text style={[styles.subtext, { color: colors.textSecondary }]}>
            {formatLastSynced(lastSyncedAt)}
          </Text>
        </View>
      </View>
    );
  }

  if (partialFailure) {
    return (
      <View
        style={[styles.container, { backgroundColor: colors.danger + '18', borderColor: colors.danger + '40' }]}
        accessibilityRole="alert"
      >
        <Text style={styles.icon}>⚠️</Text>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.danger }]}>
            Partial sync failure on some pages
          </Text>
          <Text style={[styles.subtext, { color: colors.textSecondary }]}>
            Cached breeds remain available
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: colors.danger }]}
          onPress={() => syncData(true)}
          accessibilityRole="button"
          accessibilityLabel="Retry syncing failed pages"
        >
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.metaBar,
        {
          backgroundColor: colors.surfaceSubtle,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderSubtle,
        },
      ]}
    >
      <View style={styles.statusDotRow}>
        <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
          Online • {formatLastSynced(lastSyncedAt)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => syncData(true)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Refresh dog catalog"
        activeOpacity={0.75}
        style={[
          styles.syncBtnRow,
          {
            backgroundColor: colors.badgeAccentBg,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <SyncIcon color={colors.accent} size={12} strokeWidth={1.8} />
        <Text style={[styles.syncLink, { color: colors.accent }]}>Sync Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  indicator: {
    marginRight: 10,
  },
  icon: {
    fontSize: 16,
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  subtext: {
    fontSize: 11,
    marginTop: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  retryBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  metaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  syncLink: {
    fontSize: 11,
    fontWeight: '700',
  },
  syncBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 0.5,
  },
});
