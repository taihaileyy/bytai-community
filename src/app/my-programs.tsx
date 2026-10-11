import React from 'react';
import { router } from 'expo-router';
import { useMyActivity, useStore } from '@/store/AppStore';
import { ToneProvider } from '@/theme/ToneContext';
import { shortDate } from '@/utils/format';
import { FadeIn } from '@/components/Motion';
import { EmptyState, Screen } from '@/components/ui';
import { ProgramCard } from '@/components/domain';
import { T } from '@/components/Text';

export default function MyPrograms() {
  const { state } = useStore();
  const { enrollments } = useMyActivity();
  const items = enrollments.map((e) => ({ e, p: state.programs.find((p) => p.id === e.programId) })).filter((x) => x.p);
  return (
    <ToneProvider tone="dark">
      <Screen title="My Programs" padded={false}>
        {items.length ? (
          items.map(({ e, p }, i) => (
            <FadeIn key={e.id} delay={i * 60}>
              <ProgramCard program={p!} enrolled />
              <T v="caption" muted style={{ marginHorizontal: 22, marginTop: -6, marginBottom: 16 }}>
                {e.status === 'waitlist' ? 'Waitlist' : 'Enrolled'} since {shortDate(e.date)} · {p!.schedule}
              </T>
            </FadeIn>
          ))
        ) : (
          <EmptyState icon="grid-outline" title="No programs yet" body="Find a program that fits you or your family." action="Browse programs" onAction={() => router.navigate('/programs')} />
        )}
      </Screen>
    </ToneProvider>
  );
}
