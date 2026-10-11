/** Feature components: program and event cards, stats, charts, rows. */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { Announcement, CommunityEvent, Donation, Program } from '@/data/types';
import { color, font, gutter, radius } from '@/theme';
import { dayNum, daysUntil, monthShort, relative, shortDate, time, weekday, money } from '@/utils/format';
import { PressScale, useCountUp } from './Motion';
import { Photo } from './Photo';
import { T } from './Text';
import { Progress, Row, Tag, hairline } from './ui';

/* ───────── Programs ───────── */

/** Tall photo card for the featured carousel. */
export function InitiativeCard({ program, enrolled, width = 264 }: { program: Program; enrolled?: boolean; width?: number }) {
  const left = program.capacity - program.enrolled;
  return (
    <PressScale
      onPress={() => router.push(`/program/${program.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${program.title}. ${program.summary}`}
      style={{ width }}
    >
      <Photo photo={program.photo} width={700} scrim style={[styles.initiative, { width }]}>
        <View style={styles.initiativeTop}>
          {enrolled ? <Tag label="Enrolled" tone="onImage" icon="checkmark" /> : <Tag label={program.category} tone="onImage" />}
        </View>
        <View style={styles.initiativeBody}>
          <T v="title2" c={color.white} numberOfLines={2}>
            {program.title}
          </T>
          <T v="callout" c="rgba(255,255,255,0.82)" numberOfLines={2} style={{ marginTop: 6 }}>
            {program.summary}
          </T>
          <Row gap={6} style={{ marginTop: 12 }}>
            <View style={[styles.dot, { backgroundColor: left > 0 ? '#7FD3B4' : '#F2B48F' }]} />
            <T v="caption" c="rgba(255,255,255,0.88)">
              {left > 0 ? `${left} spots open` : 'Waitlist open'} · {program.ageGroup}
            </T>
          </Row>
        </View>
      </Photo>
    </PressScale>
  );
}

/** Editorial list item: wide photo with text beneath. */
export function ProgramListItem({ program, enrolled }: { program: Program; enrolled?: boolean }) {
  const left = program.capacity - program.enrolled;
  const fill = program.enrolled / program.capacity;
  return (
    <PressScale
      onPress={() => router.push(`/program/${program.id}`)}
      scaleTo={0.985}
      accessibilityRole="button"
      accessibilityLabel={`${program.title}, ${program.category}. ${program.schedule}.`}
      style={{ marginHorizontal: gutter, marginBottom: 28 }}
    >
      <Photo photo={program.photo} width={1000} style={styles.listPhoto}>
        <View style={{ position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 6 }}>
          <Tag label={program.category} tone="onImage" />
          {enrolled ? <Tag label="Enrolled" tone="dark" icon="checkmark" /> : null}
        </View>
      </Photo>
      <Row style={{ justifyContent: 'space-between', marginTop: 14, alignItems: 'flex-start' }} gap={12}>
        <View style={{ flex: 1 }}>
          <T v="title3">{program.title}</T>
          <T v="callout" muted numberOfLines={2} style={{ marginTop: 4 }}>
            {program.summary}
          </T>
        </View>
        <T v="subhead" c={color.accent}>
          Free
        </T>
      </Row>
      <Row gap={14} style={{ marginTop: 10 }}>
        <Meta icon="time-outline" text={program.schedule} />
      </Row>
      <Row gap={10} style={{ marginTop: 12 }}>
        <View style={{ flex: 1 }}>
          <Progress value={fill} tone={fill >= 1 ? 'danger' : 'ink'} height={3} />
        </View>
        <T v="caption" muted tabular>
          {left > 0 ? `${left} left` : 'Full'}
        </T>
      </Row>
    </PressScale>
  );
}

export function Meta({ icon, text, c = color.muted }: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string; c?: string }) {
  return (
    <Row gap={5} style={{ flexShrink: 1 }}>
      <Ionicons name={icon} size={14} color={c} />
      <T v="caption" c={c} numberOfLines={1} style={{ flexShrink: 1, fontSize: 12.5 }}>
        {text}
      </T>
    </Row>
  );
}

/* ───────── Events ───────── */

export function DateBadge({ iso, size = 'md' }: { iso: string; size?: 'md' | 'lg' }) {
  const lg = size === 'lg';
  return (
    <View style={[styles.dateBadge, lg && { width: 60, paddingVertical: 8 }]} accessibilityLabel={`${weekday(iso)} ${monthShort(iso)} ${dayNum(iso)}`}>
      <T v="overline" c={color.accent} style={{ fontSize: lg ? 11 : 9.5, lineHeight: lg ? 13 : 11 }}>
        {monthShort(iso)}
      </T>
      <T c={color.ink} style={{ fontFamily: font.display, fontSize: lg ? 24 : 18, lineHeight: lg ? 28 : 21, letterSpacing: -0.5 }}>
        {dayNum(iso)}
      </T>
    </View>
  );
}

