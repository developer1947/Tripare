import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, SectionList } from 'react-native';
import { BreedListScreen } from '../screens/BreedListScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
} as any;

const mockRoute = {
  key: 'breed-list-key',
  name: 'BreedList',
} as any;

describe('BreedListScreen', () => {
  it('renders sections and breed items without being empty', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          <BreedListScreen navigation={mockNavigation} route={mockRoute} />
        </SafeAreaProvider>
      );
    });

    const root = renderer!.root;

    const texts = root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Tripare Dog Explorer');

    const sectionList = root.findByType(SectionList);
    expect(sectionList).toBeDefined();
    expect(sectionList.props.sections.length).toBeGreaterThan(0);

    const totalBreedsInSections = sectionList.props.sections.reduce(
      (acc: number, curr: any) => acc + curr.data.length,
      0
    );
    expect(totalBreedsInSections).toBe(283);

    ReactTestRenderer.act(() => {
      renderer!.unmount();
    });
  });

  it('renders view toggle buttons and allows switching to compact list mode', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          <BreedListScreen navigation={mockNavigation} route={mockRoute} />
        </SafeAreaProvider>
      );
    });

    const root = renderer!.root;
    const compactToggle = root.findByProps({ accessibilityLabel: 'Switch to compact list layout' });
    expect(compactToggle).toBeDefined();

    ReactTestRenderer.act(() => {
      compactToggle.props.onPress();
    });

    const cardsToggle = root.findByProps({ accessibilityLabel: 'Switch to rich cards layout' });
    expect(cardsToggle).toBeDefined();

    ReactTestRenderer.act(() => {
      cardsToggle.props.onPress();
    });

    ReactTestRenderer.act(() => {
      renderer!.unmount();
    });
  });

  it('renders filter icon button in header and allows opening filter sheet', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          <BreedListScreen navigation={mockNavigation} route={mockRoute} />
        </SafeAreaProvider>
      );
    });

    const root = renderer!.root;
    const filterBtn = root.findByProps({ accessibilityLabel: 'Filter options' });
    expect(filterBtn).toBeDefined();

    ReactTestRenderer.act(() => {
      filterBtn.props.onPress();
    });

    ReactTestRenderer.act(() => {
      renderer!.unmount();
    });
  });
});
