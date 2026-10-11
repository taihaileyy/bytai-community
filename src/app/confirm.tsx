import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PHOTOS, type PhotoKey } from '@/data/photos';
import { gutter, palette, radius } from '@/theme';
import { ToneProvider } from '@/theme/ToneContext';
import { FadeIn } from '@/components/Motion';
import { Photo } from '@/components/Photo';
import { T } from '@/components/Text';
import { Button, DemoBadge, Fleur, FocusStatusBar, Row } from '@/components/ui';

type Kind = 'program' | 'event' | 'donation';
const META: Record<Kind, { eyebrow: string; codeLabel: string; next: { label: string; href: string } }> = {
  program: { eyebrow: 'Enrollment confirmed', codeLabel: 'Confirmation', next: { label: 'View My Programs', href: '/my-programs' } },
  event: { eyebrow: 'Registration confirmed', codeLabel: 'Check-in code', next: { label: 'View My Events', href: '/my-events' } },
  donation: { eyebrow: 'Gift received · Demo', codeLabel: 'Receipt', next: { label: 'View Giving History', href: '/donations' } },
};

export default function Confirm() {
  const p = useLocalSearchParams<{ kind: Kind; title: string; subtitle?: string; detail?: string; code?: string; note?: string; photo?: string }>();
  const kind: Kind = p.kind && p.kind in META ? p.kind : 'program';
  const meta = META[kind];
  const photo = (p.photo && p.photo in PHOTOS ? p.photo : 'streetcar') as PhotoKey;
  const insets = useSafeAreaInsets();
  const pop = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Animated.parallel([
      Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 11, bounciness: 12 }),
      Animated.loop(Animated.timing(glow, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }), { iterations: 2 }),
    ]).start();
  }, [pop, glow]);

  const done = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <ToneProvider tone="light">
      <View style={{ flex: 1, backgroundColor: palette.ivory }}>
        <FocusStatusBar style="light" />
        <Photo photo={photo} width={1200} scrim={0.7} style={{ height: 290 + insets.top }}>
          <View style={{ position: 'absolute', top: insets.top + 10, left: gutter }}>
            <DemoBadge onImage />
          </View>
        </Photo>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.badgeWrap}>
            <Animated.View style={[styles.glow, { opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }), transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) }] }]} />
            <Animated.View style={[styles.check, { transform: [{ scale: pop }] }]}>
              <Ionicons name="checkmark" size={34} color={palette.midnight} />
            </Animated.View>
          </View>
          <FadeIn delay={200}>
            <Row gap={6} style={{ justifyContent: 'center', marginTop: 14 }}>
              <Fleur size={13} color={palette.goldDeep} />
              <T v="eyebrow" c={palette.goldDeep}>
                {meta.eyebrow}
              </T>
            </Row>
            <T v="display" center style={{ marginTop: 8 }} accessibilityRole="header">
              {p.title}
            </T>
            {p.subtitle ? (
              <T v="body" muted center style={{ marginTop: 4 }}>
                {p.subtitle}
              </T>
            ) : null}
          </FadeIn>
          <FadeIn delay={340}>
            <View style={styles.receipt}>
              {p.detail ? (
                <T v="callout" center>
                  {p.detail}
                </T>
              ) : null}
              {p.code ? (
                <>
                  <View style={styles.perf} />
                  <Row style={{ justifyContent: 'space-between' }}>
                    <T v="caption" muted>
                      {meta.codeLabel}
                    </T>
                    <T v="headline" style={{ letterSpacing: 1.4 }} selectable>
                      {p.code}
                    </T>
                  </Row>
                </>
              ) : null}
            </View>
            {p.note ? (
              <T v="caption" muted center style={{ marginTop: 10, paddingHorizontal: 16 }}>
                {p.note}
              </T>
            ) : null}
          </FadeIn>
          <View style={{ flex: 1 }} />
          <FadeIn delay={460}>
            <Button title="Done" variant="purple" onPress={done} />
            <Button
              title={meta.next.label}
              variant="ghost"
              style={{ marginTop: 6 }}
              onPress={() => {
                router.dismissAll?.();
                router.push(meta.next.href as never);
              }}
            />
          </FadeIn>
        </View>
      </View>
    </ToneProvider>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, marginTop: -30, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, backgroundColor: palette.ivory, paddingHorizontal: gutter },
  badgeWrap: { alignSelf: 'center', marginTop: -38, width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 76, height: 76, borderRadius: 38, backgroundColor: palette.gold },
  check: { width: 76, height: 76, borderRadius: 38, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: palette.ivory },
  receipt: { marginTop: 20, padding: 18, borderRadius: radius.lg, backgroundColor: palette.paper, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E3D8C6' },
  perf: { borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#D6CAB5', marginVertical: 14 },
});
