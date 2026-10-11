import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ORG } from '@/data/seed';
import { useActions, useMyActivity, useSession, useStore } from '@/store/AppStore';
import { color, gutter, radius } from '@/theme';
import { longDate, money, relative, time } from '@/utils/format';
import { confirmAction } from '@/utils/confirm';
import { FadeIn } from '@/components/Motion';
import { Photo } from '@/components/Photo';
import { T } from '@/components/Text';
import { Avatar, Button, DemoBadge, FocusStatusBar, Group, LargeTitleScreen, ListItem, Row, SectionHeader, Tag, type IconName } from '@/components/ui';
import { Stat, StatStrip } from '@/components/domain';

export default function Account() {
  const { state } = useStore();
  const { member, isAdmin } = useSession();
  const { enrollments, registrations, donations, unread, notifications } = useMyActivity();
  const actions = useActions();

  if (!member) return <SignedOut />;

  const myPrograms = enrollments.map((e) => ({ e, p: state.programs.find((p) => p.id === e.programId) })).filter((x) => x.p);
  const myEvents = registrations
    .map((r) => ({ r, ev: state.events.find((e) => e.id === r.eventId) }))
    .filter((x) => x.ev)
    .sort((a, b) => a.ev!.date.localeCompare(b.ev!.date));
  const given = donations.reduce((s, d) => s + d.amount, 0);

  return (
    <LargeTitleScreen title="Profile">
      <FadeIn>
        <Row gap={16} style={{ paddingHorizontal: gutter }}>
          <Avatar name={member.name} size={64} tone="dark" />
          <View style={{ flex: 1 }}>
            <T v="title2">{member.name}</T>
            <T v="callout" muted numberOfLines={1}>
              {member.email}
            </T>
            <Row gap={6} style={{ marginTop: 6 }}>
              <Tag label={isAdmin ? 'Admin' : 'Member'} tone={isAdmin ? 'dark' : 'accent'} />
              <T v="caption" muted>
                {member.neighborhood} · since {new Date(member.joined).getFullYear()}
              </T>
            </Row>
          </View>
        </Row>
        <View style={styles.stats}>
          <StatStrip>
            <Stat value={myPrograms.length} label="Programs" />
            <Stat value={myEvents.length} label="Events" />
            <Stat value={given} prefix="$" label="Given" />
            <Stat value={member.volunteerHours} label="Hours" />
          </StatStrip>
        </View>
      </FadeIn>

      {isAdmin ? (
        <Group style={{ marginTop: 20 }}>
          <ListItem icon="speedometer-outline" title="Admin console" subtitle="Members, donations, events, analytics" onPress={() => router.push('/admin')} />
        </Group>
      ) : null}

      <Group style={{ marginTop: isAdmin ? 12 : 20 }}>
        <ListItem
          icon="notifications-outline"
          title="Notifications"
          subtitle={unread ? `${unread} new · ${notifications[0] ? relative(notifications[0].date) : ''}` : 'You’re all caught up'}
          onPress={() => router.push('/notifications')}
          trailing={unread ? <View style={styles.count}><T v="caption" c={color.white} style={{ fontSize: 11 }}>{unread}</T></View> : undefined}
        />
      </Group>

      <SectionHeader title="My programs" action="Browse" onAction={() => router.push('/programs')} />
      <Group>
        {myPrograms.length ? (
          myPrograms.map(({ e, p }) => (
            <ListItem
              key={e.id}
              leading={<Photo photo={p!.photo} width={160} style={styles.thumb} decorative />}
              title={p!.title}
              subtitle={`${e.status === 'waitlist' ? 'Waitlist · ' : ''}${p!.schedule}`}
              onPress={() => router.push(`/program/${p!.id}`)}
            />
          ))
        ) : (
          <ListItem icon="compass-outline" title="Find a program" subtitle="Classes, clubs and services near you" onPress={() => router.push('/programs')} />
        )}
      </Group>

      <SectionHeader title="My events" action="Calendar" onAction={() => router.push('/events')} />
      <Group>
        {myEvents.length ? (
          myEvents.map(({ r, ev }) => (
            <ListItem
              key={r.id}
              leading={<Photo photo={ev!.photo} width={160} style={styles.thumb} decorative />}
              title={ev!.title}
              subtitle={`${ev!.cancelled ? 'Cancelled · ' : ''}${longDate(ev!.date)} · ${time(ev!.date)}${r.guests ? ` · +${r.guests}` : ''}`}
              onPress={() => router.push(`/event/${ev!.id}`)}
            />
          ))
        ) : (
          <ListItem icon="calendar-clear-outline" title="RSVP to an event" subtitle="Volunteer days, workshops and celebrations" onPress={() => router.push('/events')} />
        )}
      </Group>

      <SectionHeader title="Giving" />
      <Group>
        <ListItem icon="heart-outline" title="Giving history" value={money(given)} onPress={() => router.push('/donations')} />
        <ListItem icon="add-circle-outline" title="Make a gift" onPress={() => router.navigate('/give')} />
      </Group>

      <Group style={{ marginTop: 28 }} title="Demo">
        <ListItem
          icon="refresh-outline"
          title="Reset demo data"
          subtitle="Restore the original sample data"
          onPress={() => confirmAction('Reset demo data?', 'All enrollments, RSVPs, gifts and admin changes from this session will be cleared.', actions.resetDemo, 'Reset')}
        />
        <ListItem icon="log-out-outline" title="Sign out" destructive onPress={actions.signOut} />
      </Group>

      <T v="caption" muted center style={{ marginTop: 28, paddingHorizontal: 40 }}>
        ByTAI Community · a builtbyTAI portfolio prototype{'\n'}Sample data for {ORG.name} (fictional)
      </T>
    </LargeTitleScreen>
  );
}

