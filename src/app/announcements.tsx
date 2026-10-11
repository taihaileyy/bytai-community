import React from 'react';
import { useStore } from '@/store/AppStore';
import { FadeIn } from '@/components/Motion';
import { AppHeader, EmptyState, FocusStatusBar, Screen } from '@/components/ui';
import { AnnouncementCard } from '@/components/domain';

export default function Announcements() {
  const { state } = useStore();
  const list = [...state.announcements].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date));
  return (
    <Screen header={<AppHeader title="Announcements" />}>
      <FocusStatusBar style="dark" />
      {list.length ? (
        list.map((a, i) => (
          <FadeIn key={a.id} delay={i * 50}>
            <AnnouncementCard item={a} />
          </FadeIn>
        ))
      ) : (
        <EmptyState icon="megaphone-outline" title="No announcements" body="News from the team will show up here." />
      )}
    </Screen>
  );
}
