import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useActions, useMyActivity, useSession, useStore } from '@/store/AppStore';
import { font, gutter, palette, radius } from '@/theme';
import { ToneProvider } from '@/theme/ToneContext';
import { longDate, shortDate, timeRange } from '@/utils/format';
import { confirmAction, notice } from '@/utils/confirm';
import { FadeIn } from '@/components/Motion';
import { T } from '@/components/Text';
import { DetailLayout } from '@/components/DetailLayout';
import { AvatarStack, BottomBar, Button, EmptyState, Fleur, Row, Screen, Stepper, Tag, type IconName } from '@/components/ui';

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
      <ToneProvider tone="light">
        <Screen>
          <EmptyState icon="alert-circle-outline" title="Event not found" body="It may have been removed by an admin." action="Back to events" onAction={() => router.replace('/events')} />
        </Screen>
      </ToneProvider>
    );

  const reg = isRegistered(event.id);
  const left = Math.max(0, event.capacity - event.attending);
  const past = new Date(event.date).getTime() < Date.now();
  const names = state.registrations.filter((r) => r.eventId === event.id).map((r) => state.members.find((m) => m.id === r.memberId)?.name ?? 'Neighbor');
  const faces = [...names, 'Ana Ruiz', 'Sam Lee', 'Mo Haddad', 'Kim Tran'].slice(0, 4);

  const register = () => {
    if (!signedIn) return router.push('/sign-in');
    const code = actions.register(event.id, guests);
    router.push({
      pathname: '/confirm',
      params: {
        kind: 'event',
        title: 'You’re Registered',
        subtitle: event.title,
        detail: `${longDate(event.date)} · ${timeRange(event.date, event.durationMins)}\n${event.location}`,
        code,
        note: guests ? `We saved ${guests + 1} spots for your group.` : 'Show this code at check-in.',
        photo: event.photo,
      },
    });
  };

  const rows: { icon: IconName; text: string }[] = [
    { icon: 'calendar-outline', text: shortDate(event.date) },
    { icon: 'time-outline', text: timeRange(event.date, event.durationMins) },
    { icon: 'location-outline', text: event.address },
  ];

  return (
    <DetailLayout
      photo={event.photo}
      title={event.title}
      fallback="/events"
      onShare={() => notice('Share (demo)', 'In the finished app this opens the share sheet with an event link.')}
      bottom={
        <ToneProvider tone="light">
          <BottomBar>
            {event.cancelled || past ? (
              <Button title={past ? 'This event has ended' : 'Event cancelled'} variant="outline" disabled />
            ) : reg ? (
              <Row gap={10}>
                <Button title="Cancel" variant="outline" style={{ flex: 1 }} onPress={() => confirmAction('Cancel your registration?', 'Your spot will be released to someone else.', () => actions.cancelRegistration(event.id), 'Cancel registration')} />
                <Button title="Add to Calendar" variant="purple" icon="calendar-outline" style={{ flex: 2 }} onPress={() => notice('Added (demo)', 'In the finished app this adds the event to your phone’s calendar.')} />
              </Row>
            ) : (
              <Button title={!signedIn ? 'Sign In to Register' : left ? `Register Now${guests ? ` · ${guests + 1} people` : ''}` : 'Event Is Full'} variant="purple" iconRight="arrow-forward" disabled={signedIn && !left} onPress={register} />
            )}
          </BottomBar>
        </ToneProvider>
      }
    >
      <View style={{ paddingHorizontal: gutter }}>
        <FadeIn>
          <T v="display" accessibilityRole="header">
            {event.title}
          </T>
          <Row gap={6} style={{ marginTop: 12, flexWrap: 'wrap' }}>
            <Tag label={event.category} tone="purple" />
            {(event.tags ?? []).map((t) => (
              <Tag key={t} label={t} tone="lilac" />
            ))}
            {event.cancelled ? <Tag label="Cancelled" tone="neutral" /> : null}
            {past ? <Tag label="Past event" tone="neutral" /> : null}
          </Row>
        </FadeIn>

        <View style={{ marginTop: 18, gap: 12 }}>
          {rows.map((r) => (
            <Row key={r.icon} gap={12}>
              <Ionicons name={r.icon} size={18} color={palette.purple} />
              <T v="calloutMedium" style={{ flex: 1 }}>
                {r.text}
              </T>
            </Row>
          ))}
        </View>

        <T v="body" muted style={{ marginTop: 18 }}>
          {event.description}
        </T>

        {reg ? (
          <FadeIn>
            <View style={styles.ticket}>
              <Row style={{ justifyContent: 'space-between' }}>
                <View>
                  <Row gap={6}>
                    <Fleur size={13} />
                    <T v="eyebrow" c={palette.gold}>
                      {past ? 'You attended' : 'Your registration'}
                    </T>
                  </Row>
                  <T v="title2" c={palette.ivory} style={{ marginTop: 6 }}>
                    {past ? 'Thanks for coming' : 'You’re going'}
                    {reg.guests ? ` +${reg.guests}` : ''}
                  </T>
                </View>
                <Ionicons name="qr-code-outline" size={42} color={palette.gold} />
              </Row>
              <View style={styles.perf} />
              <Row style={{ justifyContent: 'space-between' }}>
                <T v="caption" c="#B3ADA3">
                  Check-in code
                </T>
                <T v="headline" c={palette.ivory} style={{ letterSpacing: 1.5 }}>
                  {reg.confirmation}
                </T>
              </Row>
            </View>
          </FadeIn>
        ) : null}

        <Row gap={10} style={{ marginTop: 22 }}>
          {[
            [event.attending, past ? 'Attended' : 'Registered'],
            [left, 'Spots Left'],
            [event.capacity, 'Capacity'],
          ].map(([n, l]) => (
            <View key={l as string} style={styles.stat} accessible accessibilityLabel={`${n} ${l}`}>
              <T style={{ fontFamily: font.serif, fontSize: 24, lineHeight: 28, color: palette.midnight }} tabular>
                {(n as number).toLocaleString('en-US')}
              </T>
              <T v="caption" muted style={{ marginTop: 2 }}>
                {l}
              </T>
            </View>
          ))}
        </Row>

        <Row gap={12} style={{ marginTop: 18 }}>
          <AvatarStack names={faces} />
          <T v="caption" muted style={{ flex: 1 }}>
            Hosted by {event.host}
          </T>
        </Row>

        {!reg && !event.cancelled && !past ? (
          <Row style={{ justifyContent: 'space-between', marginTop: 22 }}>
            <View style={{ flex: 1 }}>
              <T v="bodyMedium">Bringing guests?</T>
              <T v="caption" muted>
                Up to 4 per registration
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
  ticket: { marginTop: 20, padding: 18, borderRadius: radius.lg, backgroundColor: palette.midnight },
  perf: { borderTopWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(229,183,107,0.35)', marginVertical: 14 },
  stat: { flex: 1, paddingVertical: 14, borderRadius: radius.md, backgroundColor: palette.paper, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E3D8C6', alignItems: 'center' },
});
