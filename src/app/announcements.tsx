import React from 'react';
import { View } from 'react-native';
import { useStore } from '@/store/AppStore';
import { ToneProvider } from '@/theme/ToneContext';
import { FadeIn } from '@/components/Motion';
import { Divider, EmptyState, Screen } from '@/components/ui';
import { AnnouncementItem } from '@/components/domain';

export default function Announcements() {
  const { state } = useStore();
  const list = [...state.announcements].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date));
  return (
    <ToneProvider tone="light">
      <Screen title="News">
        {list.length ? (
          list.map((a, i) => (
            <FadeIn key={a.id} delay={Math.min(i, 6) * 40}>
              {i > 0 ? <Divider /> : null}
              <AnnouncementItem item={a} lines={0} />
            </FadeIn>
          ))
        ) : (
          <EmptyState icon="megaphone-outline" title="No news yet" body="Updates from the team will show up here." />
        )}
        <View style={{ height: 8 }} />
      </Screen>
    </ToneProvider>
  );
}
