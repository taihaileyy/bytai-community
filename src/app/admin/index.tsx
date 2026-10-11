import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useImpact, useSession, useStore } from '@/store/AppStore';
import { dark, getCategoryColor, palette, radius } from '@/theme';
import { compact, money, monthShort, relative } from '@/utils/format';
import { FadeIn } from '@/components/Motion';
import { Txt } from '@/components/Txt';
import { Avatar, Card, Divider, FocusStatusBar, ListRow, Row, Screen, SectionHeader, type IconName } from '@/components/ui';
import { BarChart, HBarList, StatTile } from '@/components/domain';
import { AdminHeader } from '@/components/admin';

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
    const last30 = state.donations.filter((d) => new Date(d.date).getTime() > since30);
    const monthlyDonors = new Set(state.donations.filter((d) => d.frequency === 'monthly').map((d) => d.donorName)).size;
    const byProgram = state.programs
      .map((p) => ({
        label: p.title,
        value: state.enrollments.filter((e) => e.programId === p.id).length,
        color: getCategoryColor(p.category).fg,
        sub: `${p.enrolled}/${p.capacity} seats filled overall`,
      }))
      .sort((a, b) => b.value - a.value);
    const funds = Object.entries(
      state.donations.reduce<Record<string, number>>((acc, d) => ({ ...acc, [d.fund]: (acc[d.fund] ?? 0) + d.amount }), {}),
    )
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
    const upcomingRsvps = state.registrations.filter((r) => {
      const e = state.events.find((x) => x.id === r.eventId);
      return e && new Date(e.date).getTime() > Date.now();
    }).length;
    const activity = [
      ...state.donations.slice(0, 6).map((d) => ({ date: d.date, icon: 'heart' as IconName, text: `${d.donorName} gave ${money(d.amount)} to ${d.fund}` })),
      ...state.enrollments.slice(0, 6).map((e) => ({
        date: e.date,
        icon: 'school' as IconName,
        text: `${state.members.find((m) => m.id === e.memberId)?.name ?? 'A member'} joined ${state.programs.find((p) => p.id === e.programId)?.title ?? 'a program'}`,
      })),
      ...state.registrations.slice(0, 6).map((r) => ({
        date: r.date,
        icon: 'calendar' as IconName,
        text: `${state.members.find((m) => m.id === r.memberId)?.name ?? 'A member'} RSVP’d to ${state.events.find((e) => e.id === r.eventId)?.title ?? 'an event'}`,
      })),
    ]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);
    return {
      byMonth,
      last30Total: last30.reduce((s, d) => s + d.amount, 0),
      monthlyDonors,
      byProgram,
      funds,
      upcomingRsvps,
      activity,
    };
  }, [state]);

  const nav: { icon: IconName; title: string; sub: string; href: string }[] = [
    { icon: 'people', title: 'Members', sub: `${state.members.length} people`, href: '/admin/members' },
    { icon: 'cash', title: 'Donations', sub: `${state.donations.length} gifts recorded`, href: '/admin/donations' },
    { icon: 'school', title: 'Program enrollments', sub: `${state.enrollments.length} enrollments`, href: '/admin/enrollments' },
    { icon: 'calendar', title: 'Manage events', sub: `${state.events.length} events`, href: '/admin/events' },
    { icon: 'megaphone', title: 'Announcements', sub: `${state.announcements.length} posted`, href: '/admin/announcements' },
  ];

  return (
    <Screen header={<AdminHeader title="Dashboard" root />}>
      <FocusStatusBar style="light" />
      <Row gap={10} style={{ marginBottom: 18 }}>
        {member ? <Avatar name={member.name} color={palette.green} size={34} /> : null}
        <Txt variant="body" muted style={{ flex: 1 }}>
          Signed in as <Txt variant="bodyStrong">{member?.name}</Txt> · Program Director
        </Txt>
      </Row>

      <FadeIn>
        <View style={styles.grid}>
          <StatTile tone="scheme" icon="people-outline" value={state.members.length} label="Members" delta="+3 this month" />
          <StatTile tone="scheme" icon="cash-outline" prefix="$" value={data.last30Total} label="Gifts, last 30 days" />
          <StatTile tone="scheme" icon="school-outline" value={state.enrollments.length} label="Active enrollments" />
          <StatTile tone="scheme" icon="calendar-outline" value={data.upcomingRsvps} label="Upcoming RSVPs" />
        </View>
      </FadeIn>

      <SectionHeader eyebrow="Analytics" title="Donations by month" />
      <Card>
        <Row style={{ justifyContent: 'space-between', marginBottom: 16 }}>
          <View>
            <Txt variant="caption" muted>
              Last 6 months
            </Txt>
            <Txt variant="title">{money(data.byMonth.reduce((s, m) => s + m.value, 0))}</Txt>
          </View>
          <View style={styles.pill}>
            <Ionicons name="repeat" size={13} color={palette.mintBright} />
            <Txt variant="caption" color={palette.mintBright}>
              {data.monthlyDonors} monthly donors
            </Txt>
          </View>
        </Row>
        <BarChart data={data.byMonth} format={(n) => `$${compact(n)}`} />
      </Card>

      <SectionHeader eyebrow="Analytics" title="Enrollments by program" />
      <Card>
        <HBarList data={data.byProgram} />
      </Card>

      <SectionHeader eyebrow="Analytics" title="Giving by fund" />
      <Card>
        <HBarList data={data.funds.map((f, i) => ({ ...f, color: [palette.mint, palette.gold, palette.sky, palette.clay][i % 4] }))} format={(n) => money(n)} />
      </Card>

      <SectionHeader eyebrow="Community impact" title="Year to date" />
      <View style={styles.grid}>
        <StatTile tone="scheme" icon="home-outline" value={impact.familiesServed} label="Families served" />
        <StatTile tone="scheme" icon="restaurant-outline" value={impact.mealsShared} label="Meals shared" />
        <StatTile tone="scheme" icon="time-outline" value={impact.volunteerHours} label="Volunteer hours" />
        <StatTile tone="scheme" icon="trending-up-outline" prefix="$" value={impact.raisedThisYear} label="Raised this year" />
      </View>

      <SectionHeader title="Manage" />
      <Card style={{ paddingVertical: 4 }}>
        {nav.map((n, i) => (
          <View key={n.href}>
            {i > 0 ? <Divider /> : null}
            <ListRow icon={n.icon} title={n.title} subtitle={n.sub} onPress={() => router.push(n.href as never)} />
          </View>
        ))}
      </Card>

      <SectionHeader title="Recent activity" />
      <Card style={{ paddingVertical: 4 }}>
        {data.activity.map((a, i) => (
          <View key={i}>
            {i > 0 ? <Divider /> : null}
            <Row gap={12} style={{ paddingVertical: 12 }}>
              <View style={styles.actIcon}>
                <Ionicons name={a.icon} size={15} color={palette.mintBright} />
              </View>
              <Txt variant="caption" style={{ flex: 1, fontSize: 13 }}>
                {a.text}
              </Txt>
              <Txt variant="caption" muted style={{ fontSize: 11 }}>
                {relative(a.date)}
              </Txt>
            </Row>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: dark.accentSoft },
  actIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: dark.accentSoft, alignItems: 'center', justifyContent: 'center' },
});
