import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ORG } from '@/data/seed';
import { useImpact, useMyActivity, useSession, useStore } from '@/store/AppStore';
import { color, gutter, radius } from '@/theme';
import { greeting, money } from '@/utils/format';
import { FadeIn, PressScale } from '@/components/Motion';
import { Photo } from '@/components/Photo';
import { T } from '@/components/Text';
import { Avatar, Button, DemoBadge, Divider, FocusStatusBar, IconButton, Progress, Row, SectionHeader } from '@/components/ui';
import { AnnouncementItem, EventRow, InitiativeCard, Stat, StatStrip } from '@/components/domain';

const MATCH_GOAL = 25000;

export default function Home() {
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  const { state } = useStore();
  const { member } = useSession();
  const { unread, isEnrolled, isRegistered } = useMyActivity();
  const impact = useImpact();
  const y = useRef(new Animated.Value(0)).current;

  const heroH = Math.min(560, Math.max(460, screenH * 0.62));
  const featured = state.programs.filter((p) => p.featured);
  const upcoming = useMemo(
    () =>
      state.events
        .filter((e) => !e.cancelled && new Date(e.date).getTime() > Date.now() - 3600_000)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 3),
    [state.events],
  );
  const announcements = useMemo(
    () => [...state.announcements].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date)).slice(0, 2),
    [state.announcements],
  );
  const matched = useMemo(() => {
    const since = Date.now() - 60 * 86400000;
    return Math.min(MATCH_GOAL, 17_600 + state.donations.filter((d) => new Date(d.date).getTime() > since).reduce((s, d) => s + d.amount, 0));
  }, [state.donations]);
  const firstName = member?.name.split(' ')[0];

  // Hero parallax + top bar that turns solid once the hero scrolls away.
  const heroTranslate = y.interpolate({ inputRange: [-200, 0, heroH], outputRange: [-100, 0, heroH * 0.45], extrapolate: 'clamp' });
  const heroScale = y.interpolate({ inputRange: [-200, 0], outputRange: [1.35, 1], extrapolate: 'clamp' });
  const barBg = y.interpolate({ inputRange: [heroH - 140, heroH - 90], outputRange: [0, 1], extrapolate: 'clamp' });
  // Once the hero is gone the bar turns light, so flip status bar + controls to dark.
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const id = y.addListener(({ value }) => setSolid(value > heroH - 110));
    return () => y.removeListener(id);
  }, [y, heroH]);

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <FocusStatusBar style={solid ? 'dark' : 'light'} />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y } } }], { useNativeDriver: true })}
        contentContainerStyle={{ paddingBottom: 56 }}
      >
        {/* Hero */}
        <View style={{ height: heroH, overflow: 'hidden' }}>
          <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateY: heroTranslate }, { scale: heroScale }] }]}>
            <Photo photo="hero" width={1400} scrim={0.82} scrimTop style={StyleSheet.absoluteFill} />
          </Animated.View>
          <View style={[styles.heroContent, { paddingBottom: 28 }]}>
            <FadeIn delay={80}>
              <T v="subhead" c="rgba(255,255,255,0.85)">
                {greeting()}
                {firstName ? `, ${firstName}` : ''}
              </T>
              <T v="hero" c={color.white} style={{ marginTop: 8 }} accessibilityRole="header">
                Neighbors helping{'\n'}neighbors thrive.
              </T>
              <T v="callout" c="rgba(255,255,255,0.82)" style={{ marginTop: 10, maxWidth: 320 }}>
                {ORG.mission}
              </T>
            </FadeIn>
            <FadeIn delay={200}>
              <Row gap={10} style={{ marginTop: 22 }}>
                <Button title="Get involved" variant="light" iconRight="arrow-forward" onPress={() => router.push('/programs')} style={{ flex: 1 }} />
                <Button title="Donate" variant="accent" icon="heart" onPress={() => router.push('/give')} style={{ flex: 0.8 }} />
              </Row>
            </FadeIn>
          </View>
        </View>

        {/* Compact impact stats */}
        <FadeIn delay={260} style={styles.impact}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 16 }}>
            <T v="overline" muted>
              Impact this year
            </T>
            <T v="caption" muted>
              {ORG.name}
            </T>
          </Row>
          <StatStrip>
            <Stat value={impact.familiesServed} label="Families served" />
            <Stat value={impact.mealsShared} label="Meals shared" compactNum />
            <Stat value={impact.volunteerHours} label="Volunteer hrs" compactNum />
          </StatStrip>
        </FadeIn>

        {/* Featured initiatives */}
        <SectionHeader title="Featured initiatives" action="See all" onAction={() => router.push('/programs')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={276}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: gutter, gap: 12 }}
        >
          {featured.map((p, i) => (
            <FadeIn key={p.id} delay={300 + i * 70} distance={16}>
              <InitiativeCard program={p} enrolled={!!isEnrolled(p.id)} />
            </FadeIn>
          ))}
        </ScrollView>

        {/* Upcoming events */}
        <SectionHeader title="Upcoming events" action="Calendar" onAction={() => router.push('/events')} />
        <View>
          {upcoming.map((e, i) => (
            <View key={e.id}>
              {i > 0 ? <Divider inset={gutter + 98} /> : null}
              <EventRow event={e} registered={!!isRegistered(e.id)} />
            </View>
          ))}
        </View>

        {/* Matching gift */}
        <PressScale onPress={() => router.push('/give')} scaleTo={0.985} accessibilityRole="button" accessibilityLabel={`Matching gift: ${money(matched)} of ${money(MATCH_GOAL)} matched. Give now.`} style={{ marginHorizontal: gutter, marginTop: 36 }}>
          <Photo photo="butterfly" width={1000} scrim={0.85} style={styles.give}>
            <View style={styles.giveBody}>
              <T v="overline" c="rgba(255,255,255,0.8)">
                Matching gift · Ends Dec 31
              </T>
              <T v="title1" c={color.white} style={{ marginTop: 6 }}>
                Your gift goes twice as far.
              </T>
              <View style={{ marginTop: 14 }}>
                <Progress value={matched / MATCH_GOAL} tone="light" height={4} />
              </View>
              <Row style={{ justifyContent: 'space-between', marginTop: 8 }}>
                <T v="caption" c="rgba(255,255,255,0.85)" tabular>
                  {money(matched)} of {money(MATCH_GOAL)} matched
                </T>
                <Row gap={4}>
                  <T v="subhead" c={color.white}>
                    Give now
                  </T>
                  <Ionicons name="arrow-forward" size={14} color={color.white} />
                </Row>
              </Row>
            </View>
          </Photo>
        </PressScale>

        {/* Announcements */}
        <SectionHeader title="From the team" action="All news" onAction={() => router.push('/announcements')} />
        <View style={{ paddingHorizontal: gutter }}>
          {announcements.map((a, i) => (
            <View key={a.id}>
              {i > 0 ? <Divider /> : null}
              <AnnouncementItem item={a} />
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <DemoBadge />
          <T v="caption" muted center style={{ marginTop: 10, maxWidth: 290 }}>
            A portfolio prototype designed and built by builtbyTAI — Tailored Automation & Integrations. People,
            organizations and numbers are fictional.
          </T>
        </View>
      </Animated.ScrollView>

      {/* Floating top bar over the hero */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]} pointerEvents="box-none">
        <Animated.View style={[StyleSheet.absoluteFill, styles.topBarBg, { opacity: barBg }]} pointerEvents="none" />
        <DemoBadge onImage={!solid} />
        <Row gap={10}>
          <IconButton icon="notifications-outline" tone={solid ? 'plain' : 'dark'} label="Notifications" badge={unread} onPress={() => router.push(member ? '/notifications' : '/sign-in')} />
          <PressScale onPress={() => router.push(member ? '/account' : '/sign-in')} accessibilityRole="button" accessibilityLabel={member ? 'Your profile' : 'Sign in'}>
            {member ? (
              <View style={styles.avatarRing}>
                <Avatar name={member.name} size={36} tone="dark" />
              </View>
            ) : (
              <IconButton icon="person-outline" tone={solid ? 'plain' : 'dark'} label="Sign in" onPress={() => router.push('/sign-in')} />
            )}
          </PressScale>
        </Row>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContent: { position: 'absolute', left: gutter, right: gutter, bottom: 0 },
  impact: {
    marginHorizontal: gutter,
    marginTop: 20,
    padding: 18,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.line,
  },
  give: { height: 230, borderRadius: radius.xl },
  giveBody: { position: 'absolute', left: 18, right: 18, bottom: 18 },
  footer: { alignItems: 'center', marginTop: 48, paddingHorizontal: gutter },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: gutter,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarBg: { backgroundColor: color.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.line },
  avatarRing: { padding: 2, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.35)' },
});
