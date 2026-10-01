import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useBreedStore } from '../store/useBreedStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { lightColors, darkColors } from '../theme';

function TestThemeConsumer({
  onThemeChange,
}: {
  onThemeChange: (theme: ReturnType<typeof useAppTheme>) => void;
}) {
  const theme = useAppTheme();
  React.useEffect(() => {
    onThemeChange(theme);
  }, [theme, onThemeChange]);
  return null;
}

describe('useAppTheme', () => {
  beforeEach(() => {
    useBreedStore.setState({ isDarkMode: false });
  });

  it('defaults to light theme with ice-platinum background and white cards', () => {
    let currentTheme: ReturnType<typeof useAppTheme> | undefined;

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(
        <TestThemeConsumer onThemeChange={(t) => (currentTheme = t)} />
      );
    });

    expect(currentTheme).toBeDefined();
    expect(currentTheme!.isDark).toBe(false);
    expect(currentTheme!.colors.background).toBe('#F1F4F9');
    expect(currentTheme!.colors.cardBackground).toBe('#FFFFFF');
    expect(currentTheme!.colors.surface).toBe('#FFFFFF');
  });

  it('correctly toggles to dark theme and back to light theme', () => {
    let currentTheme: ReturnType<typeof useAppTheme> | undefined;

    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(
        <TestThemeConsumer onThemeChange={(t) => (currentTheme = t)} />
      );
    });

    expect(currentTheme!.isDark).toBe(false);
    expect(currentTheme!.colors).toEqual(lightColors);

    ReactTestRenderer.act(() => {
      currentTheme!.toggleTheme();
    });

    expect(currentTheme!.isDark).toBe(true);
    expect(currentTheme!.colors).toEqual(darkColors);
    expect(currentTheme!.colors.background).toBe('#070A11');

    ReactTestRenderer.act(() => {
      currentTheme!.toggleTheme();
    });

    expect(currentTheme!.isDark).toBe(false);
    expect(currentTheme!.colors).toEqual(lightColors);
    expect(currentTheme!.colors.background).toBe('#F1F4F9');
  });
});
