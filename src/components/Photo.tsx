import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { PHOTOS, photoUri, type PhotoKey } from '@/data/photos';

/**
 * Photo with an instant blurhash preview and a soft fade-in. `scrim` adds a
 * bottom gradient so white text on top of the photo stays readable.
 */
export function Photo({
  photo,
  style,
  width = 900,
  scrim,
  scrimTop,
  children,
  decorative,
}: {
  photo: PhotoKey;
  style?: StyleProp<ViewStyle>;
  width?: number;
  scrim?: boolean | number;
  scrimTop?: boolean;
  children?: React.ReactNode;
  decorative?: boolean;
}) {
  const p = PHOTOS[photo];
  const strength = typeof scrim === 'number' ? scrim : 0.72;
  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={{ uri: photoUri(photo, width) }}
        placeholder={{ blurhash: p.blurhash }}
        placeholderContentFit="cover"
        contentFit="cover"
        transition={350}
        style={StyleSheet.absoluteFill}
        accessible={!decorative}
        accessibilityLabel={decorative ? undefined : p.alt}
        cachePolicy="memory-disk"
      />
      {scrimTop ? (
        <LinearGradient
          colors={['rgba(10,10,12,0.45)', 'rgba(10,10,12,0)']}
          style={[StyleSheet.absoluteFill, { bottom: '65%' }]}
          pointerEvents="none"
        />
      ) : null}
      {scrim ? (
        <LinearGradient
          colors={['rgba(10,10,12,0)', `rgba(10,10,12,${strength * 0.55})`, `rgba(10,10,12,${strength})`]}
          locations={[0.35, 0.7, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: '#DDD8CF' },
});
