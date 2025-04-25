import React from 'react';
import { Image, ImageSourcePropType, StyleSheet } from 'react-native';

type CustomIconProps = {
  source: ImageSourcePropType;
  size?: number;
};

export function CustomIcon({ source, size = 20 }: CustomIconProps) {
  return (
    <Image
      source={source}
      style={[
        styles.icon,
        {
          width: size,
          height: size,
        },
      ]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 20,
    height: 20,
  },
}); 