import React, { useMemo, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ORG } from '@/data/seed';
import { useImpact, useMyActivity, useSession, useStore } from '@/store/AppStore';
import { gutter, palette, radius, shadow } from '@/theme';
import { ToneProvider } from '@/theme/ToneContext';
import { FadeIn, PressScale } from '@/components/Motion';
import { Photo } from '@/components/Photo';
import { T } from '@/components/Text';
import { Avatar, Button, DemoBadge, Divider, Fleur, FocusStatusBar, IconButton, Row, SectionHeader, Wordmark } from '@/components/ui';
import { AnnouncementItem, EventMini, ProgramMini, StatItem } from '@/components/domain';

export default function Home() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { state } = useStore();
  const { member } = useSession();
  const { unread, isEnrolled, isRegistered } = useMyActivity();
  const impact = useImpact();
  const y = useRef(new Animated.Value(0)).current;

  const heroH = Math.min(600, Math.max(500, height * 0.66));
  const upcoming = useMemo(
    () => state.events.filter((e) => !e.cancelled && new Date(e.date).getTime() > Date.now()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3),
    [state.events],
  );
  const featured = state.programs.filter((p) => p.featured);
  const news = useMemo(() => [...state.announcements].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date)).slice(0, 2), [state.announcements]);

  const translate = y.interpolate({ inputRange: [-200, 0, heroH], outputRange: [-100, 0, heroH * 0.45], extrapolate: 'clamp' });
  const scale = y.interpolate({ inputRange: [-200, 0], outputRange: [1.35, 1], extrapolate: 'clamp' });
  const barBg = y.interpolate({ inputRange: [heroH - 180, heroH - 110], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <View style={{ flex: 1, backgroundColor: palette.ivory }}>
      <FocusStatusBar style="light" />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y } } }], { useNativeDriver: true })}
        style={{ backgroundColor: palette.midnight }}
        contentContainerStyle={{ backgroundColor: palette.ivory }}
      >
        {/* Hero */}
        <View style={{ height: heroH, overflow: 'hidden', backgroundColor: palette.midnight }}>
          <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateY: translate }, { scale }] }]}>
            <Photo photo="streetcar" width={1400} scrim={0.95} scrimTop style={StyleSheet.absoluteFill} />
          </Animated.View>
          <View style={[styles.heroBody, { paddingBottom: 56 }]}>
            <FadeIn delay={60}>
              <View style={{ alignSelf: 'flex-start', marginBottom: 14 }}>
                <DemoBadge onImage />
              </View>
              <T v="eyebrow" c={palette.ivory} style={{ letterSpacing: 2.6 }}>
                New Orleans
              </T>
              <T v="hero" c={palette.ivory} style={{ marginTop: 10 }} accessibilityRole="header">
                Stronger People.{'\n'}Brighter Futures.
              </T>
              <T v="body" c={palette.goldSoft} style={{ marginTop: 12, maxWidth: 300 }}>
                {ORG.mission.replace('. A', '.\nA')}
              </T>
            </FadeIn>
            <FadeIn delay={180}>
              <Button title="Get involved" caps variant="gold" iconRight="arrow-forward" onPress={() => router.push('/programs')} style={{ alignSelf: 'flex-start', marginTop: 22, paddingHorizontal: 28 }} />
            </FadeIn>
          </View>
        </View>

        <ToneProvider tone="light">
          {/* Impact strip (cream panel overlapping the hero) */}
          <View style={styles.panel}>
            <PressScale onPress={() => router.push('/impact')} scaleTo={0.99} accessibilityRole="button" accessibilityLabel="See our impact">
              <Row gap={4} style={{ alignItems: 'flex-start' }}>
                <StatItem icon="home-outline" value={impact.familiesSupported} label={'Families\nSupported'} />
                <StatItem icon="heart-outline" value={impact.mealsShared} label={'Meals\nShared'} />
                <StatItem icon="hand-left-outline" value={impact.volunteerHours} label={'Volunteer\nHours'} />
                <StatItem icon="cash-outline" value={impact.investedInNola} prefix="$" compact label={'Invested\nin NOLA'} />
              </Row>
              <Row gap={6} style={{ justifyContent: 'center', marginTop: 14 }}>
                <T v="caption" muted>
                  Sample data · See our impact
                </T>
                <Ionicons name="arrow-forward" size={12} color={palette.goldDeep} />
              </Row>
            </PressScale>
          </View>

          {/* What's happening */}
          <SectionHeader title="What’s Happening" action="See all" onAction={() => router.push('/events')} style={{ marginTop: 26 }} />
          <View style={{ paddingHorizontal: gutter }}>
            {upcoming.map((e, i) => (
              <FadeIn key={e.id} delay={i * 60}>
                {i > 0 ? <Divider /> : null}
                <EventMini event={e} registered={!!isRegistered(e.id)} />
              </FadeIn>
            ))}
          </View>

          {/* Programs */}
          <SectionHeader title="Our Programs" action="View all" onAction={() => router.push('/programs')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={232} decelerationRate="fast" contentContainerStyle={{ paddingHorizontal: gutter, gap: 12, paddingBottom: 8 }}>
            {featured.map((p) => (
              <ProgramMini key={p.id} program={p} enrolled={!!isEnrolled(p.id)} />
            ))}
          </ScrollView>

          {/* Map teaser */}
          <PressScale onPress={() => router.push('/map')} scaleTo={0.985} accessibilityRole="button" accessibilityLabel="Open the community map" style={[styles.mapCard, shadow.soft]}>
            <Photo photo="neonCity" width={900} scrim={0.9} style={{ height: 150, borderRadius: radius.lg }}>
              <Row gap={12} style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
                <View style={styles.mapIcon}>
                  <Ionicons name="location" size={20} color={palette.midnight} />
                </View>
                <View style={{ flex: 1 }}>
                  <T v="title2" c={palette.ivory} style={{ fontSize: 19 }}>
                    Community Near You
                  </T>
                  <T v="caption" c={palette.goldSoft}>
                    Programs, events and resources across the city
                  </T>
                </View>
                <Ionicons name="chevron-forward" size={20} color={palette.gold} />
              </Row>
            </Photo>
          </PressScale>

          {/* Give teaser */}
          <PressScale onPress={() => router.push('/give')} scaleTo={0.985} accessibilityRole="button" accessibilityLabel="Give back to New Orleans" style={{ marginHorizontal: gutter, marginTop: 14 }}>
            <Photo photo="giveSign" width={900} scrim={0.6} style={{ height: 170, borderRadius: radius.lg }} position="center">
              <View style={{ position: 'absolute', left: 16, right: 16, bottom: 14 }}>
                <T v="callout" c={palette.ivory}>
                  Matching gift active through Dec 31 — your gift goes twice as far.
                </T>
                <Row gap={6} style={{ marginTop: 8 }}>
                  <T v="eyebrow" c={palette.gold}>
                    Give now
                  </T>
                  <Ionicons name="arrow-forward" size={13} color={palette.gold} />
                </Row>
              </View>
            </Photo>
          </PressScale>

          {/* News */}
          <SectionHeader title="From the Team" action="All news" onAction={() => router.push('/announcements')} />
          <View style={{ paddingHorizontal: gutter }}>
            {news.map((a, i) => (
              <View key={a.id}>
                {i > 0 ? <Divider /> : null}
                <AnnouncementItem item={a} />
              </View>
            ))}
          </View>

          <View style={{ alignItems: 'center', marginTop: 36, marginBottom: 40, paddingHorizontal: 40 }}>
            <Fleur size={22} color={palette.goldDeep} />
            <T v="caption" muted center style={{ marginTop: 8 }}>
              ByTAI Community is a portfolio prototype by builtbyTAI — Tailored Automation & Integrations. People, events and figures are fictional sample data.
            </T>
          </View>
        </ToneProvider>
      </Animated.ScrollView>

      {/* Floating top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: palette.midnight, opacity: barBg }]} pointerEvents="none" />
        <Wordmark />
        <Row gap={6}>
          <IconButton icon="notifications-outline" tone="ghost" color={palette.gold} label="Notifications" badge={unread} onPress={() => router.push(member ? '/notifications' : '/sign-in')} />
          <PressScale onPress={() => router.push(member ? '/account' : '/sign-in')} accessibilityRole="button" accessibilityLabel={member ? 'Your profile' : 'Sign in'}>
            {member ? <Avatar name={member.name} photo="coffeeSmile" size={36} ring /> : <IconButton icon="person-circle-outline" tone="ghost" color={palette.ivory} label="Sign in" onPress={() => router.push('/sign-in')} />}
          </PressScale>
        </Row>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroBody: { position: 'absolute', left: gutter, right: gutter, bottom: 0 },
  panel: {
    marginTop: -30,
    marginHorizontal: 12,
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderRadius: radius.xl,
    backgroundColor: palette.ivory,
    ...shadow.soft,
  },
  mapCard: { marginHorizontal: gutter, marginTop: 30 },
  mapIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center' },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: gutter, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
