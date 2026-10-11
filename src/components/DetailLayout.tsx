import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PhotoKey } from '@/data/photos';
import { palette, radius } from '@/theme';
import { ToneProvider } from '@/theme/ToneContext';
import { Photo } from './Photo';
import { T } from './Text';
import { FocusStatusBar, IconButton, Row } from './ui';

/**
 * Detail page: cinematic photo header with parallax, an ivory panel with
 * rounded upper corners that slides over it, floating back / save / share
 * buttons, and a compact title bar once the photo scrolls away.
 */
export function DetailLayout({
  photo,
  title,
  fallback,
  onShare,
  children,
  bottom,
  heroHeight = 340,
  position,
}: {
  photo: PhotoKey;
  title: string;
  fallback: string;
  onShare?: () => void;
  children: React.ReactNode;
  bottom?: React.ReactNode;
  heroHeight?: number;
  position?: 'center' | 'top';
}) {
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(0)).current;
  const [saved, setSaved] = useState(false);
  const H = heroHeight;
  const translate = y.interpolate({ inputRange: [-200, 0, H], outputRange: [-100, 0, H * 0.5], extrapolate: 'clamp' });
  const scale = y.interpolate({ inputRange: [-200, 0], outputRange: [1.4, 1], extrapolate: 'clamp' });
  const bar = y.interpolate({ inputRange: [H - 150, H - 90], outputRange: [0, 1], extrapolate: 'clamp' });
  const back = () => (router.canGoBack() ? router.back() : router.replace(fallback as never));

  return (
    <ToneProvider tone="light">
      <View style={{ flex: 1, backgroundColor: palette.midnight }}>
        <FocusStatusBar style="light" />
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y } } }], { useNativeDriver: true })}
          contentContainerStyle={{ paddingBottom: 0 }}
          style={{ backgroundColor: 'transparent' }}
        >
          <View style={{ height: H, overflow: 'hidden' }}>
            <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateY: translate }, { scale }] }]}>
              <Photo photo={photo} width={1400} scrimTop position={position} style={StyleSheet.absoluteFill} />
            </Animated.View>
          </View>
          <View style={[styles.sheet, { paddingBottom: 130 + insets.bottom }]}>{children}</View>
        </Animated.ScrollView>

        <Animated.View pointerEvents="none" style={[styles.compact, { height: insets.top + 54, paddingTop: insets.top, opacity: bar }]}>
          <T v="title3" numberOfLines={1} c={palette.ivory} style={{ maxWidth: '62%' }}>
            {title}
          </T>
        </Animated.View>
        <Row style={[styles.floating, { top: insets.top + 6 }]} gap={8}>
          <IconButton icon="arrow-back" tone="glass" label="Back" onPress={back} />
          <View style={{ flex: 1 }} />
          {onShare ? <IconButton icon="share-outline" tone="glass" label="Share" onPress={onShare} /> : null}
          <IconButton
            icon={saved ? 'heart' : 'heart-outline'}
            tone="glass"
            color={saved ? palette.gold : palette.ivory}
            label={saved ? 'Saved' : 'Save'}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setSaved(!saved);
            }}
          />
        </Row>
        {bottom}
      </View>
    </ToneProvider>
  );
}

const styles = StyleSheet.create({
  sheet: { marginTop: -30, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, backgroundColor: palette.ivory, paddingTop: 24, minHeight: 600 },
  compact: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(16,17,21,0.96)', alignItems: 'center', justifyContent: 'center' },
  floating: { position: 'absolute', left: 16, right: 16 },
});
