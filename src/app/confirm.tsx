import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PHOTOS, type PhotoKey } from '@/data/photos';
import { color, gutter, radius } from '@/theme';
import { FadeIn } from '@/components/Motion';
import { Photo } from '@/components/Photo';
import { T } from '@/components/Text';
import { Button, DemoBadge, FocusStatusBar, Row } from '@/components/ui';

type Kind = 'program' | 'event' | 'donation';

const META: Record<Kind, { eyebrow: string; codeLabel: string; next: { label: string; href: string } }> = {
  program: { eyebrow: 'Enrollment confirmed', codeLabel: 'Confirmation', next: { label: 'View my programs', href: '/account' } },
  event: { eyebrow: 'RSVP confirmed', codeLabel: 'Check-in code', next: { label: 'See my events', href: '/account' } },
  donation: { eyebrow: 'Gift received · Demo', codeLabel: 'Receipt', next: { label: 'View giving history', href: '/donations' } },
};

export default function Confirm() {
  const p = useLocalSearchParams<{ kind: Kind; title: string; subtitle?: string; detail?: string; code?: string; note?: string; photo?: string }>();
  const kind: Kind = p.kind && p.kind in META ? p.kind : 'program';
  const meta = META[kind];
  const photo = (p.photo && p.photo in PHOTOS ? p.photo : 'hero') as PhotoKey;
  const insets = useSafeAreaInsets();
  const pop = useRef(new Animated.Value(0)).current;
  const draw = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Animated.sequence([
      Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 10 }),
      Animated.timing(draw, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [pop, draw]);

  const done = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <FocusStatusBar style="light" />
      <Photo photo={photo} width={1200} scrim={0.55} style={{ height: 300 + insets.top }}>
        <View style={{ position: 'absolute', top: insets.top + 10, left: gutter }}>
          <DemoBadge onImage />
        </View>
      </Photo>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <Animated.View style={[styles.check, { transform: [{ scale: pop }] }]} accessibilityLabel="Success">
          <Animated.View style={{ opacity: draw, transform: [{ scale: draw.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }}>
            <Ionicons name="checkmark" size={34} color={color.white} />
          </Animated.View>
        </Animated.View>

        <FadeIn delay={200}>
          <T v="overline" c={color.accent} center style={{ marginTop: 18 }}>
            {meta.eyebrow}
          </T>
          <T v="largeTitle" center style={{ marginTop: 8 }} accessibilityRole="header">
            {p.title}
          </T>
          {p.subtitle ? (
            <T v="body" muted center style={{ marginTop: 6 }}>
              {p.subtitle}
            </T>
          ) : null}
        </FadeIn>

        <FadeIn delay={340}>
          <View style={styles.receipt}>
            {p.detail ? (
              <T v="callout" c={color.ink2} center>
                {p.detail}
              </T>
            ) : null}
            {p.code ? (
              <>
                <View style={styles.perf}>
                  <View style={[styles.notch, { left: -27 }]} />
                  <View style={[styles.notch, { right: -27 }]} />
                </View>
                <Row style={{ justifyContent: 'space-between' }}>
                  <T v="caption" muted>
                    {meta.codeLabel}
                  </T>
                  <T v="headline" style={{ letterSpacing: 1.2 }} selectable>
                    {p.code}
                  </T>
                </Row>
              </>
            ) : null}
          </View>
          {p.note ? (
            <T v="caption" muted center style={{ marginTop: 12, paddingHorizontal: 16 }}>
              {p.note}
            </T>
          ) : null}
        </FadeIn>

        <View style={{ flex: 1 }} />
        <FadeIn delay={460}>
          <Button title="Done" onPress={done} />
          <Button
            title={meta.next.label}
            variant="tertiary"
            style={{ marginTop: 6 }}
            onPress={() => {
              router.dismissAll?.();
              router.navigate(meta.next.href as never);
            }}
          />
        </FadeIn>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    marginTop: -32,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    backgroundColor: color.bg,
    paddingHorizontal: gutter,
    alignItems: 'stretch',
  },
  check: {
    alignSelf: 'center',
    marginTop: -36,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: color.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: color.bg,
  },
  receipt: {
    marginTop: 22,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.line,
    overflow: 'hidden',
  },
  perf: { borderTopWidth: 1, borderStyle: 'dashed', borderColor: color.lineStrong, marginVertical: 16 },
  notch: { position: 'absolute', top: -10, width: 20, height: 20, borderRadius: 10, backgroundColor: color.bg },
});
