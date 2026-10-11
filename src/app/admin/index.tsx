import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useImpact, useSession, useStore } from '@/store/AppStore';
import { color, gutter, radius } from '@/theme';
import { compact, money, monthShort, relative } from '@/utils/format';
import { FadeIn } from '@/components/Motion';
import { T } from '@/components/Text';
import { Group, ListItem, Row, SectionHeader, type IconName } from '@/components/ui';
import { BarChart, RankedBars, Stat, StatStrip } from '@/components/domain';
import { AdminScreen, Panel } from '@/components/admin';

export default function AdminDashboard() {
  const { state } = useStore();
  const { member } = useSession();
  const impact = useImpact();

  const data = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - 5 + i, 1));
    const byMonth = months.map((m) => ({
      label: monthShort(m.toISOString()),
      value: state.donations
        .filter((d) => {
          const x = new Date(d.date);
          return x.getMonth() === m.getMonth() && x.getFullYear() === m.getFullYear();
        })
        .reduce((s, d) => s + d.amount, 0),
    }));
    const since30 = Date.now() - 30 * 86400000;
    const last30 = state.donations.filter((d) => new Date(d.date).getTime() > since30).reduce((s, d) => s + d.amount, 0);
    const monthlyDonors = new Set(state.donations.filter((d) => d.frequency === 'monthly').map((d) => d.donorName)).size;
    const byProgram = state.programs
      .map((p) => ({ label: p.title, value: state.enrollments.filter((e) => e.programId === p.id).length, sub: `${p.enrolled}/${p.capacity} seats filled` }))
      .sort((a, b) => b.value - a.value);
    const funds = Object.entries(state.donations.reduce<Record<string, number>>((acc, d) => ({ ...acc, [d.fund]: (acc[d.fund] ?? 0) + d.amount }), {}))
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
    const upcomingRsvps = state.registrations.filter((r) => {
      const e = state.events.find((x) => x.id === r.eventId);
      return e && new Date(e.date).getTime() > Date.now();
    }).length;
    const name = (id: string) => state.members.find((m) => m.id === id)?.name ?? 'A member';
    const activity = [
      ...state.donations.slice(0, 6).map((d) => ({ date: d.date, icon: 'heart-outline' as IconName, text: `${d.donorName} gave ${money(d.amount)}`, sub: d.fund })),
      ...state.enrollments.slice(0, 6).map((e) => ({ date: e.date, icon: 'compass-outline' as IconName, text: `${name(e.memberId)} enrolled`, sub: state.programs.find((p) => p.id === e.programId)?.title ?? '' })),
      ...state.registrations.slice(0, 6).map((r) => ({ date: r.date, icon: 'calendar-clear-outline' as IconName, text: `${name(r.memberId)} RSVP’d`, sub: state.events.find((e) => e.id === r.eventId)?.title ?? '' })),
    ]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);
    return { byMonth, last30, monthlyDonors, byProgram, funds, upcomingRsvps, activity };
  }, [state]);

  const nav: { icon: IconName; title: string; sub: string; href: string }[] = [
    { icon: 'people-outline', title: 'Members', sub: `${state.members.length} people`, href: '/admin/members' },
    { icon: 'cash-outline', title: 'Donations', sub: `${state.donations.length} gifts`, href: '/admin/donations' },
    { icon: 'compass-outline', title: 'Enrollments', sub: `${state.enrollments.length} active`, href: '/admin/enrollments' },
    { icon: 'calendar-clear-outline', title: 'Events', sub: `${state.events.length} scheduled`, href: '/admin/events' },
    { icon: 'megaphone-outline', title: 'Announcements', sub: `${state.announcements.length} posted`, href: '/admin/announcements' },
  ];
  const sixMonth = data.byMonth.reduce((s, m) => s + m.value, 0);

  return (
    <AdminScreen title="Overview" root>
      <T v="callout" muted style={{ marginHorizontal: gutter, marginTop: -10, marginBottom: 18 }}>
        Signed in as {member?.name} · Program Director
      </T>

      <FadeIn>
        <View style={styles.kpis}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 18 }}>
            <T v="overline" c="rgba(255,255,255,0.6)">
              Last 30 days
            </T>
            <T v="caption" c="rgba(255,255,255,0.6)">
              {data.monthlyDonors} monthly donors
            </T>
          </Row>
          <T v="caption" c="rgba(255,255,255,0.7)">
            Raised
          </T>
          <T style={styles.kpiBig} tabular>
            {money(data.last30)}
          </T>
          <View style={styles.kpiRule} />
          <StatStrip light>
            <Stat light value={state.members.length} label="Members" />
            <Stat light value={state.enrollments.length} label="Enrollments" />
            <Stat light value={data.upcomingRsvps} label="RSVPs" />
          </StatStrip>
        </View>
      </FadeIn>

      <SectionHeader title="Donations" caption={`${money(sixMonth)} over the last six months`} />
      <Panel>
        <BarChart data={data.byMonth} format={(n) => `$${compact(n)}`} />
      </Panel>

      <SectionHeader title="Enrollments by program" />
      <Panel>
        <RankedBars data={data.byProgram} />
      </Panel>

      <SectionHeader title="Giving by fund" />
      <Panel>
        <RankedBars data={data.funds} format={(n) => money(n)} />
      </Panel>

      <SectionHeader title="Community impact" caption="Year to date" />
      <Panel>
        <StatStrip>
          <Stat value={impact.familiesServed} label="Families" />
          <Stat value={impact.mealsShared} label="Meals" compactNum />
          <Stat value={impact.raisedThisYear} prefix="$" label="Raised" compactNum />
        </StatStrip>
      </Panel>

      <SectionHeader title="Manage" />
      <Group>
        {nav.map((n) => (
          <ListItem key={n.href} icon={n.icon} title={n.title} value={n.sub} onPress={() => router.push(n.href as never)} />
        ))}
      </Group>

      <SectionHeader title="Recent activity" />
      <Group>
        {data.activity.map((a, i) => (
          <ListItem key={i} icon={a.icon} title={a.text} subtitle={a.sub} value={relative(a.date)} />
        ))}
      </Group>
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  kpis: { marginHorizontal: gutter, padding: 20, borderRadius: radius.xl, backgroundColor: color.ink },
  kpiBig: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 40, lineHeight: 46, letterSpacing: -1.4, color: color.white, marginTop: 2 },
  kpiRule: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.18)', marginVertical: 18 },
});
