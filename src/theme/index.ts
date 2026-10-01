export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceSubtle: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  accentSecondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  cardBackground: string;
  cardBorder: string;
  chipBackground: string;
  chipText: string;
  chipActiveBg: string;
  chipActiveText: string;
  badgeWarmBg: string;
  badgeWarmText: string;
  badgeSuccessBg: string;
  badgeSuccessText: string;
  badgeAccentBg: string;
  badgeAccentText: string;
  headerBackground: string;
  pillBackground: string;
  pillSelected: string;
  badgeBg: string;
  badgeText: string;
  overlay: string;
  statusBar: 'light-content' | 'dark-content';
}

export const lightColors: ThemeColors = {
  background: '#F1F4F9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSubtle: '#E2E8F4',
  border: '#D5DFEC',
  borderSubtle: '#E7EEF7',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  accent: '#4F46E5',
  accentLight: '#EEF2FF',
  accentDark: '#3730A3',
  accentSecondary: '#F43F5E',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#0284C7',
  cardBackground: '#FFFFFF',
  cardBorder: '#DFE7F2',
  chipBackground: '#E6EDF7',
  chipText: '#1E293B',
  chipActiveBg: '#4F46E5',
  chipActiveText: '#FFFFFF',
  badgeWarmBg: '#FEF3C7',
  badgeWarmText: '#B45309',
  badgeSuccessBg: '#DCFCE7',
  badgeSuccessText: '#15803D',
  badgeAccentBg: '#EEF2FF',
  badgeAccentText: '#4338CA',
  headerBackground: '#FFFFFF',
  pillBackground: '#E6EDF7',
  pillSelected: '#4F46E5',
  badgeBg: '#EEF2FF',
  badgeText: '#4338CA',
  overlay: 'rgba(15, 23, 42, 0.65)',
  statusBar: 'dark-content',
};

export const darkColors: ThemeColors = {
  background: '#070A11',
  surface: '#101726',
  surfaceElevated: '#182238',
  surfaceSubtle: '#162034',
  border: '#1E2B45',
  borderSubtle: '#141D30',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  accent: '#6366F1',
  accentLight: '#1E1B4B',
  accentDark: '#4338CA',
  accentSecondary: '#22D3EE',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  info: '#38BDF8',
  cardBackground: '#101726',
  cardBorder: '#1D2A42',
  chipBackground: '#162034',
  chipText: '#CBD5E1',
  chipActiveBg: '#6366F1',
  chipActiveText: '#FFFFFF',
  badgeWarmBg: 'rgba(245, 158, 11, 0.20)',
  badgeWarmText: '#FBBF24',
  badgeSuccessBg: 'rgba(16, 185, 129, 0.20)',
  badgeSuccessText: '#34D399',
  badgeAccentBg: 'rgba(99, 102, 241, 0.22)',
  badgeAccentText: '#A5B4FC',
  headerBackground: '#101726',
  pillBackground: '#162034',
  pillSelected: '#6366F1',
  badgeBg: '#1E1B4B',
  badgeText: '#C7D2FE',
  overlay: 'rgba(0, 0, 0, 0.82)',
  statusBar: 'light-content',
};

export const typography = {
  fontSizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    hero: 28,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  lineHeights: {
    xs: 14,
    sm: 18,
    md: 22,
    lg: 24,
    xl: 28,
    xxl: 32,
    hero: 36,
  },
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};
