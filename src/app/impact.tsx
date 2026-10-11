import React, { useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useImpact, useStore } from '@/store/AppStore';
import { gutter, palette, radius } from '@/theme';
import { ToneProvider } from '@/theme/ToneContext';
import { FadeIn } from '@/components/Motion';
import { Photo } from '@/components/Photo';
import { T } from '@/components/Text';
import { Button, Fleur, FocusStatusBar, IconButton, Row, SectionHeader } from '@/components/ui';
import { RankedBars, StatCard } from '@/components/domain';

export default function Impact() {
  return (
    <ToneProvider tone="dark">
      <ImpactBody />
    </ToneProvider>
  );
}

function ImpactBody() {
  const insets = useSafeAreaInsets();
  const impact = useImpact();
  const { state } = useStore();
  const y = useRef(new Animated.Value(0)).current;
  const scale = y.interpolate({ inputRange: [-200, 0], outputRange: [1.35, 1], extrapolate: 'clamp' });
  const byProgram = useMemo(
    () => state.programs.map((p) => ({ label: p.title, value: p.enrolled, sub: `${p.category} · ${p.ageGroup}` })).sort((a, b) => b.value - a.value),
    [state.programs],
  );

  return (
    <View style={{ flex: 1, backgroundColor: palette.midnight }}>
      <FocusStatusBar style="light" />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y } } }], { useNativeDriver: true })}
        contentContainerStyle={{ paddingBottom: 48 + insets.bottom }}
      >
        <View style={{ height: 330, overflow: 'hidden' }}>
          <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale }] }]}>
            <Photo photo="skyline" width={1400} scrim={1} scrimTop style={StyleSheet.absoluteFill} />
          </Animated.View>
          <View style={{ position: 'absolute', left: gutter, right: gutter, bottom: 18 }}>
            <FadeIn>
              <Row gap={10}>
                <T v="hero" c={palette.ivory} accessibilityRole="header">
                  Our Impact
                </T>
                <Fleur size={28} />
              </Row>
              <T v="body" c={palette.goldSoft} style={{ marginTop: 4 }}>
                This year, across New Orleans
              </T>
            </FadeIn>
          </View>
        </View>

        <View style={styles.grid}>
          <StatCard icon="home-outline" value={impact.familiesSupported} label="Families Supported" />
          <StatCard icon="heart-outline" value={impact.mealsShared} label="Meals Provided" />
          <StatCard icon="hand-left-outline" value={impact.volunteerHours} label="Volunteer Hours" />
          <StatCard icon="cash-outline" value={impact.investedInNola} prefix="$" compact label="Invested in New Orleans" />
        </View>
        <T v="caption" muted center style={{ marginTop: 10 }}>
          Sample figures for demonstration · they update as you use the demo
        </T>

        <View style={{ marginHorizontal: gutter, marginTop: 28 }}>
          <Photo photo="youthMural" width={1200} scrim={0.95} style={{ height: 300, borderRadius: radius.xl }} position="top">
            <View style={{ position: 'absolute', left: 18, right: 18, bottom: 16 }}>
              <T v="script" c={palette.gold} style={{ fontSize: 46, lineHeight: 50 }}>
                Same City,{'\n'}Bigger Opportunities
              </T>
            </View>
          </Photo>
          <T v="body" c={palette.ivory} style={{ marginTop: 16 }}>
            Every program is run by neighbors, for neighbors. When a student finds a mentor, a family gets groceries or someone in recovery finds a safe home, the whole city gets stronger.
          </T>
        </View>

        <SectionHeader title="People in Programs" />
        <View style={styles.panel}>
          <RankedBars data={byProgram} />
        </View>

        <View style={{ paddingHorizontal: gutter, marginTop: 26 }}>
          <Button title="Give Back to NOLA" variant="gold" iconRight="arrow-forward" onPress={() => router.navigate('/give')} />
        </View>
      </Animated.ScrollView>

      <View style={{ position: 'absolute', top: insets.top + 6, left: 16 }}>
        <IconButton icon="arrow-back" tone="glass" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: gutter, marginTop: 18 },
  panel: { marginHorizontal: gutter, padding: 18, borderRadius: radius.lg, backgroundColor: palette.charcoal },
});
