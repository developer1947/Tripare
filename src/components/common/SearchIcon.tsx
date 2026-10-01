import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SearchIconProps {
  color?: string;
  size?: number;
  strokeWidth?: number;
}

export const SearchIcon: React.FC<SearchIconProps> = ({
  color = '#64748B',
  size = 18,
  strokeWidth = 2,
}) => {
  const lensDiameter = Math.round(size * 0.62);
  const handleHeight = Math.round(size * 0.38);

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessible={false}
      importantForAccessibility="no"
    >
      <View
        style={[
          styles.lens,
          {
            width: lensDiameter,
            height: lensDiameter,
            borderRadius: lensDiameter / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            top: 1,
            left: 1,
          },
        ]}
      />
      <View
        style={[
          styles.handle,
          {
            width: strokeWidth,
            height: handleHeight,
            backgroundColor: color,
            borderRadius: strokeWidth / 2,
            bottom: 1.5,
            right: 2.5,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lens: {
    position: 'absolute',
  },
  handle: {
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
  },
});
