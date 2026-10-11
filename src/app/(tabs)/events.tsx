import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMyActivity, useSession, useStore } from '@/store/AppStore';
import { font, gutter, palette, radius } from '@/theme';
import { ToneProvider } from '@/theme/ToneContext';
import { longDate } from '@/utils/format';
import { FadeIn, PressScale } from '@/components/Motion';
import { T } from '@/components/Text';
import { EmptyState, FocusStatusBar, IconButton, Pill, PillRow, Row, TabHeader } from '@/components/ui';
import { EventCard } from '@/components/domain';

type Filter = 'upcoming' | 'mine' | 'past';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function Events() {
  const params = useLocalSearchParams<{ filter?: string }>();
  const { state } = useStore();
  const { signedIn } = useSession();
  const { isRegistered } = useMyActivity();
  const [filter, setFilter] = useState<Filter>('upcoming');
  const [calendar, setCalendar] = useState(false);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [day, setDay] = useState<Date | null>(null);

  useEffect(() => {
    if (params.filter === 'mine') setFilter('mine');
  }, [params.filter]);

  const now = Date.now();
  const sorted = useMemo(() => [...state.events].sort((a, b) => a.date.localeCompare(b.date)), [state.events]);
  const list = useMemo(() => {
    if (filter === 'past') return sorted.filter((e) => new Date(e.date).getTime() < now).reverse();
    if (filter === 'mine') {
      const mine = sorted.filter((e) => isRegistered(e.id));
      return [...mine.filter((e) => new Date(e.date).getTime() >= now), ...mine.filter((e) => new Date(e.date).getTime() < now).reverse()];
    }
    return sorted.filter((e) => new Date(e.date).getTime() >= now);
  }, [sorted, filter, isRegistered, now]);

  const grid = useMemo(() => {
    const start = new Date(month).getDay();
    const daysIn = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = Array.from({ length: start }, () => null);
    for (let d = 1; d <= daysIn; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [month]);
  const eventsOn = (d: Date) => sorted.filter((e) => sameDay(new Date(e.date), d));
  const calList = day ? eventsOn(day) : sorted.filter((e) => new Date(e.date).getMonth() === month.getMonth() && new Date(e.date).getFullYear() === month.getFullYear());

  return (
    <View style={{ flex: 1, backgroundColor: palette.ivory }}>
      <FocusStatusBar style="light" />
      <ToneProvider tone="dark">
        <View style={{ backgroundColor: palette.midnight, paddingBottom: 16 }}>
          <TabHeader
            title="Events"
            right={<IconButton icon={calendar ? 'list' : 'calendar-outline'} tone="ghost" color={palette.gold} label={calendar ? 'Show list' : 'Show calendar'} onPress={() => setCalendar(!calendar)} />}
          />
          {!calendar ? (
            <PillRow>
              <Pill label="Upcoming" selected={filter === 'upcoming'} onPress={() => setFilter('upcoming')} />
              <Pill label="My Events" selected={filter === 'mine'} onPress={() => (signedIn ? setFilter('mine') : router.push('/sign-in'))} />
              <Pill label="Past" selected={filter === 'past'} onPress={() => setFilter('past')} />
            </PillRow>
          ) : (
            <Row style={{ justifyContent: 'space-between', paddingHorizontal: gutter }}>
              <T v="title2">
                {MONTHS[month.getMonth()]} <T v="title2" c={palette.gold}>{month.getFullYear()}</T>
              </T>
              <Row gap={8}>
                <IconButton icon="chevron-back" label="Previous month" onPress={() => { setDay(null); setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)); }} />
                <IconButton icon="chevron-forward" label="Next month" onPress={() => { setDay(null); setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)); }} />
              </Row>
            </Row>
          )}
        </View>
      </ToneProvider>

      <ToneProvider tone="light">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
          {calendar ? (
            <>
              <View style={styles.calendar}>
                <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <T key={i} v="caption" muted style={{ flex: 1, textAlign: 'center' }}>
                      {d}
                    </T>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {grid.map((d, i) => {
                    if (!d) return <View key={i} style={styles.cell} />;
                    const evs = eventsOn(d);
                    const selected = !!day && sameDay(d, day);
                    const today = sameDay(d, new Date());
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
                        <View style={[styles.day, today && styles.today, selected && styles.selected]}>
                          <T v="callout" c={selected ? palette.gold : evs.length ? palette.midnight : '#A39886'} style={{ fontFamily: evs.length || today ? font.textSemi : font.text }}>
                            {d.getDate()}
                          </T>
                        </View>
                        <View style={[styles.dot, { backgroundColor: evs.length ? (mine ? palette.gold : palette.purple) : 'transparent' }]} />
                      </PressScale>
                    );
                  })}
                </View>
                <Row gap={16} style={{ justifyContent: 'center', marginTop: 8 }}>
                  <Row gap={6}>
                    <View style={[styles.dot, { backgroundColor: palette.purple }]} />
                    <T v="caption" muted>Event</T>
                  </Row>
                  <Row gap={6}>
                    <View style={[styles.dot, { backgroundColor: palette.gold }]} />
                    <T v="caption" muted>You’re going</T>
                  </Row>
                </Row>
              </View>
              <T v="eyebrow" muted style={{ marginHorizontal: gutter, marginTop: 22, marginBottom: 12 }} accessibilityLiveRegion="polite">
                {day ? longDate(day.toISOString()) : `All of ${MONTHS[month.getMonth()]}`}
              </T>
              {calList.length ? (
                calList.map((e) => <EventCard key={e.id} event={e} registered={!!isRegistered(e.id)} />)
              ) : (
                <EmptyState icon="calendar-clear-outline" title="A quiet day" body="No events scheduled. Pick a day with a dot." />
              )}
            </>
          ) : list.length ? (
            list.map((e, i) => (
              <FadeIn key={e.id} delay={Math.min(i, 5) * 50}>
                <EventCard event={e} registered={!!isRegistered(e.id)} />
              </FadeIn>
            ))
          ) : (
            <EmptyState
              icon="calendar-outline"
              title={filter === 'mine' ? 'No RSVPs yet' : 'Nothing here yet'}
              body={filter === 'mine' ? 'Events you register for will show up here.' : 'Check back soon for new events.'}
              action={filter === 'mine' ? 'Browse upcoming' : undefined}
              onAction={() => setFilter('upcoming')}
            />
          )}
        </ScrollView>
      </ToneProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  calendar: { marginHorizontal: gutter, padding: 14, borderRadius: radius.lg, backgroundColor: palette.paper, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E3D8C6' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 },
  day: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1.5, borderColor: palette.purple },
  selected: { backgroundColor: palette.midnight, borderColor: palette.midnight },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 1 },
});

