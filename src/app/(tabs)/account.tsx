import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ORG } from '@/data/seed';
import { useActions, useMyActivity, useSession, useStore } from '@/store/AppStore';
import { palette, radius, space } from '@/theme';
import { longDate, money, relative, shortDate } from '@/utils/format';
import { confirmAction } from '@/utils/confirm';
import { FadeIn } from '@/components/Motion';
import { Txt } from '@/components/Txt';
import { Avatar, Button, Card, Divider, EmptyState, FocusStatusBar, ListRow, PageTitle, Row, Screen, SectionHeader, type IconName } from '@/components/ui';

export default function Account() {
  const { state } = useStore();
  const { member, isAdmin } = useSession();
  const { enrollments, registrations, donations, notifications, unread } = useMyActivity();
  const actions = useActions();

  if (!member) return <SignedOut />;

  const myPrograms = enrollments.map((e) => ({ e, p: state.programs.find((p) => p.id === e.programId) })).filter((x) => x.p);
  const myEvents = registrations
    .map((r) => ({ r, ev: state.events.find((e) => e.id === r.eventId) }))
    .filter((x) => x.ev)
    .sort((a, b) => a.ev!.date.localeCompare(b.ev!.date));
  const given = donations.reduce((s, d) => s + d.amount, 0);

  const stats: { label: string; value: string }[] = [
    { label: 'Programs', value: String(myPrograms.length) },
    { label: 'Events', value: String(myEvents.length) },
    { label: 'Given', value: money(given) },
    { label: 'Vol. hours', value: String(member.volunteerHours) },
  ];

  return (
    <Screen>
      <FocusStatusBar style="dark" />
      <PageTitle eyebrow="Member portal" title="My account" />

      <FadeIn>
        <LinearGradient colors={[palette.night, palette.greenDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.profile}>
          <Row gap={14}>
            <Avatar name={member.name} color={palette.green} size={58} />
            <View style={{ flex: 1 }}>
              <Txt variant="title" color={palette.cream}>
                {member.name}
              </Txt>
              <Txt variant="caption" color="rgba(241,238,228,0.7)">
                {member.email}
              </Txt>
              <Row gap={6} style={{ marginTop: 6 }}>
                <Ionicons name="location-outline" size={13} color={palette.mintBright} />
                <Txt variant="caption" color={palette.mintBright}>
                  {member.neighborhood} · Member since {new Date(member.joined).getFullYear()}
                </Txt>
              </Row>
            </View>
          </Row>
          <View style={styles.stats}>
            {stats.map((s, i) => (
              <View key={s.label} style={[styles.stat, i > 0 && styles.statBorder]}>
                <Txt variant="heading" color={palette.cream}>
                  {s.value}
                </Txt>
                <Txt variant="caption" color="rgba(241,238,228,0.6)" style={{ fontSize: 11 }}>
                  {s.label}
                </Txt>
              </View>
            ))}
          </View>
        </LinearGradient>
      </FadeIn>

      {isAdmin ? (
        <Card onPress={() => router.push('/admin')} style={{ marginTop: 14, backgroundColor: palette.ink, borderColor: palette.ink }}>
          <Row gap={14}>
            <View style={styles.adminIcon}>
              <Ionicons name="speedometer" size={22} color={palette.night} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="heading" color={palette.cream}>
                Open admin console
              </Txt>
              <Txt variant="caption" color="rgba(241,238,228,0.65)">
                Members, donations, events and analytics
              </Txt>
            </View>
            <Ionicons name="arrow-forward" size={20} color={palette.mintBright} />
          </Row>
        </Card>
      ) : null}

      <Card onPress={() => router.push('/notifications')} style={{ marginTop: 14 }}>
        <Row gap={14}>
          <View style={styles.bell}>
            <Ionicons name="notifications" size={20} color={palette.green} />
            {unread ? <View style={styles.bellDot} /> : null}
          </View>
          <View style={{ flex: 1 }}>
            <Txt variant="heading">Notifications</Txt>
            <Txt variant="caption" muted>
              {unread ? `${unread} unread · ${notifications[0] ? relative(notifications[0].date) : ''}` : 'You’re all caught up'}
            </Txt>
          </View>
          <Ionicons name="chevron-forward" size={18} color={palette.stone} />
        </Row>
      </Card>

      <SectionHeader eyebrow="Enrolled" title="My programs" action={myPrograms.length ? 'Browse' : undefined} onAction={() => router.push('/programs')} />
      <Card style={{ paddingVertical: 4 }}>
        {myPrograms.length ? (
          myPrograms.map(({ e, p }, i) => (
            <View key={e.id}>
              {i > 0 ? <Divider /> : null}
              <ListRow
                icon={p!.icon as IconName}
                title={p!.title}
                subtitle={`${e.status === 'waitlist' ? 'Waitlist · ' : ''}${p!.schedule}`}
                onPress={() => router.push(`/program/${p!.id}`)}
              />
            </View>
          ))
        ) : (
          <EmptyState icon="school-outline" title="No programs yet" body="Find a program that fits your family." action="Explore programs" onAction={() => router.push('/programs')} />
        )}
      </Card>

      <SectionHeader eyebrow="Registered" title="My events" action={myEvents.length ? 'Calendar' : undefined} onAction={() => router.push('/events')} />
      <Card style={{ paddingVertical: 4 }}>
        {myEvents.length ? (
          myEvents.map(({ r, ev }, i) => (
            <View key={r.id}>
              {i > 0 ? <Divider /> : null}
              <ListRow
                icon={ev!.cancelled ? 'close-circle-outline' : 'calendar-outline'}
                iconColor={ev!.cancelled ? palette.clay : undefined}
                iconBg={ev!.cancelled ? palette.claySoft : undefined}
                title={ev!.title}
                subtitle={`${ev!.cancelled ? 'Cancelled · ' : ''}${longDate(ev!.date)} · ${r.confirmation}${r.guests ? ` · +${r.guests}` : ''}`}
                onPress={() => router.push(`/event/${ev!.id}`)}
              />
            </View>
          ))
        ) : (
          <EmptyState icon="calendar-outline" title="No RSVPs yet" body="Volunteer days, workshops and celebrations are waiting." action="See events" onAction={() => router.push('/events')} />
        )}
      </Card>

      <SectionHeader eyebrow="Giving" title="Recent gifts" action="History" onAction={() => router.push('/donations')} />
      <Card style={{ paddingVertical: 4 }}>
        {donations.slice(0, 2).map((d, i) => (
          <View key={d.id}>
            {i > 0 ? <Divider /> : null}
            <ListRow icon={d.frequency === 'monthly' ? 'repeat' : 'heart'} title={`${money(d.amount)} · ${d.fund}`} subtitle={`${shortDate(d.date)} · ${d.receipt}`} />
          </View>
        ))}
        {!donations.length ? <ListRow icon="heart-outline" title="No gifts yet" subtitle="Make your first gift on the Give tab" onPress={() => router.push('/give')} /> : null}
      </Card>

      <SectionHeader title="Settings" />
      <Card style={{ paddingVertical: 4 }}>
        <ListRow icon="refresh" title="Reset demo data" subtitle="Restore the original sample data" iconColor="#A0782A" iconBg={palette.goldSoft} onPress={() => confirmAction('Reset demo data?', 'All enrollments, RSVPs, gifts and admin changes from this session will be cleared.', actions.resetDemo, 'Reset')} />
        <Divider />
        <ListRow icon="log-out-outline" title="Sign out" iconColor={palette.clay} iconBg={palette.claySoft} onPress={actions.signOut} />
      </Card>

      <Txt variant="caption" muted center style={{ marginTop: 28 }}>
        ByTAI Community · Portfolio demo by builtbyTAI{'\n'}Sample data for {ORG.name} (fictional)
      </Txt>
    </Screen>
  );
}

function SignedOut() {
  const perks: { icon: IconName; title: string; body: string }[] = [
    { icon: 'school-outline', title: 'Enroll in programs', body: 'Save your spot in classes, clubs and services.' },
    { icon: 'calendar-outline', title: 'RSVP to events', body: 'Get reminders and a check-in code.' },
    { icon: 'heart-outline', title: 'Track your giving', body: 'Receipts and monthly gifts in one place.' },
    { icon: 'notifications-outline', title: 'Stay in the loop', body: 'Updates from the programs you care about.' },
  ];
  return (
    <Screen>
      <FocusStatusBar style="dark" />
      <PageTitle eyebrow="Member portal" title="Welcome, neighbor" subtitle="Sign in to manage your programs, events and gifts." />
      <Card>
        {perks.map((p, i) => (
          <View key={p.title}>
            {i > 0 ? <Divider /> : null}
            <ListRow icon={p.icon} title={p.title} subtitle={p.body} />
          </View>
        ))}
      </Card>
      <Button title="Sign in to the demo" icon="log-in-outline" style={{ marginTop: 22 }} onPress={() => router.push('/sign-in')} />
      <Txt variant="caption" muted center style={{ marginTop: 12 }}>
        Uses a fictional sample account — no personal information needed.
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { borderRadius: radius.xl, padding: space.xl },
  stats: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(241,238,228,0.2)',
  },
  stat: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: 'rgba(241,238,228,0.2)' },
  adminIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: palette.mintBright, alignItems: 'center', justifyContent: 'center' },
  bell: { width: 44, height: 44, borderRadius: 14, backgroundColor: palette.mintSoft, alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 10, right: 11, width: 9, height: 9, borderRadius: 5, backgroundColor: palette.clay, borderWidth: 2, borderColor: palette.mintSoft },
});
