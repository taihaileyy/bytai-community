import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useActions, useStore } from '@/store/AppStore';
import { color, gutter } from '@/theme';
import { longDate, time } from '@/utils/format';
import { confirmAction } from '@/utils/confirm';
import { FadeIn } from '@/components/Motion';
import { Photo } from '@/components/Photo';
import { T } from '@/components/Text';
import { BottomBar, Button, EmptyState, IconButton, Progress, Row, Tag } from '@/components/ui';
import { AdminScreen, Panel } from '@/components/admin';

export default function AdminEvents() {
  const { state } = useStore();
  const actions = useActions();
  const list = [...state.events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <AdminScreen
      title="Events"
      eyebrow="Manage"
      right={<IconButton icon="add" label="New event" onPress={() => router.push('/admin/event-editor')} />}
      bottom={
        <BottomBar>
          <Button title="New event" icon="add" onPress={() => router.push('/admin/event-editor')} />
        </BottomBar>
      }
    >
      {list.length ? (
        list.map((e, i) => {
          const regs = state.registrations.filter((r) => r.eventId === e.id).length;
          return (
            <FadeIn key={e.id} delay={Math.min(i, 5) * 40}>
              <Panel style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>
                <Row gap={14} style={{ padding: 14, alignItems: 'flex-start', opacity: e.cancelled ? 0.55 : 1 }}>
                  <Photo photo={e.photo} width={200} style={{ width: 64, height: 64, borderRadius: 12 }} decorative />
                  <View style={{ flex: 1 }}>
                    <Row gap={6}>
                      <Tag label={e.category} />
                      {e.featured ? <Tag label="Featured" tone="accent" icon="star" /> : null}
                      {e.cancelled ? <Tag label="Cancelled" tone="danger" /> : null}
                    </Row>
                    <T v="headline" style={{ marginTop: 6 }} numberOfLines={2}>
                      {e.title}
                    </T>
                    <T v="caption" muted numberOfLines={1}>
                      {longDate(e.date)} · {time(e.date)} · {e.location}
                    </T>
                    <View style={{ marginTop: 10 }}>
                      <Progress value={e.attending / e.capacity} height={3} />
                      <T v="caption" muted style={{ marginTop: 5 }} tabular>
                        {e.attending}/{e.capacity} attending · {regs} via app
                      </T>
                    </View>
                  </View>
                </Row>
                <Row gap={0} style={{ borderTopWidth: 0.5, borderTopColor: color.line }}>
                  <Action label="Edit" onPress={() => router.push({ pathname: '/admin/event-editor', params: { id: e.id } })} />
                  <Action label={e.featured ? 'Unfeature' : 'Feature'} onPress={() => actions.updateEvent(e.id, { featured: !e.featured })} />
                  <Action
                    label={e.cancelled ? 'Restore' : 'Cancel'}
                    onPress={() =>
                      e.cancelled
                        ? actions.updateEvent(e.id, { cancelled: false })
                        : confirmAction('Cancel event?', `Members registered for ${e.title} will see it as cancelled.`, () => actions.updateEvent(e.id, { cancelled: true }), 'Cancel event')
                    }
                  />
                  <Action label="Delete" danger onPress={() => confirmAction('Delete event?', 'This removes the event and all of its RSVPs.', () => actions.deleteEvent(e.id), 'Delete')} />
                </Row>
              </Panel>
            </FadeIn>
          );
        })
      ) : (
        <EmptyState icon="calendar-outline" title="No events" body="Create your first event." />
      )}
      <View style={{ paddingHorizontal: gutter }} />
    </AdminScreen>
  );
}

function Action({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <T
      v="subhead"
      c={danger ? color.danger : color.ink}
      onPress={onPress}
      accessibilityRole="button"
      suppressHighlighting={false}
      style={{ flex: 1, textAlign: 'center', paddingVertical: 13 }}
    >
      {label}
    </T>
  );
}
