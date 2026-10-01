import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { BreedCard } from '../components/breed/BreedCard';
import { NormalizedBreed } from '../types';

const mockBreed: NormalizedBreed = {
  id: 'affenpinscher-1',
  name: 'Affenpinscher',
  description: 'Small monkey terrier',
  groupId: 'toy',
  groupName: 'Toy Group',
  sizeBand: 'small',
  coatLength: 'short',
  coatType: 'wire',
  coatColors: ['black'],
  isHypoallergenic: true,
  lifeSpanText: '14 - 16 years',
  lifeMin: 14,
  lifeMax: 16,
  maleWeightMin: 4,
  maleWeightMax: 6,
  femaleWeightMin: 4,
  femaleWeightMax: 6,
  maleHeightMin: 23,
  maleHeightMax: 30,
  femaleHeightMin: 23,
  femaleHeightMax: 30,
  originCountry: 'Germany',
  originRegion: 'Central Europe',
  originEra: '17th century',
  otherNames: ['Monkey Terrier'],
  recognizedBy: ['AKC', 'FCI'],
  sources: [],
  traits: {
    energy: 4,
    barking: 3,
    drooling: 1,
    grooming: 3,
    shedding: 2,
    temperament: ['Confident', 'Curious'],
    trainability: 3,
    good_with_dogs: 3,
    exercise_minutes: 30,
    apartment_friendly: 5,
    good_with_children: 3,
    good_with_strangers: 2,
  },
  images: [],
  thumbnailUrl: 'https://images.dogapi.dog/thumb1.jpg',
  mediumHeroUrl: 'https://images.dogapi.dog/med1.jpg',
  rawAttributes: { name: 'Affenpinscher' },
};

describe('BreedCard component', () => {
  it('renders breed details and traits correctly', () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<BreedCard breed={mockBreed} onPress={onPress} />);
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children);

    expect(textNodes).toContain('Affenpinscher');
    expect(textNodes).toContain('Hypo');
    expect(textNodes).toContain('Small');
  });

  it('triggers onPress callback when card is tapped', () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<BreedCard breed={mockBreed} onPress={onPress} />);
    });

    const root = renderer!.root;
    const touchable = root.findByProps({ accessibilityRole: 'button' });

    ReactTestRenderer.act(() => {
      touchable.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith(mockBreed);
  });

  it('renders correctly in compact mode', () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <BreedCard breed={mockBreed} onPress={onPress} viewMode="compact" />
      );
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children);

    expect(textNodes).toContain('Affenpinscher');
    expect(textNodes).toContain('Hypo');
    expect(textNodes).toContain('Small');
  });

  it('renders temperament and energy indicators in rich mode', () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <BreedCard breed={mockBreed} onPress={onPress} viewMode="rich" />
      );
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children);

    expect(textNodes).toContain('Energy Level');
    expect(textNodes).toContain('View Breed ›');
  });
});
