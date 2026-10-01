import { useBreedStore } from '../store/useBreedStore';
import { lightColors, darkColors, ThemeColors } from '../theme';

export function useAppTheme(): {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
} {
  const isDark = useBreedStore((state) => state.isDarkMode);
  const toggleTheme = useBreedStore((state) => state.toggleTheme);
  const colors = isDark ? darkColors : lightColors;

  return {
    colors,
    isDark,
    toggleTheme,
  };
}
