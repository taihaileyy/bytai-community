import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useActions, useMyActivity, useSession, useStore } from '@/store/AppStore';
import { color, gutter, radius } from '@/theme';
import { longDate, timeRange } from '@/utils/format';
import { confirmAction, notice } from '@/utils/confirm';
import { FadeIn } from '@/components/Motion';
import { T } from '@/components/Text';
import { DetailLayout } from '@/components/DetailLayout';
import { AvatarStack, BottomBar, Button, Divider, EmptyState, Progress, Row, Screen, Stepper, Tag, type IconName } from '@/components/ui';
import { DateBadge, whenLabel } from '@/components/domain';

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useStore();
  const { signedIn } = useSession();
  const { isRegistered } = useMyActivity();
  const actions = useActions();
  const [guests, setGuests] = useState(0);
  const event = state.events.find((e) => e.id === id);

  if (!event)
    return (
      <Screen>
        <EmptyState icon="alert-circle-outline" title="Event not found" body="It may have been removed by an admin." action="Back to events" onAction={() => router.replace('/events')} />
      </Screen>
    );

  const reg = isRegistered(event.id);
  const left = Math.max(0, event.capacity - event.attending);
  const attendees = state.registrations
    .filter((r) => r.eventId === event.id)
    .map((r) => state.members.find((m) => m.id === r.memberId)?.name ?? 'Neighbor');
  const faces = [...attendees, 'Ana Ruiz', 'Sam Lee', 'Mo Haddad', 'Kim Tran'].slice(0, 4);

  const rsvp = () => {
    if (!signedIn) return router.push('/sign-in');
    const code = actions.register(event.id, guests);
    router.push({
      pathname: '/confirm',
      params: {
        kind: 'event',
        title: "You're going",
        subtitle: event.title,
        detail: `${longDate(event.date)} · ${timeRange(event.date, event.durationMins)}\n${event.location}`,
        code,
        note: guests ? `We saved ${guests + 1} spots for your group.` : 'Show this code at check-in.',
        photo: event.photo,
      },
    });
  };

  const info: { icon: IconName; title: string; sub: string }[] = [
    { icon: 'calendar-clear-outline', title: longDate(event.date), sub: timeRange(event.date, event.durationMins) },
    { icon: 'location-outline', title: event.location, sub: event.address },
    { icon: 'person-circle-outline', title: event.host, sub: 'Host' },
  ];

  return (
    <DetailLayout
      photo={event.photo}
      title={event.title}
      fallback="/events"
      onShare={() => notice('Share (demo)', 'In the finished app this opens the native share sheet with an event link.')}
      bottom={
        <BottomBar>
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
              <Button title="Add to calendar" icon="calendar-outline" style={{ flex: 1.3 }} onPress={() => notice('Added (demo)', 'In the finished app this adds the event to your phone’s calendar.')} />
            </Row>
          ) : (
            <Row gap={16}>
              <View style={{ flex: 1 }}>
                <T v="title3">Free</T>
                <T v="caption" c={left ? color.muted : color.danger}>
                  {left ? `${left} spots left` : 'At capacity'}
                </T>
              </View>
              <Button
                title={!signedIn ? 'Sign in to RSVP' : left ? `RSVP${guests ? ` for ${guests + 1}` : ''}` : 'Full'}
                disabled={signedIn && !left}
                onPress={rsvp}
                style={{ flex: 1.6 }}
              />
            </Row>
          )}
        </BottomBar>
      }
    >
      <View style={{ paddingHorizontal: gutter }}>
        <FadeIn>
          <Row gap={12} style={{ alignItems: 'flex-start' }}>
            <DateBadge iso={event.date} size="lg" />
            <View style={{ flex: 1 }}>
              <Row gap={6}>
                <Tag label={event.category} />
                {event.cancelled ? <Tag label="Cancelled" tone="danger" /> : <Tag label={whenLabel(event.date)} tone="accent" />}
              </Row>
              <T v="title1" style={{ marginTop: 8 }} accessibilityRole="header">
                {event.title}
              </T>
            </View>
          </Row>
        </FadeIn>

        {reg && !event.cancelled ? (
          <FadeIn>
            <View style={styles.ticket}>
              <Row style={{ justifyContent: 'space-between' }}>
                <View>
                  <T v="overline" c="rgba(255,255,255,0.6)">
                    Your RSVP
                  </T>
                  <T v="title2" c={color.white} style={{ marginTop: 4 }}>
                    You're going{reg.guests ? ` +${reg.guests}` : ''}
                  </T>
                </View>
                <Ionicons name="qr-code-outline" size={40} color={color.white} />
              </Row>
              <View style={styles.perf} />
              <Row style={{ justifyContent: 'space-between' }}>
                <T v="caption" c="rgba(255,255,255,0.6)">
                  Check-in code
                </T>
                <T v="headline" c={color.white} style={{ letterSpacing: 1.5 }}>
                  {reg.confirmation}
                </T>
              </Row>
            </View>
          </FadeIn>
        ) : null}

        <View style={{ marginTop: 22 }}>
          {info.map((r, i) => (
            <View key={r.title}>
              {i > 0 ? <Divider inset={48} /> : null}
              <Row gap={16} style={{ paddingVertical: 14 }} accessible accessibilityLabel={`${r.title}. ${r.sub}`}>
                <View style={styles.infoIcon}>
                  <Ionicons name={r.icon} size={18} color={color.ink} />
                </View>
                <View style={{ flex: 1 }}>
                  <T v="bodyMedium">{r.title}</T>
                  <T v="caption" muted style={{ marginTop: 2 }}>
                    {r.sub}
                  </T>
                </View>
              </Row>
            </View>
          ))}
        </View>

        <Divider style={{ marginVertical: 20 }} />
        <T v="title3" accessibilityRole="header">
          About
        </T>
        <T v="body" c={color.ink2} style={{ marginTop: 8 }}>
          {event.description}
        </T>

        <View style={styles.attending}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Row gap={12}>
              <AvatarStack names={faces} />
              <T v="calloutMedium" tabular>
                {event.attending} going
              </T>
            </Row>
            <T v="caption" muted tabular>
              {event.capacity} capacity
            </T>
          </Row>
          <View style={{ marginTop: 14 }}>
            <Progress value={event.attending / event.capacity} height={4} />
          </View>
        </View>

        {!reg && !event.cancelled ? (
          <Row style={{ justifyContent: 'space-between', marginTop: 22 }}>
            <View style={{ flex: 1 }}>
              <T v="bodyMedium">Bringing guests?</T>
              <T v="caption" muted>
                Up to 4 per RSVP
              </T>
            </View>
            <Stepper label="Guests" value={guests} onChange={setGuests} max={Math.min(4, Math.max(0, left - 1))} />
          </Row>
        ) : null}
      </View>
    </DetailLayout>
  );
}

const styles = StyleSheet.create({
  ticket: { marginTop: 20, padding: 18, borderRadius: radius.lg, backgroundColor: color.ink },
  perf: { borderTopWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.25)', marginVertical: 14 },
  infoIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: color.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  attending: { marginTop: 24, padding: 16, borderRadius: radius.lg, backgroundColor: color.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: color.line },
});
