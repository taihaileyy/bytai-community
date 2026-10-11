import React from 'react';
import { router } from 'expo-router';
import { useMyActivity, useStore } from '@/store/AppStore';
import { ToneProvider } from '@/theme/ToneContext';
import { FadeIn } from '@/components/Motion';
import { EmptyState, Screen } from '@/components/ui';
import { EventCard } from '@/components/domain';
import { T } from '@/components/Text';
import { gutter } from '@/theme';

export default function MyEvents() {
  const { state } = useStore();
  const { registrations } = useMyActivity();
  const items = registrations
    .map((r) => ({ r, e: state.events.find((x) => x.id === r.eventId) }))
    .filter((x) => x.e)
    .sort((a, b) => a.e!.date.localeCompare(b.e!.date));
  const now = Date.now();
  const upcoming = items.filter((x) => new Date(x.e!.date).getTime() >= now);
  const past = items.filter((x) => new Date(x.e!.date).getTime() < now);
  return (
    <ToneProvider tone="light">
      <Screen title="My Events" padded={false}>
        {items.length ? (
          <>
            {upcoming.map(({ r, e }, i) => (
              <FadeIn key={r.id} delay={i * 60}>
                <EventCard event={e!} registered />
              </FadeIn>
            ))}
            {past.length ? (
              <T v="eyebrow" muted style={{ marginHorizontal: gutter, marginTop: 14, marginBottom: 12 }}>
                Past
              </T>
            ) : null}
            {past.map(({ r, e }) => (
              <EventCard key={r.id} event={e!} registered />
            ))}
          </>
        ) : (
          <EmptyState icon="calendar-outline" title="No events yet" body="Register for a volunteer day, workshop or celebration." action="See events" onAction={() => router.navigate('/events')} />
        )}
      </Screen>
    </ToneProvider>
  );
}
