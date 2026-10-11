/** Feature components for the New Orleans design. */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { Announcement, CommunityEvent, Donation, Program } from '@/data/types';
import { font, gutter, palette, radius, shadow } from '@/theme';
import { useScheme } from '@/theme/ToneContext';
import { dayNum, daysUntil, monthShort, relative, shortDate, time, timeRange, weekday, money } from '@/utils/format';
import { PressScale, useCountUp } from './Motion';
import { Photo } from './Photo';
import { T } from './Text';
import { IconTile, Progress, Row, Tag, hairline, type IconName } from './ui';

/* ───────── Programs ───────── */

/** Large photographic program card with dark overlay (Programs screen). */
export function ProgramCard({ program, enrolled }: { program: Program; enrolled?: boolean }) {
  const full = program.enrolled >= program.capacity;
  return (
    <PressScale
      onPress={() => router.push(`/program/${program.id}`)}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={`${program.title}. ${program.summary}${enrolled ? ' You are enrolled.' : ''}`}
      style={[{ marginHorizontal: gutter, marginBottom: 14 }, shadow.card]}
    >
      <Photo photo={program.photo} width={1000} scrim={0.92} style={styles.programCard}>
        <View style={{ position: 'absolute', top: 12, right: 12, flexDirection: 'row', gap: 6 }}>
          {enrolled ? <Tag label="Enrolled" tone="gold" icon="checkmark" /> : full ? <Tag label="Waitlist" tone="onImage" /> : null}
        </View>
        <Row gap={14} style={styles.programBody}>
          <IconTile icon={program.icon as IconName} size={42} tone="ivory" />
          <View style={{ flex: 1 }}>
            <T v="title3" c={palette.ivory} numberOfLines={1}>
              {program.title}
            </T>
            <T v="callout" c="rgba(248,243,235,0.82)" numberOfLines={2} style={{ marginTop: 2 }}>
              {program.summary}
            </T>
          </View>
          <Ionicons name="chevron-forward" size={20} color={palette.gold} />
        </Row>
      </Photo>
    </PressScale>
  );
}

/** Compact horizontal program card (Home carousel). */
export function ProgramMini({ program, enrolled }: { program: Program; enrolled?: boolean }) {
  return (
    <PressScale onPress={() => router.push(`/program/${program.id}`)} accessibilityRole="button" accessibilityLabel={program.title} style={{ width: 220 }}>
      <Photo photo={program.photo} width={600} scrim={0.9} style={{ height: 250, borderRadius: radius.lg }}>
        <View style={{ position: 'absolute', top: 12, left: 12 }}>
          <Tag label={enrolled ? 'Enrolled' : program.category} tone={enrolled ? 'gold' : 'onImage'} />
        </View>
        <View style={{ position: 'absolute', left: 14, right: 14, bottom: 14 }}>
          <T v="title2" c={palette.ivory} numberOfLines={2} style={{ fontSize: 19, lineHeight: 24 }}>
            {program.title}
          </T>
          <T v="caption" c={palette.gold} style={{ marginTop: 6 }} numberOfLines={1}>
            {program.schedule}
          </T>
        </View>
      </Photo>
    </PressScale>
  );
}

/* ───────── Events ───────── */

export function DateBlock({ iso, tone }: { iso: string; tone?: 'ivory' | 'dark' | 'gold' }) {
  const s = useScheme();
  const t = tone ?? (s.tone === 'dark' ? 'dark' : 'ivory');
  const bg = { ivory: palette.ivory2, dark: palette.charcoal2, gold: palette.gold }[t];
  const fg = t === 'dark' ? palette.ivory : palette.midnight;
  return (
    <View style={{ width: 54, paddingVertical: 10, borderRadius: radius.md, backgroundColor: bg, alignItems: 'center' }} accessibilityLabel={`${weekday(iso)} ${monthShort(iso)} ${dayNum(iso)}`}>
      <T c={fg} style={{ fontFamily: font.textSemi, fontSize: 10.5, letterSpacing: 1.2 }}>
        {monthShort(iso).toUpperCase()}
      </T>
      <T c={fg} style={{ fontFamily: font.serif, fontSize: 26, lineHeight: 30 }}>
        {dayNum(iso)}
      </T>
      <T c={fg} style={{ fontFamily: font.text, fontSize: 11, opacity: 0.75 }}>
        {weekday(iso)}
      </T>
    </View>
  );
}

