import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useMyActivity, useSession, useStore } from '@/store/AppStore';
import type { CommunityEvent, EventCategory } from '@/data/types';
import { color, font, gutter, radius } from '@/theme';
import { daysUntil, longDate } from '@/utils/format';
import { FadeIn, PressScale } from '@/components/Motion';
import { T } from '@/components/Text';
import { Chip, ChipRow, Divider, EmptyState, LargeTitleScreen, Row, Segmented } from '@/components/ui';
import { EventFeature, EventRow } from '@/components/domain';

const CATS: ('All' | EventCategory)[] = ['All', 'Community', 'Volunteer', 'Workshop', 'Fundraiser'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function Events() {
  const params = useLocalSearchParams<{ filter?: string }>();
  const { state } = useStore();
  const { signedIn } = useSession();
  const { isRegistered } = useMyActivity();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [cat, setCat] = useState<(typeof CATS)[number]>('All');
  const [going, setGoing] = useState(false);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [day, setDay] = useState<Date | null>(null);

  useEffect(() => {
    if (params.filter && (CATS as string[]).includes(params.filter)) setCat(params.filter as EventCategory);
  }, [params.filter]);

  const upcoming = useMemo(
    () => state.events.filter((e) => new Date(e.date).getTime() > Date.now() - 6 * 3600_000).sort((a, b) => a.date.localeCompare(b.date)),
    [state.events],
  );
  const filtered = upcoming.filter((e) => (cat === 'All' || e.category === cat) && (!going || isRegistered(e.id)));
  const spotlight = cat === 'All' && !going ? filtered.find((e) => e.featured && !e.cancelled) : undefined;
  const rest = filtered.filter((e) => e !== spotlight);
  const groups: { title: string; items: CommunityEvent[] }[] = [
    { title: 'This week', items: rest.filter((e) => daysUntil(e.date) < 7) },
    { title: 'Later this month', items: rest.filter((e) => daysUntil(e.date) >= 7 && daysUntil(e.date) < 31) },
    { title: 'Coming up', items: rest.filter((e) => daysUntil(e.date) >= 31) },
  ].filter((g) => g.items.length);

  const grid = useMemo(() => {
    const start = new Date(month).getDay();
    const daysIn = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = Array.from({ length: start }, () => null);
    for (let d = 1; d <= daysIn; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [month]);
  const eventsOn = (d: Date) => upcoming.filter((e) => sameDay(new Date(e.date), d));
  const dayEvents = day
    ? eventsOn(day)
    : upcoming.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
      });
  const today = new Date();
  const shiftMonth = (n: number) => {
    setDay(null);
    setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));
  };

  return (
    <LargeTitleScreen title="Events" subtitle="Volunteer, learn and celebrate together.">
      <View style={{ paddingHorizontal: gutter }}>
        <Segmented
          options={[
            { value: 'list', label: 'Upcoming' },
            { value: 'calendar', label: 'Calendar' },
          ]}
          value={view}
          onChange={setView}
        />
      </View>

      {view === 'list' ? (
        <>
          <ChipRow style={{ marginTop: 16 }}>
            {signedIn ? <Chip label="Going" icon="checkmark-circle-outline" selected={going} onPress={() => setGoing(!going)} /> : null}
            {CATS.map((c) => (
              <Chip key={c} label={c} selected={cat === c} onPress={() => setCat(c)} />
            ))}
          </ChipRow>

          {spotlight ? (
            <FadeIn style={{ marginTop: 22 }}>
              <EventFeature event={spotlight} registered={!!isRegistered(spotlight.id)} />
            </FadeIn>
          ) : null}

          {groups.length ? (
            groups.map((g) => (
              <View key={g.title} style={{ marginTop: 26 }}>
                <T v="overline" muted style={{ marginHorizontal: gutter, marginBottom: 4 }} accessibilityRole="header">
                  {g.title}
                </T>
                {g.items.map((e, i) => (
                  <FadeIn key={e.id} delay={Math.min(i, 4) * 50}>
                    {i > 0 ? <Divider inset={gutter + 98} /> : null}
                    <EventRow event={e} registered={!!isRegistered(e.id)} />
                  </FadeIn>
                ))}
              </View>
            ))
          ) : !spotlight ? (
            <EmptyState icon="calendar-outline" title="Nothing here yet" body="No events match these filters." action="Show all events" onAction={() => { setCat('All'); setGoing(false); }} />
          ) : null}
        </>
      ) : (
        <>
          <View style={styles.calendar}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 12 }}>
              <T v="title3">
                {MONTHS[month.getMonth()]} <T v="title3" c={color.muted}>{month.getFullYear()}</T>
              </T>
              <Row gap={6}>
                <PressScale haptic onPress={() => shiftMonth(-1)} accessibilityRole="button" accessibilityLabel="Previous month" style={styles.navBtn}>
                  <Ionicons name="chevron-back" size={17} color={color.ink} />
                </PressScale>
                <PressScale haptic onPress={() => shiftMonth(1)} accessibilityRole="button" accessibilityLabel="Next month" style={styles.navBtn}>
                  <Ionicons name="chevron-forward" size={17} color={color.ink} />
                </PressScale>
              </Row>
            </Row>
            <View style={styles.week}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <T key={i} v="caption" muted style={styles.weekLabel}>
                  {d}
                </T>
              ))}
            </View>
            <View style={styles.grid}>
              {grid.map((d, i) => {
                if (!d) return <View key={i} style={styles.cell} />;
                const evs = eventsOn(d);
                const selected = !!day && sameDay(d, day);
                const isToday = sameDay(d, today);
                const mine = evs.some((e) => isRegistered(e.id));
                return (
                  <PressScale
                    key={i}
                    haptic
                    scaleTo={0.9}
                    onPress={() => setDay(selected ? null : d)}
                    style={styles.cell}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${d.toDateString()}${evs.length ? `, ${evs.length} event${evs.length > 1 ? 's' : ''}` : ''}${mine ? ', you are going' : ''}`}
                  >
                    <View style={[styles.day, isToday && styles.today, selected && styles.selected]}>
                      <T
                        v="callout"
                        c={selected ? color.white : evs.length ? color.ink : color.faint}
                        style={{ fontFamily: evs.length || isToday ? font.textSemi : font.text }}
                      >
                        {d.getDate()}
                      </T>
                    </View>
                    <View style={[styles.dot, { backgroundColor: evs.length ? (mine ? color.accent : color.ink) : 'transparent' }]} />
                  </PressScale>
                );
              })}
            </View>
            <Row gap={16} style={{ marginTop: 10, justifyContent: 'center' }}>
              <Row gap={6}>
                <View style={[styles.dot, { backgroundColor: color.ink }]} />
                <T v="caption" muted>Event</T>
              </Row>
              <Row gap={6}>
                <View style={[styles.dot, { backgroundColor: color.accent }]} />
                <T v="caption" muted>You're going</T>
              </Row>
            </Row>
          </View>

          <T v="overline" muted style={{ marginHorizontal: gutter, marginTop: 28, marginBottom: 4 }} accessibilityRole="header" accessibilityLiveRegion="polite">
            {day ? longDate(day.toISOString()) : `All of ${MONTHS[month.getMonth()]}`}
          </T>
          {dayEvents.length ? (
            dayEvents.map((e, i) => (
              <View key={e.id}>
                {i > 0 ? <Divider inset={gutter + 98} /> : null}
                <EventRow event={e} registered={!!isRegistered(e.id)} />
              </View>
            ))
          ) : (
            <EmptyState icon="leaf-outline" title="A quiet day" body="No events scheduled. Pick a day with a dot." />
          )}
        </>
      )}
    </LargeTitleScreen>
  );
}

const styles = StyleSheet.create({
  calendar: {
    marginHorizontal: gutter,
    marginTop: 18,
    padding: 16,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.line,
  },
  navBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: color.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  week: { flexDirection: 'row', marginBottom: 4 },
  weekLabel: { flex: 1, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 },
  day: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1.5, borderColor: color.ink },
  selected: { backgroundColor: color.ink, borderColor: color.ink },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 1 },
});
