import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface SyncIconProps {
  color?: string;
  size?: number;
  strokeWidth?: number;
}

export const SyncIcon: React.FC<SyncIconProps> = ({
  color = '#4F46E5',
  size = 14,
}) => {
  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessible={false}
      importantForAccessibility="no"
    >
      <Image
        source={require('../../assets/sync_icon.png')}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            tintColor: color,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
