import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { PHOTOS, photoSource, type PhotoKey } from '@/data/photos';

/**
 * Cinematic photo: instant blurhash preview, soft fade-in, optional dark
 * gradients so type laid over the photo stays readable.
 */
export function Photo({
  photo,
  style,
  width = 900,
  scrim,
  scrimTop,
  children,
  decorative,
  position = 'center',
}: {
  photo: PhotoKey;
  style?: StyleProp<ViewStyle>;
  width?: number;
  scrim?: boolean | number;
  scrimTop?: boolean;
  children?: React.ReactNode;
  decorative?: boolean;
  position?: 'center' | 'top' | 'left' | 'right';
}) {
  const p = PHOTOS[photo];
  const s = typeof scrim === 'number' ? scrim : 0.85;
  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={photoSource(photo, width)}
        placeholder={p.blurhash ? { blurhash: p.blurhash } : undefined}
        placeholderContentFit="cover"
        contentFit="cover"
        contentPosition={position}
        transition={350}
        style={StyleSheet.absoluteFill}
        accessible={!decorative}
        accessibilityLabel={decorative ? undefined : p.alt}
        cachePolicy="memory-disk"
      />
      {scrimTop ? (
        <LinearGradient colors={['rgba(16,17,21,0.6)', 'rgba(16,17,21,0)']} style={[StyleSheet.absoluteFill, { bottom: '60%' }]} pointerEvents="none" />
      ) : null}
      {scrim ? (
        <LinearGradient
          colors={['rgba(16,17,21,0)', `rgba(16,17,21,${s * 0.55})`, `rgba(16,17,21,${s})`]}
          locations={[0.3, 0.65, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { overflow: 'hidden', backgroundColor: '#222329' } });
