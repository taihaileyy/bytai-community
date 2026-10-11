/** Feature components built from the UI kit: program, event and announcement cards, charts. */
import React from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { Announcement, CommunityEvent, Donation, Program } from '@/data/types';
import { getCategoryColor, palette, radius, shadow, space } from '@/theme';
import { useScheme } from '@/theme/SchemeContext';
import { dayNum, daysUntil, monthShort, relative, shortDate, time, weekday, money } from '@/utils/format';
import { GrowBar, PressScale, useCountUp } from './Motion';
import { Txt } from './Txt';
import { Card, IconBubble, Row, Tag, type IconName } from './ui';

/* ───────── Programs ───────── */

const featuredGradients: [string, string][] = [
  ['#1F5745', '#2F7A63'],
  ['#2A2414', '#4A3F22'],
  ['#24364A', '#4F7FA8'],
];

export function ProgramFeatureCard({ program, index = 0, enrolled }: { program: Program; index?: number; enrolled?: boolean }) {
  const g = featuredGradients[index % featuredGradients.length];
  const spots = program.capacity - program.enrolled;
  return (
    <PressScale onPress={() => router.push(`/program/${program.id}`)} accessibilityRole="button" style={{ width: 268 }}>
      <LinearGradient colors={g} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.feature, shadow.lifted]}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={styles.featureIcon}>
            <Ionicons name={program.icon as IconName} size={22} color={palette.cream} />
          </View>
          {enrolled ? (
            <Tag label="Enrolled" fg={palette.night} bg={palette.mintBright} icon="checkmark" />
          ) : (
            <Tag label={program.category} fg={palette.cream} bg="rgba(241,238,228,0.14)" />
          )}
        </Row>
        <View style={{ flex: 1 }} />
        <Txt variant="title" color={palette.cream} numberOfLines={2}>
          {program.title}
        </Txt>
        <Txt variant="caption" color="rgba(241,238,228,0.75)" numberOfLines={2} style={{ marginTop: 6 }}>
          {program.summary}
        </Txt>
        <Row style={{ marginTop: 14 }} gap={6}>
          <Ionicons name="time-outline" size={13} color={palette.mintBright} />
          <Txt variant="caption" color={palette.mintBright} numberOfLines={1} style={{ flex: 1 }}>
            {program.schedule}
          </Txt>
          <Txt variant="caption" color="rgba(241,238,228,0.65)">
            {spots > 0 ? `${spots} spots` : 'Waitlist'}
          </Txt>
        </Row>
      </LinearGradient>
    </PressScale>
  );
}

