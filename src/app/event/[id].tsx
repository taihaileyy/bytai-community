import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActions, useMyActivity, useSession, useStore } from '@/store/AppStore';
import { getCategoryColor, palette, radius, space } from '@/theme';
import { daysUntil, longDate, timeRange } from '@/utils/format';
import { confirmAction, notice } from '@/utils/confirm';
import { FadeIn, GrowBar } from '@/components/Motion';
import { Txt } from '@/components/Txt';
import { Button, Card, EmptyState, FocusStatusBar, IconButton, Row, Screen, Stepper, Tag, type IconName } from '@/components/ui';
import { DateBlock } from '@/components/domain';

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const { signedIn } = useSession();
  const { isRegistered } = useMyActivity();
  const actions = useActions();
  const [guests, setGuests] = useState(0);
  const event = state.events.find((e) => e.id === id);

  if (!event)
    return (
      <Screen>
        <View style={{ paddingTop: insets.top + 60 }}>
          <EmptyState icon="alert-circle-outline" title="Event not found" body="It may have been removed by an admin." action="Back to events" onAction={() => router.replace('/events')} />
        </View>
      </Screen>
    );

  const c = getCategoryColor(event.category);
  const reg = isRegistered(event.id);
  const left = Math.max(0, event.capacity - event.attending);
  const d = daysUntil(event.date);

  const rsvp = () => {
    if (!signedIn) return router.push('/sign-in');
    const code = actions.register(event.id, guests);
    router.push({
      pathname: '/confirm',
      params: {
        kind: 'event',
        title: "You're registered!",
        subtitle: event.title,
        detail: `${longDate(event.date)} · ${timeRange(event.date, event.durationMins)}\n${event.location}`,
        code,
        note: guests ? `We saved ${guests + 1} spots for your group.` : 'Show this confirmation at check-in.',
      },
    });
  };

  const info: { icon: IconName; title: string; sub: string }[] = [
    { icon: 'time-outline', title: longDate(event.date), sub: timeRange(event.date, event.durationMins) },
    { icon: 'location-outline', title: event.location, sub: event.address },
    { icon: 'people-outline', title: `Hosted by ${event.host}`, sub: `${event.attending} people going` },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: palette.paper }}>
      <FocusStatusBar style="light" />
      <Screen padded={false} bottomInset={false} contentStyle={{ paddingBottom: 170 }}>
        <LinearGradient colors={[palette.night, '#22303B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: insets.top + 8 }]}>
          <Row style={{ justifyContent: 'space-between' }}>
            <IconButton icon="chevron-back" tone="inverse" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/events'))} />
            <IconButton icon="share-outline" tone="inverse" label="Share" onPress={() => notice('Share (demo)', 'In the finished app this opens the native share sheet with an event link.')} />
          </Row>
          <FadeIn delay={40}>
            <Row gap={16} style={{ marginTop: 24, alignItems: 'flex-start' }}>
              <DateBlock iso={event.date} />
              <View style={{ flex: 1 }}>
                <Row gap={6} style={{ flexWrap: 'wrap' }}>
                  <Tag label={event.category} fg={c.fg} bg={c.bg} />
                  {d >= 0 && d <= 14 ? <Tag label={d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `In ${d} days`} fg="#8A6A1E" bg={palette.goldSoft} /> : null}
                </Row>
                <Txt variant="display" color={palette.cream} style={{ marginTop: 10 }}>
                  {event.title}
                </Txt>
              </View>
            </Row>
          </FadeIn>
        </LinearGradient>

        <View style={{ paddingHorizontal: space.xl }}>
          {event.cancelled ? (
            <View style={[styles.banner, { backgroundColor: palette.claySoft, marginTop: 16 }]}>
              <Ionicons name="close-circle" size={22} color={palette.clay} />
              <Txt variant="bodyStrong" color={palette.clay} style={{ flex: 1 }}>
                This event has been cancelled by the organizers.
              </Txt>
            </View>
          ) : null}

          <FadeIn delay={120}>
            <Card style={{ marginTop: event.cancelled ? 16 : -28 }}>
              {info.map((r, i) => (
                <Row key={r.title} gap={14} style={[{ paddingVertical: 12 }, i < info.length - 1 && styles.border]}>
                  <Ionicons name={r.icon} size={20} color={palette.green} />
                  <View style={{ flex: 1 }}>
                    <Txt variant="bodyStrong">{r.title}</Txt>
                    <Txt variant="caption" muted>
                      {r.sub}
                    </Txt>
                  </View>
                </Row>
              ))}
            </Card>
          </FadeIn>

          {reg ? (
            <FadeIn>
              <LinearGradient colors={[palette.green, palette.greenDeep]} style={styles.ticket}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Txt variant="eyebrow" color={palette.mintBright}>
                    Your RSVP
                  </Txt>
                  <Ionicons name="ticket-outline" size={20} color={palette.mintBright} />
                </Row>
                <Txt variant="title" color={palette.cream} style={{ marginTop: 8 }}>
                  You're going{reg.guests ? ` +${reg.guests}` : ''}
                </Txt>
                <View style={styles.ticketRule} />
                <Txt variant="caption" color="rgba(241,238,228,0.7)">
                  Confirmation
                </Txt>
                <Txt variant="heading" color={palette.cream} style={{ letterSpacing: 2 }}>
                  {reg.confirmation}
                </Txt>
              </LinearGradient>
            </FadeIn>
          ) : null}

          <Txt variant="title" style={{ marginTop: 28, marginBottom: 10 }}>
            About this event
          </Txt>
          <Txt variant="body" muted>
            {event.description}
          </Txt>

          <Card flat style={{ marginTop: 22 }}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
              <Txt variant="label">Attendance</Txt>
              <Txt variant="label" color={left ? palette.green : palette.clay}>
                {left ? `${left} spots left` : 'At capacity'}
              </Txt>
            </Row>
            <GrowBar progress={event.attending / event.capacity} color={palette.green} track={palette.paper2} height={10} />
          </Card>

          {!reg && !event.cancelled ? (
            <Card flat style={{ marginTop: 12 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Txt variant="label">Bringing guests?</Txt>
                  <Txt variant="caption" muted>
                    Up to 4 per RSVP
                  </Txt>
                </View>
                <Stepper value={guests} onChange={setGuests} max={Math.min(4, Math.max(0, left - 1))} />
              </Row>
            </Card>
          ) : null}
        </View>
      </Screen>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        {event.cancelled ? (
          <Button title="Browse other events" variant="secondary" onPress={() => router.replace('/events')} />
        ) : reg ? (
          <Row gap={10}>
            <Button
              title="Cancel RSVP"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => confirmAction('Cancel your RSVP?', 'Your spot will be released to someone else.', () => actions.cancelRegistration(event.id), 'Cancel RSVP')}
            />
            <Button
              title="Add to calendar"
              icon="calendar"
              style={{ flex: 1 }}
              onPress={() => notice('Added (demo)', 'In the finished app this adds the event to your phone’s calendar.')}
            />
          </Row>
        ) : (
          <Button
            title={!signedIn ? 'Sign in to RSVP' : left ? `RSVP${guests ? ` for ${guests + 1}` : ''}` : 'Event is full'}
            icon={!signedIn ? 'log-in-outline' : 'checkmark-circle'}
            disabled={signedIn && !left}
            onPress={rsvp}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: space.xl, paddingBottom: 52, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  border: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md },
  ticket: { marginTop: 16, borderRadius: radius.lg, padding: space.xl },
  ticketRule: { height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(241,238,228,0.3)', marginVertical: 14 },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.xl,
    paddingTop: 12,
    backgroundColor: 'rgba(244,241,232,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.line,
  },
});
