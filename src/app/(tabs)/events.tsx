import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useMyActivity, useSession, useStore } from '@/store/AppStore';
import type { EventCategory } from '@/data/types';
import { palette } from '@/theme';
import { longDate } from '@/utils/format';
import { FadeIn, PressScale } from '@/components/Motion';
import { Txt } from '@/components/Txt';
import { Card, Chip, ChipRow, EmptyState, FocusStatusBar, PageTitle, Row, Screen, Segmented } from '@/components/ui';
import { EventCard } from '@/components/domain';

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
    () =>
      state.events
        .filter((e) => new Date(e.date).getTime() > Date.now() - 6 * 3600_000)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [state.events],
  );

  const filtered = upcoming.filter((e) => (cat === 'All' || e.category === cat) && (!going || isRegistered(e.id)));

  // Calendar grid for the visible month.
  const grid = useMemo(() => {
    const first = new Date(month);
    const start = first.getDay();
    const daysIn = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = Array.from({ length: start }, () => null);
    for (let d = 1; d <= daysIn; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [month]);

  const eventsOn = (d: Date) => upcoming.filter((e) => sameDay(new Date(e.date), d));
  const dayEvents = day ? eventsOn(day) : upcoming.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
  });
  const today = new Date();

  return (
    <Screen>
      <FocusStatusBar style="dark" />
      <PageTitle eyebrow="Events" title="What’s happening" subtitle="Volunteer, learn and celebrate with your neighbors." />
      <Segmented
        options={[
          { value: 'list', label: 'Upcoming' },
          { value: 'calendar', label: 'Calendar' },
        ]}
        value={view}
        onChange={setView}
      />

      {view === 'list' ? (
        <>
          <View style={{ height: 14 }} />
          <ChipRow>
            {signedIn ? <Chip label="I'm going" icon="checkmark-circle" selected={going} onPress={() => setGoing(!going)} /> : null}
            {CATS.map((c) => (
              <Chip key={c} label={c} selected={cat === c} onPress={() => setCat(c)} />
            ))}
          </ChipRow>
          <Txt variant="caption" muted style={{ marginTop: 16, marginBottom: 10 }}>
            {filtered.length} upcoming event{filtered.length === 1 ? '' : 's'}
          </Txt>
          {filtered.length ? (
            filtered.map((e, i) => (
              <FadeIn key={e.id} delay={i * 50}>
                <EventCard event={e} registered={!!isRegistered(e.id)} />
              </FadeIn>
            ))
          ) : (
            <EmptyState icon="calendar-outline" title="Nothing here yet" body="No events match these filters." action="Show all events" onAction={() => { setCat('All'); setGoing(false); }} />
          )}
        </>
      ) : (
        <>
          <Card style={{ marginTop: 16 }}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
              <PressScale haptic onPress={() => { setDay(null); setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)); }} accessibilityLabel="Previous month" style={styles.navBtn}>
                <Ionicons name="chevron-back" size={18} color={palette.ink} />
              </PressScale>
              <Txt variant="heading">
                {MONTHS[month.getMonth()]} {month.getFullYear()}
              </Txt>
              <PressScale haptic onPress={() => { setDay(null); setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)); }} accessibilityLabel="Next month" style={styles.navBtn}>
                <Ionicons name="chevron-forward" size={18} color={palette.ink} />
              </PressScale>
            </Row>
            <View style={styles.week}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <Txt key={i} variant="eyebrow" muted style={styles.weekLabel}>
                  {d}
                </Txt>
              ))}
            </View>
            <View style={styles.grid}>
              {grid.map((d, i) => {
                if (!d) return <View key={i} style={styles.cell} />;
                const evs = eventsOn(d);
                const selected = day && sameDay(d, day);
                const isToday = sameDay(d, today);
                const mine = evs.some((e) => isRegistered(e.id));
                return (
                  <PressScale key={i} haptic onPress={() => setDay(selected ? null : d)} style={styles.cell} accessibilityLabel={`${d.toDateString()}${evs.length ? `, ${evs.length} events` : ''}`}>
                    <View style={[styles.dayCircle, isToday && styles.today, selected && styles.selected]}>
                      <Txt variant="label" color={selected ? palette.cream : isToday ? palette.green : evs.length ? palette.ink : palette.stoneLight}>
                        {d.getDate()}
                      </Txt>
                    </View>
                    <View style={[styles.dot, { backgroundColor: evs.length ? (mine ? palette.clay : palette.green) : 'transparent' }]} />
                  </PressScale>
                );
              })}
            </View>
            <Row gap={16} style={{ marginTop: 8, justifyContent: 'center' }}>
              <Row gap={6}>
                <View style={[styles.dot, { backgroundColor: palette.green }]} />
                <Txt variant="caption" muted>Event</Txt>
              </Row>
              <Row gap={6}>
                <View style={[styles.dot, { backgroundColor: palette.clay }]} />
                <Txt variant="caption" muted>You're going</Txt>
              </Row>
            </Row>
          </Card>
          <Txt variant="heading" style={{ marginTop: 22, marginBottom: 12 }}>
            {day ? longDate(day.toISOString()) : `All of ${MONTHS[month.getMonth()]}`}
          </Txt>
          {dayEvents.length ? (
            dayEvents.map((e) => <EventCard key={e.id} event={e} registered={!!isRegistered(e.id)} />)
          ) : (
            <EmptyState icon="leaf-outline" title="A quiet day" body="No events scheduled. Pick a day with a dot to see what’s on." />
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: palette.paper2, alignItems: 'center', justifyContent: 'center' },
  week: { flexDirection: 'row', marginBottom: 6 },
  weekLabel: { flex: 1, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 },
  dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1.5, borderColor: palette.green },
  selected: { backgroundColor: palette.ink, borderColor: palette.ink },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
});