export function ProgramRowCard({ program, enrolled }: { program: Program; enrolled?: boolean }) {
  const s = useScheme();
  const c = getCategoryColor(program.category);
  const fill = program.enrolled / program.capacity;
  return (
    <Card onPress={() => router.push(`/program/${program.id}`)} style={{ marginBottom: 12 }}>
      <Row gap={14} style={{ alignItems: 'flex-start' }}>
        <IconBubble icon={program.icon as IconName} fg={c.fg} bg={c.bg} size={50} />
        <View style={{ flex: 1 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Tag label={program.category} fg={c.fg} bg={c.bg} />
            {enrolled ? <Tag label="Enrolled" fg={palette.green} bg={palette.mintSoft} icon="checkmark" /> : null}
          </Row>
          <Txt variant="heading" style={{ marginTop: 8 }}>
            {program.title}
          </Txt>
          <Txt variant="caption" muted numberOfLines={2} style={{ marginTop: 3 }}>
            {program.summary}
          </Txt>
          <Row gap={6} style={{ marginTop: 10 }}>
            <Ionicons name="calendar-clear-outline" size={13} color={s.muted} />
            <Txt variant="caption" muted numberOfLines={1} style={{ flex: 1 }}>
              {program.schedule}
            </Txt>
          </Row>
          <View style={{ marginTop: 12 }}>
            <GrowBar progress={fill} color={fill > 0.9 ? palette.clay : c.fg} track={s.surface2} height={6} />
            <Txt variant="caption" muted style={{ marginTop: 6, fontSize: 11.5 }}>
              {program.enrolled} of {program.capacity} enrolled · {program.ageGroup}
            </Txt>
          </View>
        </View>
      </Row>
    </Card>
  );
}

/* ───────── Events ───────── */

export function DateBlock({ iso, dark }: { iso: string; dark?: boolean }) {
  const s = useScheme();
  return (
    <View
      style={{
        width: 58,
        paddingVertical: 9,
        borderRadius: radius.md,
        alignItems: 'center',
        backgroundColor: dark ? palette.night : s.accentSoft,
      }}
    >
      <Txt variant="eyebrow" color={dark ? palette.mintBright : s.accent} style={{ fontSize: 10 }}>
        {monthShort(iso)}
      </Txt>
      <Txt variant="title" color={dark ? palette.cream : s.ink} style={{ fontSize: 24, lineHeight: 28 }}>
        {dayNum(iso)}
      </Txt>
      <Txt variant="caption" color={dark ? 'rgba(241,238,228,0.7)' : s.muted} style={{ fontSize: 11 }}>
        {weekday(iso)}
      </Txt>
    </View>
  );
}

export function EventCard({ event, registered }: { event: CommunityEvent; registered?: boolean }) {
  const s = useScheme();
  const c = getCategoryColor(event.category);
  const d = daysUntil(event.date);
  const soon = d >= 0 && d <= 7;
  return (
    <Card onPress={() => router.push(`/event/${event.id}`)} style={{ marginBottom: 12 }}>
      <Row gap={14} style={{ alignItems: 'flex-start' }}>
        <DateBlock iso={event.date} dark={registered} />
        <View style={{ flex: 1 }}>
          <Row gap={6} style={{ flexWrap: 'wrap' }}>
            <Tag label={event.category} fg={c.fg} bg={c.bg} />
            {event.cancelled ? <Tag label="Cancelled" fg={palette.clay} bg={palette.claySoft} /> : null}
            {registered ? <Tag label="Going" fg={palette.green} bg={palette.mintSoft} icon="checkmark" /> : null}
            {!registered && soon && !event.cancelled ? (
              <Tag label={d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `In ${d} days`} fg="#8A6A1E" bg={palette.goldSoft} />
            ) : null}
          </Row>
          <Txt variant="heading" style={{ marginTop: 8 }} numberOfLines={2}>
            {event.title}
          </Txt>
          <Row gap={6} style={{ marginTop: 6 }}>
            <Ionicons name="time-outline" size={13} color={s.muted} />
            <Txt variant="caption" muted>
              {time(event.date)}
            </Txt>
            <Ionicons name="location-outline" size={13} color={s.muted} style={{ marginLeft: 6 }} />
            <Txt variant="caption" muted numberOfLines={1} style={{ flex: 1 }}>
              {event.location}
            </Txt>
          </Row>
          <Txt variant="caption" muted style={{ marginTop: 6, fontSize: 11.5 }}>
            {event.attending} going · {Math.max(0, event.capacity - event.attending)} spots left
          </Txt>
        </View>
      </Row>
    </Card>
  );
}

/* ───────── Announcements ───────── */

const tagColors: Record<Announcement['tag'], { fg: string; bg: string; icon: IconName }> = {
  News: { fg: palette.sky, bg: palette.skySoft, icon: 'newspaper-outline' },
  Update: { fg: palette.green, bg: palette.mintSoft, icon: 'refresh-outline' },
  Urgent: { fg: palette.clay, bg: palette.claySoft, icon: 'alert-circle-outline' },
  'Thank you': { fg: '#A0782A', bg: palette.goldSoft, icon: 'heart-outline' },
};

export const announcementStyle = (tag: Announcement['tag']) => tagColors[tag];

export function AnnouncementCard({ item, compact }: { item: Announcement; compact?: boolean }) {
  const c = tagColors[item.tag];
  return (
    <Card style={{ marginBottom: 12 }} flat={compact}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row gap={6}>
          <Tag label={item.tag} fg={c.fg} bg={c.bg} icon={c.icon} />
          {item.pinned ? <Tag label="Pinned" fg={palette.night} bg={palette.paper2} icon="pin" /> : null}
        </Row>
        <Txt variant="caption" muted>
          {relative(item.date)}
        </Txt>
      </Row>
      <Txt variant="heading" style={{ marginTop: 10 }}>
        {item.title}
      </Txt>
      <Txt variant="body" muted numberOfLines={compact ? 2 : undefined} style={{ marginTop: 4 }}>
        {item.body}
      </Txt>
    </Card>
  );
}

/* ───────── Stats & charts ───────── */

export function StatTile({
  icon,
  value,
  label,
  prefix = '',
  suffix = '',
  tone = 'light',
  delta,
}: {
  icon: IconName;
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  tone?: 'light' | 'dark' | 'scheme';
  delta?: string;
}) {
  const s = useScheme();
  const n = useCountUp(value);
  const dark = tone === 'dark';
  const bg = tone === 'scheme' ? s.surface : dark ? 'rgba(241,238,228,0.07)' : s.surface;
  const fg = dark ? palette.cream : s.ink;
  const sub = dark ? 'rgba(241,238,228,0.65)' : s.muted;
  return (
    <View
      style={{
        flex: 1,
        minWidth: '45%',
        padding: space.lg,
        borderRadius: radius.lg,
        backgroundColor: bg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: dark ? 'rgba(241,238,228,0.12)' : s.border,
      }}
    >
      <Row style={{ justifyContent: 'space-between' }}>
        <Ionicons name={icon} size={18} color={dark ? palette.mintBright : s.accent} />
        {delta ? (
          <Txt variant="caption" color={dark ? palette.mintBright : s.accent} style={{ fontSize: 11 }}>
            {delta}
          </Txt>
        ) : null}
      </Row>
      <Txt variant="stat" color={fg} style={{ marginTop: 12 }}>
        {prefix}
        {n.toLocaleString('en-US')}
        {suffix}
      </Txt>
      <Txt variant="caption" color={sub} style={{ marginTop: 2 }}>
        {label}
      </Txt>
    </View>
  );
}

/** Vertical bar chart built from plain Views (no native chart dependency). */
export function BarChart({
  data,
  height = 150,
  format = (n: number) => String(n),
  highlightLast = true,
}: {
  data: { label: string; value: number }[];
  height?: number;
  format?: (n: number) => string;
  highlightLast?: boolean;
}) {
  const s = useScheme();
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: height + 40 }}>
      {data.map((d, i) => {
        const last = highlightLast && i === data.length - 1;
        return (
          <View key={d.label + i} style={{ flex: 1, alignItems: 'center' }}>
            <Txt variant="caption" color={last ? s.accent : s.muted} style={{ fontSize: 10.5, marginBottom: 4 }} numberOfLines={1}>
              {format(d.value)}
            </Txt>
            <View style={{ height, width: '100%', justifyContent: 'flex-end' }}>
              <GrowVertical ratio={d.value / max} color={s.accent} dim={!last} delay={i * 60} />
            </View>
            <Txt variant="caption" muted style={{ fontSize: 11, marginTop: 6 }}>
              {d.label}
            </Txt>
          </View>
        );
      })}
    </View>
  );
}

