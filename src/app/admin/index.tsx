import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActions, useAdminStats, useStore } from '@/store/AppStore';
import { gutter, palette, radius } from '@/theme';
import { ToneProvider } from '@/theme/ToneContext';
import { money, relative } from '@/utils/format';
import { FadeIn, PressScale } from '@/components/Motion';
import { T } from '@/components/Text';
import { FocusStatusBar, Group, ListItem, Row, SectionHeader, Wordmark, type IconName } from '@/components/ui';
import { StatCard } from '@/components/domain';

type Period = 'month' | 'year';

export default function AdminDashboard() {
  return (
    <ToneProvider tone="dark">
      <Dashboard />
    </ToneProvider>
  );
}

function Dashboard() {
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const stats = useAdminStats();
  const actions = useActions();
  const [period, setPeriod] = useState<Period>('month');
  const [menu, setMenu] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // "This year" multiplies the sample month figures; live demo activity is included in both.
  const k = period === 'year' ? 11.4 : 1;
  const cards = [
    { label: 'Total Members', value: stats.totalMembers, delta: '12% vs last period', icon: 'people-outline' as IconName },
    { label: 'Event Registrations', value: Math.round(stats.eventRegistrations * k), delta: '18%', icon: 'calendar-outline' as IconName },
    { label: 'Donations Received', value: Math.round(stats.donations * k), prefix: '$', delta: '24%', icon: 'cash-outline' as IconName },
    { label: 'Program Enrollments', value: Math.round(stats.programEnrollments * k), delta: '15%', icon: 'grid-outline' as IconName },
  ];

  const activity = useMemo(() => {
    const name = (id: string) => state.members.find((m) => m.id === id)?.name ?? 'A member';
    return [
      ...state.members.map((m) => ({ date: m.joined, icon: 'person-add-outline' as IconName, text: 'New member joined', sub: m.name })),
      ...state.registrations.map((r) => ({ date: r.date, icon: 'calendar-outline' as IconName, text: `Event registration: ${state.events.find((e) => e.id === r.eventId)?.title ?? 'Event'}`, sub: name(r.memberId) })),
      ...state.donations.slice(0, 20).map((d) => ({ date: d.date, icon: 'heart-outline' as IconName, text: `New donation: ${money(d.amount)}`, sub: `${d.donorName} · ${d.fund}` })),
      ...state.enrollments.map((e) => ({ date: e.date, icon: 'grid-outline' as IconName, text: 'Program enrollment', sub: `${name(e.memberId)} · ${state.programs.find((p) => p.id === e.programId)?.title ?? ''}` })),
    ]
      .filter((a) => new Date(a.date).getTime() <= Date.now())
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state]);

  const nav: { icon: IconName; title: string; sub: string; href: string }[] = [
    { icon: 'people-outline', title: 'Members', sub: `${state.members.length} in demo`, href: '/admin/members' },
    { icon: 'grid-outline', title: 'Programs', sub: 'Enrollments & capacity', href: '/admin/enrollments' },
    { icon: 'calendar-outline', title: 'Events', sub: 'Create & manage', href: '/admin/events' },
    { icon: 'bar-chart-outline', title: 'Reporting', sub: 'Donations & trends', href: '/admin/donations' },
    { icon: 'megaphone-outline', title: 'Announcements', sub: 'Post to members', href: '/admin/announcements' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: palette.midnight }}>
      <FocusStatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 48 + insets.bottom }}>
        <Row style={{ justifyContent: 'space-between', paddingHorizontal: gutter }}>
          <Wordmark />
          <PressScale onPress={() => setMenu(!menu)} accessibilityRole="button" accessibilityLabel="Admin menu" accessibilityState={{ expanded: menu }}>
            <Row gap={6} style={styles.adminPill}>
              <T v="subhead" c={palette.ivory}>
                Admin
              </T>
              <Ionicons name={menu ? 'chevron-up' : 'chevron-down'} size={14} color={palette.gold} />
            </Row>
          </PressScale>
        </Row>
        {menu ? (
          <FadeIn distance={6} style={styles.menu}>
            <PressScale onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} accessibilityRole="button" style={styles.menuItem}>
              <Row gap={10}>
                <Ionicons name="phone-portrait-outline" size={17} color={palette.gold} />
                <T v="calloutMedium">Back to member app</T>
              </Row>
            </PressScale>
            <PressScale
              onPress={() => {
                actions.signOut();
                router.replace('/');
              }}
              accessibilityRole="button"
              style={styles.menuItem}
            >
              <Row gap={10}>
                <Ionicons name="log-out-outline" size={17} color={palette.gold} />
                <T v="calloutMedium">Sign out</T>
              </Row>
            </PressScale>
          </FadeIn>
        ) : null}

        <Row style={{ justifyContent: 'space-between', paddingHorizontal: gutter, marginTop: 26 }}>
          <T v="title1" accessibilityRole="header">
            Overview
          </T>
          <PressScale onPress={() => setPeriod(period === 'month' ? 'year' : 'month')} accessibilityRole="button" accessibilityLabel={`Period: ${period === 'month' ? 'This month' : 'This year'}. Tap to switch.`}>
            <Row gap={6} style={styles.period}>
              <T v="subhead" c={palette.ivory}>
                {period === 'month' ? 'This Month' : 'This Year'}
              </T>
              <Ionicons name="swap-vertical" size={13} color={palette.gold} />
            </Row>
          </PressScale>
        </Row>

        <View style={styles.grid}>
          {cards.map((c) => (
            <StatCard key={c.label + period} value={c.value} label={c.label} prefix={c.prefix} delta={`${c.delta.split(' ')[0]}`} />
          ))}
        </View>
        <T v="caption" muted style={{ marginHorizontal: gutter, marginTop: 8 }}>
          Sample figures · demo activity is added live
        </T>

        <SectionHeader title="Recent Activity" action={showAll ? 'Show less' : 'View all'} onAction={() => setShowAll(!showAll)} />
        <Group>
          {activity.slice(0, showAll ? 14 : 5).map((a, i) => (
            <ListItem
              key={i}
              leading={
                <View style={styles.actIcon}>
                  <Ionicons name={a.icon} size={16} color={palette.gold} />
                </View>
              }
              title={a.text}
              subtitle={`${a.sub} · ${relative(a.date)}`}
            />
          ))}
        </Group>

        <SectionHeader title="Manage" />
        <Group>
          {nav.map((n) => (
            <ListItem
              key={n.href}
              leading={
                <View style={styles.actIcon}>
                  <Ionicons name={n.icon} size={16} color={palette.gold} />
                </View>
              }
              title={n.title}
              subtitle={n.sub}
              onPress={() => router.push(n.href as never)}
            />
          ))}
        </Group>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  adminPill: { height: 32, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: palette.charcoal, borderWidth: StyleSheet.hairlineWidth, borderColor: '#44454E' },
  menu: { marginHorizontal: gutter, marginTop: 10, borderRadius: radius.md, backgroundColor: palette.charcoal, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: '#44454E' },
  menuItem: { paddingHorizontal: 16, paddingVertical: 13 },
  period: { height: 30, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1, borderColor: '#44454E' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: gutter, marginTop: 16 },
  actIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(229,183,107,0.12)', alignItems: 'center', justifyContent: 'center' },
});

