import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ORG } from '@/data/seed';
import { useImpact, useMyActivity, useSession, useStore } from '@/store/AppStore';
import { palette, radius, space } from '@/theme';
import { greeting } from '@/utils/format';
import { FadeIn, PressScale } from '@/components/Motion';
import { Txt } from '@/components/Txt';
import { Avatar, Card, DemoPill, FocusStatusBar, IconButton, Row, SectionHeader, type IconName } from '@/components/ui';
import { AnnouncementCard, EventCard, ProgramFeatureCard, StatTile } from '@/components/domain';

const QUICK: { icon: IconName; label: string; href: string; color: string; bg: string }[] = [
  { icon: 'heart', label: 'Give', href: '/give', color: palette.clay, bg: palette.claySoft },
  { icon: 'hand-left', label: 'Volunteer', href: '/events?filter=Volunteer', color: palette.green, bg: palette.mintSoft },
  { icon: 'school', label: 'Programs', href: '/programs', color: palette.sky, bg: palette.skySoft },
  { icon: 'megaphone', label: 'News', href: '/announcements', color: '#A0782A', bg: palette.goldSoft },
];

export default function Home() {
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const { member } = useSession();
  const { unread, isEnrolled, isRegistered } = useMyActivity();
  const impact = useImpact();

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
  const firstName = member?.name.split(' ')[0];

  return (
    <View style={{ flex: 1, backgroundColor: palette.paper }}>
      <FocusStatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <LinearGradient
          colors={[palette.night, '#1A2620', palette.greenDeep]}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 12 }]}
        >
          <Row style={{ justifyContent: 'space-between' }}>
            <DemoPill inverse />
            <Row gap={10}>
              <IconButton
                icon="notifications-outline"
                tone="inverse"
                label="Notifications"
                badge={unread}
                onPress={() => router.push(member ? '/notifications' : '/sign-in')}
              />
              <PressScale onPress={() => router.push('/account')} accessibilityLabel="Your account">
                {member ? (
                  <Avatar name={member.name} color={member.avatarColor} size={40} />
                ) : (
                  <View style={styles.guestAvatar}>
                    <Ionicons name="person" size={18} color={palette.cream} />
                  </View>
                )}
              </PressScale>
            </Row>
          </Row>

          <FadeIn delay={60}>
            <Txt variant="eyebrow" color={palette.mintBright} style={{ marginTop: 28 }}>
              {ORG.name}
            </Txt>
            <Txt variant="hero" color={palette.cream} style={{ marginTop: 10 }}>
              {greeting()},{'\n'}
              {firstName ?? 'neighbor'}.
            </Txt>
          </FadeIn>

          <FadeIn delay={160}>
            <View style={styles.mission}>
              <View style={styles.missionRule} />
              <Txt variant="body" italic color="rgba(241,238,228,0.88)" style={{ flex: 1, fontSize: 16.5, lineHeight: 24 }}>
                {ORG.mission}
              </Txt>
            </View>
          </FadeIn>

          <FadeIn delay={260}>
            <Txt variant="eyebrow" color="rgba(241,238,228,0.6)" style={{ marginTop: 28, marginBottom: 12 }}>
              Our impact this year
            </Txt>
            <View style={styles.statGrid}>
              <StatTile tone="dark" icon="home-outline" value={impact.familiesServed} label="Families served" delta="+12%" />
              <StatTile tone="dark" icon="restaurant-outline" value={impact.mealsShared} label="Meals shared" delta="+8%" />
              <StatTile tone="dark" icon="time-outline" value={impact.volunteerHours} label="Volunteer hours" />
              <StatTile tone="dark" icon="cash-outline" prefix="$" value={impact.raisedThisYear} label="Raised for programs" />
            </View>
          </FadeIn>
        </LinearGradient>

        <View style={{ paddingHorizontal: space.xl }}>
          {/* Quick actions */}
          <FadeIn delay={320}>
            <Card style={styles.quickCard}>
              {QUICK.map((q) => (
                <PressScale key={q.label} haptic onPress={() => router.push(q.href as never)} style={styles.quickItem} accessibilityRole="button">
                  <View style={[styles.quickIcon, { backgroundColor: q.bg }]}>
                    <Ionicons name={q.icon} size={21} color={q.color} />
                  </View>
                  <Txt variant="caption" style={{ marginTop: 7, fontSize: 12 }}>
                    {q.label}
                  </Txt>
                </PressScale>
              ))}
            </Card>
          </FadeIn>

          {/* Featured programs */}
          <SectionHeader eyebrow="Featured" title="Programs for you" action="All programs" onAction={() => router.push('/programs')} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={280}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: space.xl, gap: 12, paddingTop: 4, paddingBottom: 28 }}
        >
          {featured.map((p, i) => (
            <FadeIn key={p.id} delay={380 + i * 80} distance={20}>
              <ProgramFeatureCard program={p} index={i} enrolled={!!isEnrolled(p.id)} />
            </FadeIn>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: space.xl }}>
          <SectionHeader eyebrow="Mark your calendar" title="Upcoming events" action="Calendar" onAction={() => router.push('/events')} style={{ marginTop: 18 }} />
          {upcoming.map((e, i) => (
            <FadeIn key={e.id} delay={i * 70}>
              <EventCard event={e} registered={!!isRegistered(e.id)} />
            </FadeIn>
          ))}

          <SectionHeader eyebrow="From the team" title="Announcements" action="See all" onAction={() => router.push('/announcements')} />
          {announcements.map((a) => (
            <AnnouncementCard key={a.id} item={a} compact />
          ))}

          {/* Donate CTA */}
          <PressScale onPress={() => router.push('/give')} accessibilityRole="button" style={{ marginTop: 18 }}>
            <LinearGradient colors={[palette.green, palette.greenDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
              <View style={{ flex: 1 }}>
                <Txt variant="eyebrow" color={palette.mintBright}>
                  Matching gift active
                </Txt>
                <Txt variant="title" color={palette.cream} style={{ marginTop: 8 }}>
                  Your gift goes twice as far this season.
                </Txt>
              </View>
              <View style={styles.ctaArrow}>
                <Ionicons name="arrow-forward" size={20} color={palette.night} />
              </View>
            </LinearGradient>
          </PressScale>

          {/* Portfolio footer */}
          <View style={styles.footer}>
            <Txt variant="eyebrow" muted center>
              Portfolio prototype
            </Txt>
            <Txt variant="caption" muted center style={{ marginTop: 6, maxWidth: 300 }}>
              ByTAI Community is a demo app designed and built by builtbyTAI — Tailored Automation & Integrations. All
              people, organizations and numbers are fictional.
            </Txt>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: space.xl,
    paddingBottom: 60,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  guestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(241,238,228,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mission: { flexDirection: 'row', gap: 14, marginTop: 18 },
  missionRule: { width: 3, borderRadius: 2, backgroundColor: palette.mint },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: {
    marginTop: -36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  quickItem: { flex: 1, alignItems: 'center' },
  quickIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cta: {
    borderRadius: radius.xl,
    padding: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  ctaArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.mintBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { alignItems: 'center', marginTop: 36, paddingHorizontal: 10 },
});