export function whenLabel(iso: string) {
  const d = daysUntil(iso);
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d > 1 && d < 7) return weekday(iso);
  return `${weekday(iso)}, ${monthShort(iso)} ${dayNum(iso)}`;
}

/** Compact event row: photo thumbnail with date badge, title, meta. */
export function EventRow({ event, registered }: { event: CommunityEvent; registered?: boolean }) {
  const d = daysUntil(event.date);
  return (
    <PressScale
      onPress={() => router.push(`/event/${event.id}`)}
      scaleTo={0.985}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}. ${whenLabel(event.date)} at ${time(event.date)}, ${event.location}.${registered ? ' You are going.' : ''}${event.cancelled ? ' Cancelled.' : ''}`}
    >
      <Row gap={14} style={{ paddingVertical: 12, paddingHorizontal: gutter, opacity: event.cancelled ? 0.55 : 1 }}>
        <Photo photo={event.photo} width={240} style={styles.thumb} decorative>
          <View style={{ position: 'absolute', left: 6, bottom: 6 }}>
            <DateBadge iso={event.date} />
          </View>
        </Photo>
        <View style={{ flex: 1 }}>
          <Row gap={6}>
            <T v="overline" c={d >= 0 && d <= 2 ? color.accent : color.muted} style={{ fontSize: 10.5 }}>
              {whenLabel(event.date)} · {time(event.date)}
            </T>
          </Row>
          <T v="headline" numberOfLines={2} style={{ marginTop: 4 }}>
            {event.title}
          </T>
          <Meta icon="location-outline" text={event.location} />
          <Row gap={6} style={{ marginTop: 8 }}>
            {event.cancelled ? <Tag label="Cancelled" tone="danger" /> : null}
            {registered && !event.cancelled ? <Tag label="Going" tone="accent" icon="checkmark" /> : null}
            {!registered && !event.cancelled ? (
              <T v="caption" muted>
                {event.attending} going · {Math.max(0, event.capacity - event.attending)} spots left
              </T>
            ) : null}
          </Row>
        </View>
      </Row>
    </PressScale>
  );
}

/** Larger photo card for a highlighted event. */
export function EventFeature({ event, registered }: { event: CommunityEvent; registered?: boolean }) {
  return (
    <PressScale
      onPress={() => router.push(`/event/${event.id}`)}
      scaleTo={0.985}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}. ${whenLabel(event.date)} at ${time(event.date)}.`}
      style={{ marginHorizontal: gutter }}
    >
      <Photo photo={event.photo} width={1000} scrim style={styles.eventFeature}>
        <View style={{ position: 'absolute', top: 14, left: 14 }}>
          <DateBadge iso={event.date} size="lg" />
        </View>
        {registered ? (
          <View style={{ position: 'absolute', top: 14, right: 14 }}>
            <Tag label="Going" tone="onImage" icon="checkmark" />
          </View>
        ) : null}
        <View style={{ position: 'absolute', left: 18, right: 18, bottom: 16 }}>
          <T v="overline" c="rgba(255,255,255,0.8)">
            {event.category} · {whenLabel(event.date)} · {time(event.date)}
          </T>
          <T v="title1" c={color.white} style={{ marginTop: 6 }} numberOfLines={2}>
            {event.title}
          </T>
          <Meta icon="location-outline" text={event.location} c="rgba(255,255,255,0.85)" />
        </View>
      </Photo>
    </PressScale>
  );
}

/* ───────── Announcements ───────── */

const toneFor: Record<Announcement['tag'], 'accent' | 'danger' | 'neutral' | 'warn'> = {
  News: 'neutral',
  Update: 'accent',
  Urgent: 'danger',
  'Thank you': 'warn',
};

export function AnnouncementItem({ item, lines = 2 }: { item: Announcement; lines?: number }) {
  return (
    <View style={{ paddingVertical: 16 }} accessible accessibilityLabel={`${item.pinned ? 'Pinned. ' : ''}${item.tag}. ${item.title}. ${item.body}`}>
      <Row gap={8}>
        <Tag label={item.tag} tone={toneFor[item.tag]} />
        {item.pinned ? <Ionicons name="pin" size={13} color={color.muted} /> : null}
        <View style={{ flex: 1 }} />
        <T v="caption" muted>
          {relative(item.date)}
        </T>
      </Row>
      <T v="headline" style={{ marginTop: 10 }}>
        {item.title}
      </T>
      <T v="callout" muted numberOfLines={lines || undefined} style={{ marginTop: 4 }}>
        {item.body}
      </T>
    </View>
  );
}

