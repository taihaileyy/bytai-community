import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { dark, palette, radius, space } from '@/theme';
import { SchemeProvider } from '@/theme/SchemeContext';
import { FadeIn } from '@/components/Motion';
import { Txt } from '@/components/Txt';
import { Button, DemoPill, FocusStatusBar, type IconName } from '@/components/ui';

type Kind = 'program' | 'event' | 'donation';

const META: Record<Kind, { icon: IconName; eyebrow: string; next: { label: string; href: string } }> = {
  program: { icon: 'school', eyebrow: 'Enrollment confirmed', next: { label: 'View my programs', href: '/account' } },
  event: { icon: 'calendar', eyebrow: 'Registration confirmed', next: { label: 'See my events', href: '/account' } },
  donation: { icon: 'heart', eyebrow: 'Gift received (demo)', next: { label: 'View giving history', href: '/donations' } },
};

export default function Confirm() {
  const p = useLocalSearchParams<{ kind: Kind; title: string; subtitle?: string; detail?: string; code?: string; note?: string }>();
  const kind: Kind = p.kind && p.kind in META ? p.kind : 'program';
  const meta = META[kind];
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 9, bounciness: 14 }),
      Animated.loop(Animated.timing(ring, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: true }), { iterations: 3 }),
    ]).start();
  }, [scale, ring]);

  const done = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <SchemeProvider value={dark}>
    <LinearGradient colors={[palette.night, '#18241E', palette.greenDeep]} style={[styles.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}>
      <FocusStatusBar style="light" />
      <View style={{ alignItems: 'center' }}>
        <DemoPill inverse />
      </View>

      <View style={styles.center}>
        <View style={styles.badgeWrap}>
          <Animated.View
            style={[
              styles.ring,
              { opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }), transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }] },
            ]}
          />
          <Animated.View style={[styles.badge, { transform: [{ scale }] }]}>
            <Ionicons name="checkmark" size={46} color={palette.night} />
          </Animated.View>
        </View>

        <FadeIn delay={250}>
          <Txt variant="eyebrow" color={palette.mintBright} center style={{ marginTop: 28 }}>
            {meta.eyebrow}
          </Txt>
          <Txt variant="hero" color={palette.cream} center style={{ marginTop: 10 }}>
            {p.title}
          </Txt>
          {p.subtitle ? (
            <Txt variant="title" italic color="rgba(241,238,228,0.85)" center style={{ marginTop: 8 }}>
              {p.subtitle}
            </Txt>
          ) : null}
        </FadeIn>

        <FadeIn delay={420} style={{ alignSelf: 'stretch' }}>
          <View style={styles.receipt}>
            {p.detail ? (
              <View style={styles.receiptRow}>
                <Ionicons name={meta.icon} size={18} color={palette.mintBright} />
                <Txt variant="body" color={palette.cream} style={{ flex: 1 }}>
                  {p.detail}
                </Txt>
              </View>
            ) : null}
            {p.code ? (
              <>
                <View style={styles.dash} />
                <Txt variant="eyebrow" color="rgba(241,238,228,0.6)">
                  {kind === 'donation' ? 'Receipt' : 'Confirmation'}
                </Txt>
                <Txt variant="title" color={palette.cream} style={{ letterSpacing: 2, marginTop: 4 }}>
                  {p.code}
                </Txt>
              </>
            ) : null}
          </View>
          {p.note ? (
            <Txt variant="caption" color="rgba(241,238,228,0.7)" center style={{ marginTop: 14, paddingHorizontal: 10 }}>
              {p.note}
            </Txt>
          ) : null}
        </FadeIn>
      </View>

      <FadeIn delay={560}>
        <Button title="Done" variant="inverse" onPress={done} />
        <Button
          title={meta.next.label}
          variant="ghost"
          style={{ marginTop: 6 }}
          onPress={() => {
            router.dismissAll?.();
            router.navigate(meta.next.href as never);
          }}
        />
      </FadeIn>
    </LinearGradient>
    </SchemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: space.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badgeWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: palette.mint },
  badge: { width: 96, height: 96, borderRadius: 48, backgroundColor: palette.mintBright, alignItems: 'center', justifyContent: 'center' },
  receipt: {
    marginTop: 26,
    padding: space.xl,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(241,238,228,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(241,238,228,0.14)',
  },
  receiptRow: { flexDirection: 'row', gap: 12 },
  dash: { borderTopWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(241,238,228,0.25)', marginVertical: 16 },
});
