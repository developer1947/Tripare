import React from 'react';
import { View, StyleSheet } from 'react-native';

interface FilterIconProps {
  color?: string;
  size?: number;
}

export const FilterIcon: React.FC<FilterIconProps> = ({
  color = '#4F46E5',
  size = 18,
}) => {
  const barHeight = Math.max(1.8, Math.round(size * 0.1));
  const gap = Math.max(2.5, Math.round(size * 0.14));

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessible={false}
      importantForAccessibility="no"
    >
      <View
        style={[
          styles.bar,
          {
            width: Math.round(size * 0.88),
            height: barHeight,
            backgroundColor: color,
            marginBottom: gap,
          },
        ]}
      />
      <View
        style={[
          styles.bar,
          {
            width: Math.round(size * 0.58),
            height: barHeight,
            backgroundColor: color,
            marginBottom: gap,
          },
        ]}
      />
      <View
        style={[
          styles.bar,
          {
            width: Math.round(size * 0.3),
            height: barHeight,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bar: {
    borderRadius: 2,
  },
});