function GrowVertical({ ratio, color, delay, dim }: { ratio: number; color: string; delay: number; dim?: boolean }) {
  const v = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(v, { toValue: Math.max(0.02, ratio), duration: 700, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [ratio, delay, v]);
  return (
    <Animated.View
      style={{
        width: '100%',
        borderRadius: 8,
        backgroundColor: color,
        opacity: dim ? 0.32 : 1,
        height: v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
      }}
    />
  );
}

/** Horizontal labeled bars (e.g. enrollments by program). */
export function HBarList({
  data,
  format = (n: number) => String(n),
}: {
  data: { label: string; value: number; color?: string; sub?: string }[];
  format?: (n: number) => string;
}) {
  const s = useScheme();
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={{ gap: 14 }}>
      {data.map((d, i) => (
        <View key={d.label}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <Txt variant="label" numberOfLines={1} style={{ flex: 1 }}>
              {d.label}
            </Txt>
            <Txt variant="label" muted>
              {format(d.value)}
            </Txt>
          </Row>
          <GrowBar progress={d.value / max} color={d.color ?? s.accent} track={s.surface2} height={8} delay={i * 70} />
          {d.sub ? (
            <Txt variant="caption" muted style={{ marginTop: 4, fontSize: 11 }}>
              {d.sub}
            </Txt>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export function DonationRow({ d, showDonor }: { d: Donation; showDonor?: boolean }) {
  const s = useScheme();
  return (
    <Row gap={12} style={{ paddingVertical: 12 }}>
      <IconBubble
        icon={d.frequency === 'monthly' ? 'repeat' : 'heart'}
        fg={d.frequency === 'monthly' ? palette.sky : s.accent}
        bg={d.frequency === 'monthly' ? palette.skySoft : s.accentSoft}
        size={38}
      />
      <View style={{ flex: 1 }}>
        <Txt variant="bodyStrong" numberOfLines={1}>
          {showDonor ? d.donorName : d.fund}
        </Txt>
        <Txt variant="caption" muted numberOfLines={1}>
          {showDonor ? `${d.fund} · ` : ''}
          {shortDate(d.date)} · {d.frequency === 'monthly' ? 'Monthly' : 'One-time'}
        </Txt>
      </View>
      <Txt variant="heading">{money(d.amount)}</Txt>
    </Row>
  );
}

const styles = StyleSheet.create({
  feature: {
    height: 228,
    borderRadius: radius.xl,
    padding: space.xl,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(241,238,228,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