/* ───────── Stats & charts ───────── */

export function Stat({ value, label, prefix = '', suffix = '', light, compactNum }: { value: number; label: string; prefix?: string; suffix?: string; light?: boolean; compactNum?: boolean }) {
  const n = useCountUp(value);
  const shown = compactNum && n >= 10000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k` : n.toLocaleString('en-US');
  return (
    <View style={{ flex: 1 }} accessible accessibilityLabel={`${prefix}${value.toLocaleString('en-US')}${suffix} ${label}`}>
      <T v="stat" c={light ? color.white : color.ink} tabular>
        {prefix}
        {shown}
        {suffix}
      </T>
      <T v="caption" c={light ? 'rgba(255,255,255,0.65)' : color.muted} style={{ marginTop: 2 }}>
        {label}
      </T>
    </View>
  );
}

/** Inline row of stats divided by hairlines. */
export function StatStrip({ children, light }: { children: React.ReactNode; light?: boolean }) {
  const items = React.Children.toArray(children);
  return (
    <Row gap={0} style={{ alignItems: 'stretch' }}>
      {items.map((c, i) => (
        <Row key={i} gap={0} style={{ flex: 1, alignItems: 'stretch' }}>
          {i > 0 ? <View style={{ width: hairline, backgroundColor: light ? 'rgba(255,255,255,0.2)' : color.line, marginRight: 14 }} /> : null}
          {c}
        </Row>
      ))}
    </Row>
  );
}

export function BarChart({ data, height = 140, format = (n: number) => String(n) }: { data: { label: string; value: number }[]; height?: number; format?: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: height + 44 }} accessible accessibilityLabel={data.map((d) => `${d.label} ${format(d.value)}`).join(', ')}>
      {data.map((d, i) => {
        const last = i === data.length - 1;
        return (
          <View key={d.label + i} style={{ flex: 1, alignItems: 'center' }}>
            <T v="caption" c={last ? color.ink : color.muted} style={{ fontSize: 10.5, marginBottom: 6, fontFamily: last ? font.textSemi : font.text }} numberOfLines={1}>
              {format(d.value)}
            </T>
            <View style={{ height, width: '100%', justifyContent: 'flex-end' }}>
              <Bar ratio={d.value / max} highlight={last} delay={i * 60} />
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

function Bar({ ratio, highlight, delay }: { ratio: number; highlight: boolean; delay: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: Math.max(0.03, ratio), duration: 700, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [ratio, delay, v]);
  return (
    <Animated.View
      style={{
        width: '100%',
        borderRadius: 6,
        backgroundColor: highlight ? color.accent : color.sunken,
        height: v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
      }}
    />
  );
}

export function RankedBars({ data, format = (n: number) => String(n) }: { data: { label: string; value: number; sub?: string }[]; format?: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={{ gap: 16 }}>
      {data.map((d, i) => (
        <View key={d.label} accessible accessibilityLabel={`${d.label}: ${format(d.value)}`}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 7 }}>
            <T v="calloutMedium" numberOfLines={1} style={{ flex: 1 }}>
              {d.label}
            </T>
            <T v="calloutMedium" tabular>
              {format(d.value)}
            </T>
          </Row>
          <Progress value={d.value / max} tone={i === 0 ? 'accent' : 'ink'} height={6} />
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

export function DonationRow({ d, showDonor }: { d: Donation; showDonor?: boolean }) {
  return (
    <Row gap={14} style={{ paddingVertical: 13, paddingHorizontal: 16 }} accessible accessibilityLabel={`${money(d.amount)} ${d.frequency === 'monthly' ? 'monthly' : 'one-time'} to ${d.fund} on ${shortDate(d.date)}`}>
      <View style={styles.donIcon}>
        <Ionicons name={d.frequency === 'monthly' ? 'repeat' : 'heart-outline'} size={16} color={color.ink} />
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

const styles = StyleSheet.create({
  initiative: { height: 340, borderRadius: radius.xl },
  initiativeTop: { position: 'absolute', top: 14, left: 14 },
  initiativeBody: { position: 'absolute', left: 18, right: 18, bottom: 18 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  listPhoto: { height: 210, borderRadius: radius.xl },
  thumb: { width: 84, height: 84, borderRadius: radius.md },
  dateBadge: { width: 38, paddingVertical: 4, borderRadius: 9, backgroundColor: color.white, alignItems: 'center' },
  eventFeature: { height: 260, borderRadius: radius.xl },
  donIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: color.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
});