function SignedOut() {
  const insets = useSafeAreaInsets();
  const perks: { icon: IconName; title: string; body: string }[] = [
    { icon: 'compass-outline', title: 'Enroll in programs', body: 'Save your spot in classes, clubs and services' },
    { icon: 'calendar-clear-outline', title: 'RSVP to events', body: 'Reminders and a check-in code' },
    { icon: 'heart-outline', title: 'Track your giving', body: 'Receipts and monthly gifts in one place' },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <FocusStatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Photo photo="campfire" width={1200} scrim={0.8} style={{ height: 380 }}>
          <View style={{ position: 'absolute', top: insets.top + 10, left: gutter }}>
            <DemoBadge onImage />
          </View>
          <View style={{ position: 'absolute', left: gutter, right: gutter, bottom: 28 }}>
            <T v="overline" c="rgba(255,255,255,0.8)">
              Member portal
            </T>
            <T v="largeTitle" c={color.white} style={{ marginTop: 6 }} accessibilityRole="header">
              Welcome, neighbor.
            </T>
            <T v="callout" c="rgba(255,255,255,0.82)" style={{ marginTop: 6 }}>
              Sign in to manage your programs, events and gifts.
            </T>
          </View>
        </Photo>
        <Group style={{ marginTop: 20 }}>
          {perks.map((p) => (
            <ListItem key={p.title} icon={p.icon} title={p.title} subtitle={p.body} />
          ))}
        </Group>
        <View style={{ paddingHorizontal: gutter, marginTop: 22 }}>
          <Button title="Sign in" onPress={() => router.push('/sign-in')} />
          <T v="caption" muted center style={{ marginTop: 12 }}>
            Uses a fictional sample account — no personal information needed.
          </T>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: {
    marginHorizontal: gutter,
    marginTop: 22,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.line,
  },
  thumb: { width: 44, height: 44, borderRadius: 10 },
  count: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: color.danger, alignItems: 'center', justifyContent: 'center' },
});
