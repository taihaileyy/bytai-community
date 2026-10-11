import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMyActivity, useSession, useStore } from '@/store/AppStore';
import { gutter, palette } from '@/theme';
import { ToneProvider } from '@/theme/ToneContext';
import { money } from '@/utils/format';
import { FadeIn } from '@/components/Motion';
import { Photo } from '@/components/Photo';
import { T } from '@/components/Text';
import { Avatar, Button, DemoBadge, Fleur, FocusStatusBar, Group, IconButton, ListItem, Row, Tag, type IconName } from '@/components/ui';

export default function Account() {
  return (
    <ToneProvider tone="light">
      <AccountBody />
    </ToneProvider>
  );
}

function AccountBody() {
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const { member, isAdmin } = useSession();
  const { enrollments, registrations, donations, unread } = useMyActivity();
  if (!member) return <SignedOut />;

  const upcoming = registrations.filter((r) => {
    const e = state.events.find((x) => x.id === r.eventId);
    return e && new Date(e.date).getTime() > Date.now();
  }).length;
  const given = donations.reduce((s, d) => s + d.amount, 0);

  return (
    <View style={{ flex: 1, backgroundColor: palette.ivory }}>
      <FocusStatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 40 }}>
        <Row style={{ justifyContent: 'space-between', paddingHorizontal: gutter }}>
          <T v="display" accessibilityRole="header">
            My Profile
          </T>
          <IconButton icon="settings-outline" tone="ghost" label="Settings" onPress={() => router.push('/settings')} />
        </Row>

        <FadeIn>
          <Row gap={18} style={{ paddingHorizontal: gutter, marginTop: 18 }}>
            <Avatar name={member.name} photo="coffeeSmile" size={92} ring />
            <View style={{ flex: 1 }}>
              <T v="title1">{member.name.split(' ')[0]}</T>
              <T v="callout" muted style={{ marginTop: 2 }}>
                {member.neighborhood}, New Orleans, LA
              </T>
              <View style={{ marginTop: 10 }}>
                <Tag label={isAdmin ? 'Program Director' : 'Community Member'} tone="gold" />
              </View>
            </View>
          </Row>
        </FadeIn>

        <Group style={{ marginTop: 26 }} card={false}>
          <ListItem padded={false} icon="grid-outline" title="My Programs" value={`${enrollments.length} active`} onPress={() => router.push('/my-programs')} />
          <ListItem padded={false} icon="calendar-outline" title="My Events" value={`${upcoming} upcoming`} onPress={() => router.push('/my-events')} />
          <ListItem padded={false} icon="heart-outline" title="My Donations" value={money(given)} onPress={() => router.push('/donations')} />
          <ListItem padded={false} icon="time-outline" title="Volunteer Hours" value={`${member.volunteerHours} hrs`} />
          <ListItem
            padded={false}
            icon="notifications-outline"
            title="Notifications"
            onPress={() => router.push('/notifications')}
            trailing={
              unread ? (
                <View style={styles.count}>
                  <T v="caption" c={palette.ivory} style={{ fontSize: 11 }}>
                    {unread}
                  </T>
                </View>
              ) : undefined
            }
          />
          <ListItem padded={false} icon="settings-outline" title="Settings" onPress={() => router.push('/settings')} />
        </Group>

        <T v="eyebrow" muted style={{ marginHorizontal: gutter, marginTop: 30, marginBottom: 6 }}>
          Explore
        </T>
        <Group card={false}>
          <ListItem padded={false} icon="map-outline" title="Community Near You" subtitle="Programs, events and resources on the map" onPress={() => router.push('/map')} />
          <ListItem padded={false} icon="stats-chart-outline" title="Our Impact" subtitle="What the community achieved this year" onPress={() => router.push('/impact')} />
          <ListItem padded={false} icon="megaphone-outline" title="News & Announcements" onPress={() => router.push('/announcements')} />
          {isAdmin ? <ListItem padded={false} icon="speedometer-outline" title="Admin Dashboard" subtitle="Members, events, donations, reporting" onPress={() => router.push('/admin')} /> : null}
        </Group>

        <View style={{ alignItems: 'center', marginTop: 34, paddingHorizontal: 40 }}>
          <Fleur size={20} color={palette.goldDeep} />
          <T v="caption" muted center style={{ marginTop: 8 }}>
            ByTAI Community · a builtbyTAI portfolio prototype{'\n'}All people and figures are fictional sample data.
          </T>
        </View>
      </ScrollView>
    </View>
  );
}

function SignedOut() {
  const insets = useSafeAreaInsets();
  const perks: { icon: IconName; title: string; body: string }[] = [
    { icon: 'grid-outline', title: 'Enroll in programs', body: 'Mentorship, housing, arts and workforce' },
    { icon: 'calendar-outline', title: 'Register for events', body: 'Reminders and a check-in code' },
    { icon: 'heart-outline', title: 'Track your giving', body: 'Receipts and monthly gifts in one place' },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: palette.ivory }}>
      <FocusStatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Photo photo="youthMural" width={1200} scrim={0.92} style={{ height: 380 }} position="top">
          <View style={{ position: 'absolute', top: insets.top + 10, left: gutter }}>
            <DemoBadge onImage />
          </View>
          <View style={{ position: 'absolute', left: gutter, right: gutter, bottom: 28 }}>
            <T v="eyebrow" c={palette.gold}>
              Member portal
            </T>
            <T v="display" c={palette.ivory} style={{ marginTop: 8 }} accessibilityRole="header">
              Welcome to the community.
            </T>
          </View>
        </Photo>
        <Group style={{ marginTop: 22 }}>
          {perks.map((p) => (
            <ListItem key={p.title} icon={p.icon} title={p.title} subtitle={p.body} />
          ))}
        </Group>
        <View style={{ paddingHorizontal: gutter, marginTop: 22 }}>
          <Button title="Sign In" variant="purple" iconRight="arrow-forward" onPress={() => router.push('/sign-in')} />
          <Button title="Explore the community map" variant="ghost" onPress={() => router.push('/map')} style={{ marginTop: 6 }} />
          <T v="caption" muted center style={{ marginTop: 8 }}>
            Uses a fictional sample account — no personal information needed.
          </T>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  count: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: palette.purple, alignItems: 'center', justifyContent: 'center' },
});

