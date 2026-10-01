import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { TraitScale } from '../components/detail/TraitScale';
import { DogApiTraits } from '../types';

const mockTraits: DogApiTraits = {
  energy: 5,
  barking: 2,
  drooling: 1,
  grooming: 4,
  shedding: 3,
  temperament: ['Playful', 'Energetic', 'Devoted'],
  trainability: 4,
  good_with_dogs: 5,
  exercise_minutes: 45,
  apartment_friendly: 2,
  good_with_children: 5,
  good_with_strangers: 4,
};

describe('TraitScale component', () => {
  it('renders daily exercise recommendation and temperament tags', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<TraitScale traits={mockTraits} />);
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children);

    expect(textNodes).toContain('Playful');
    expect(textNodes).toContain('Energetic');
    expect(textNodes).toContain('Devoted');
  });

  it('renders numeric trait scales and labels', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<TraitScale traits={mockTraits} />);
    });

    const root = renderer!.root;
    const textNodes = root.findAllByType(Text).map((t) => t.props.children);

    expect(textNodes).toContain('Energy Level');
    expect(textNodes).toContain('Trainability');
    expect(textNodes).toContain('Exceptional');
  });
});
