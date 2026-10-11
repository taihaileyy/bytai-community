import React, { useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PhotoKey } from '@/data/photos';
import { color, radius } from '@/theme';
import { Photo } from './Photo';
import { T } from './Text';
import { FocusStatusBar, IconButton, Row } from './ui';

const HERO = 380;

/**
 * Detail page shell: parallax photo header, content sheet that slides over
 * it, floating buttons, and a compact title bar once the photo scrolls away.
 */
export function DetailLayout({
  photo,
  title,
  fallback,
  onShare,
  children,
  bottom,
}: {
  photo: PhotoKey;
  title: string;
  fallback: string;
  onShare?: () => void;
  children: React.ReactNode;
  bottom?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(0)).current;
  const translate = y.interpolate({ inputRange: [-200, 0, HERO], outputRange: [-100, 0, HERO * 0.5], extrapolate: 'clamp' });
  const scale = y.interpolate({ inputRange: [-200, 0], outputRange: [1.4, 1], extrapolate: 'clamp' });
  const bar = y.interpolate({ inputRange: [HERO - 160, HERO - 100], outputRange: [0, 1], extrapolate: 'clamp' });
  const back = () => (router.canGoBack() ? router.back() : router.replace(fallback as never));

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <FocusStatusBar style="light" />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y } } }], { useNativeDriver: true })}
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
      >
        <View style={{ height: HERO, overflow: 'hidden' }}>
          <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateY: translate }, { scale }] }]}>
            <Photo photo={photo} width={1400} scrimTop style={StyleSheet.absoluteFill} />
          </Animated.View>
        </View>
        <View style={styles.sheet}>{children}</View>
      </Animated.ScrollView>

      <Animated.View pointerEvents="none" style={[styles.compact, { height: insets.top + 54, paddingTop: insets.top, opacity: bar }]}>
        <T v="headline" numberOfLines={1} style={{ maxWidth: '62%' }}>
          {title}
        </T>
      </Animated.View>
      <Row style={[styles.floating, { top: insets.top + 6 }]} gap={0}>
        <IconButton icon="chevron-back" tone="glass" label="Back" onPress={back} />
        <View style={{ flex: 1 }} />
        {onShare ? <IconButton icon="share-outline" tone="glass" label="Share" onPress={onShare} /> : null}
      </Row>
      {bottom}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    marginTop: -28,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    backgroundColor: color.bg,
    paddingTop: 26,
  },
  compact: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(247,246,243,0.98)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floating: { position: 'absolute', left: 16, right: 16 },
});