export function whenLabel(iso: string) {
  const d = daysUntil(iso);
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d < 0) return 'Past';
  return `In ${d} days`;
}

/** Events screen card: date column + photo + details + chevron. */
export function EventCard({ event, registered }: { event: CommunityEvent; registered?: boolean }) {
  const s = useScheme();
  const left = Math.max(0, event.capacity - event.attending);
  const past = new Date(event.date).getTime() < Date.now();
  return (
    <PressScale
      onPress={() => router.push(`/event/${event.id}`)}
      scaleTo={0.985}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}. ${shortDate(event.date)}, ${time(event.date)}, ${event.location}.${registered ? ' You are registered.' : ''}${event.cancelled ? ' Cancelled.' : ''}`}
      style={{ marginHorizontal: gutter, marginBottom: 12 }}
    >
      <Row gap={12} style={[styles.eventCard, { backgroundColor: s.surface, borderColor: s.line, opacity: event.cancelled ? 0.6 : 1 }]}>
        <View style={{ alignSelf: 'flex-start' }}>
          <DateBlock iso={event.date} tone={registered ? 'gold' : undefined} />
        </View>
        <View style={{ flex: 1 }}>
          <Photo photo={event.photo} width={700} style={{ height: 96, borderRadius: radius.sm }} decorative>
            {registered || event.cancelled ? (
              <View style={{ position: 'absolute', top: 8, left: 8 }}>
                {event.cancelled ? <Tag label="Cancelled" tone="onImage" /> : <Tag label={past ? 'Attended' : 'Going'} tone="gold" icon="checkmark" />}
              </View>
            ) : null}
          </Photo>
          <Row style={{ marginTop: 10, alignItems: 'flex-start' }} gap={8}>
            <View style={{ flex: 1 }}>
              <T v="title3" numberOfLines={2}>
                {event.title}
              </T>
              <Meta icon="time-outline" text={timeRange(event.date, event.durationMins)} />
              <Meta icon="location-outline" text={event.location} />
              <Meta icon="people-outline" text={past ? `${event.attending} attended` : `${event.attending} going · ${left} spots left`} />
            </View>
            <View style={[styles.chev, { borderColor: s.line }]}>
              <Ionicons name="chevron-forward" size={16} color={s.ink} />
            </View>
          </Row>
        </View>
      </Row>
    </PressScale>
  );
}

/** Compact row for Home "What's Happening". */
export function EventMini({ event, registered }: { event: CommunityEvent; registered?: boolean }) {
  const s = useScheme();
  return (
    <PressScale onPress={() => router.push(`/event/${event.id}`)} scaleTo={0.985} accessibilityRole="button" accessibilityLabel={`${event.title}. ${shortDate(event.date)} at ${time(event.date)}, ${event.location}.`}>
      <Row gap={14} style={{ paddingVertical: 10 }}>
        <Photo photo={event.photo} width={300} style={{ width: 92, height: 66, borderRadius: radius.sm }} decorative />
        <View style={{ flex: 1 }}>
          <T v="title3" numberOfLines={1}>
            {event.title}
          </T>
          <Meta icon="calendar-clear-outline" text={`${monthShort(event.date)} ${dayNum(event.date)} · ${time(event.date)}`} />
          <Meta icon="location-outline" text={event.location} />
        </View>
        {registered ? <Tag label="Going" tone="gold" /> : <Ionicons name="chevron-forward" size={18} color={s.faint} />}
      </Row>
    </PressScale>
  );
}

export function Meta({ icon, text, c }: { icon: IconName; text: string; c?: string }) {
  const s = useScheme();
  const color = c ?? s.muted;
  return (
    <Row gap={6} style={{ marginTop: 4, flexShrink: 1 }}>
      <Ionicons name={icon} size={13} color={c ?? (s.tone === 'dark' ? palette.gold : palette.purple)} />
      <T v="caption" c={color} numberOfLines={1} style={{ flexShrink: 1, fontSize: 12.5 }}>
        {text}
      </T>
    </Row>
  );
}

/* ───────── Announcements & giving ───────── */

export function AnnouncementItem({ item, lines = 2 }: { item: Announcement; lines?: number }) {
  return (
    <View style={{ paddingVertical: 16 }} accessible accessibilityLabel={`${item.pinned ? 'Pinned. ' : ''}${item.tag}. ${item.title}. ${item.body}`}>
      <Row gap={8}>
        <Tag label={item.tag} tone={item.tag === 'Urgent' ? 'purple' : item.tag === 'Update' ? 'gold' : 'lilac'} />
        {item.pinned ? <Ionicons name="pin" size={13} color={palette.gold} /> : null}
        <View style={{ flex: 1 }} />
        <T v="caption" muted>
          {relative(item.date)}
        </T>
      </Row>
      <T v="title3" style={{ marginTop: 10 }}>
        {item.title}
      </T>
      <T v="callout" muted numberOfLines={lines || undefined} style={{ marginTop: 4 }}>
        {item.body}
      </T>
    </View>
  );
}

export function DonationRow({ d, showDonor }: { d: Donation; showDonor?: boolean }) {
  const s = useScheme();
  return (
    <Row gap={14} style={{ paddingVertical: 13, paddingHorizontal: 16 }} accessible accessibilityLabel={`${money(d.amount)} ${d.frequency === 'monthly' ? 'monthly' : 'one-time'} to ${d.fund} on ${shortDate(d.date)}`}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: s.surface2, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={d.frequency === 'monthly' ? 'repeat' : 'heart-outline'} size={16} color={s.tone === 'dark' ? palette.gold : palette.purple} />
      </View>
      <View style={{ flex: 1 }}>
        <T v="bodyMedium" numberOfLines={1}>
          {showDonor ? d.donorName : d.fund}
        </T>
        <T v="caption" muted numberOfLines={1} style={{ marginTop: 2 }}>
          {showDonor ? `${d.fund} · ` : ''}
          {shortDate(d.date)}
          {d.frequency === 'monthly' ? ' · Monthly' : ''}
        </T>
      </View>
      <T v="headline" tabular>
        {money(d.amount)}
      </T>
    </Row>
  );
}

/* ───────── Stats & charts ───────── */

const fmt = (n: number, compact?: boolean, prefix = '') =>
  compact && n >= 100000 ? `${prefix}${Math.round(n / 1000)}K` : `${prefix}${n.toLocaleString('en-US')}`;

/** Icon + number + label, used in the ivory impact strip. */
export function StatItem({ icon, value, label, prefix, compact }: { icon: IconName; value: number; label: string; prefix?: string; compact?: boolean }) {
  const n = useCountUp(value);
  return (
    <View style={{ flex: 1, alignItems: 'center' }} accessible accessibilityLabel={`${fmt(value, compact, prefix)} ${label}`}>
      <Ionicons name={icon} size={22} color={palette.midnight} />
      <T v="stat" tabular style={{ marginTop: 6, fontSize: 19, lineHeight: 23 }}>
        {fmt(n, compact, prefix)}
      </T>
      <T v="caption" muted center style={{ marginTop: 2, fontSize: 10.5, lineHeight: 13 }}>
        {label}
      </T>
    </View>
  );
}

/** Dark stat card with gold icon (Impact, Admin). */
export function StatCard({ icon, value, label, prefix, compact, delta }: { icon?: IconName; value: number; label: string; prefix?: string; compact?: boolean; delta?: string }) {
  const n = useCountUp(value);
  return (
    <View style={styles.statCard} accessible accessibilityLabel={`${fmt(value, compact, prefix)} ${label}${delta ? `, ${delta}` : ''}`}>
      {icon ? (
        <View style={styles.statIcon}>
          <Ionicons name={icon} size={20} color={palette.gold} />
        </View>
      ) : null}
      <T v="stat" c={palette.ivory} tabular style={{ marginTop: icon ? 14 : 0, fontSize: 26, lineHeight: 30 }}>
        {fmt(n, compact, prefix)}
      </T>
      <T v="caption" c="#B3ADA3" style={{ marginTop: 3 }}>
        {label}
      </T>
      {delta ? (
        <Row gap={4} style={{ marginTop: 8 }}>
          <Ionicons name="arrow-up" size={12} color={palette.gold} />
          <T v="caption" c={palette.gold} style={{ fontFamily: font.textSemi }}>
            {delta}
          </T>
        </Row>
      ) : null}
    </View>
  );
}

export function BarChart({ data, height = 130, format = (n: number) => String(n) }: { data: { label: string; value: number }[]; height?: number; format?: (n: number) => string }) {
  const s = useScheme();
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: height + 44 }} accessible accessibilityLabel={data.map((d) => `${d.label} ${format(d.value)}`).join(', ')}>
      {data.map((d, i) => {
        const last = i === data.length - 1;
        return (
          <View key={d.label + i} style={{ flex: 1, alignItems: 'center' }}>
            <T v="caption" c={last ? palette.gold : s.muted} style={{ fontSize: 10.5, marginBottom: 6 }} numberOfLines={1}>
              {format(d.value)}
            </T>
            <View style={{ height, width: '100%', justifyContent: 'flex-end' }}>
              <Bar ratio={d.value / max} color={last ? palette.gold : s.surface2} delay={i * 60} />
            </View>
            <T v="caption" muted style={{ fontSize: 11, marginTop: 8 }}>
              {d.label}
            </T>
          </View>
        );
      })}
    </View>
  );
}

function Bar({ ratio, color, delay }: { ratio: number; color: string; delay: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: Math.max(0.03, ratio), duration: 700, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [ratio, delay, v]);
  return <Animated.View style={{ width: '100%', borderRadius: 6, backgroundColor: color, height: v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />;
}

export function RankedBars({ data, format = (n: number) => String(n) }: { data: { label: string; value: number; sub?: string }[]; format?: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={{ gap: 16 }}>
      {data.map((d) => (
        <View key={d.label} accessible accessibilityLabel={`${d.label}: ${format(d.value)}`}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 7 }}>
            <T v="calloutMedium" numberOfLines={1} style={{ flex: 1 }}>
              {d.label}
            </T>
            <T v="calloutMedium" tabular>
              {format(d.value)}
            </T>
          </Row>
          <Progress value={d.value / max} height={6} />
          {d.sub ? (
            <T v="caption" muted style={{ marginTop: 5 }}>
              {d.sub}
            </T>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  programCard: { height: 158, borderRadius: radius.lg },
  programBody: { position: 'absolute', left: 14, right: 14, bottom: 14, alignItems: 'center' },
  eventCard: { padding: 12, borderRadius: radius.lg, borderWidth: hairline, alignItems: 'stretch' },
  chev: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  statCard: { flex: 1, minWidth: '45%', padding: 16, borderRadius: radius.lg, backgroundColor: palette.charcoal, borderWidth: hairline, borderColor: 'rgba(229,183,107,0.22)' },
  statIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(229,183,107,0.12)', alignItems: 'center', justifyContent: 'center' },
});
