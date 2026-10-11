import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useActions, useStore } from '@/store/AppStore';
import { palette } from '@/theme';
import { longDate, time } from '@/utils/format';
import { confirmAction } from '@/utils/confirm';
import { FadeIn, PressScale } from '@/components/Motion';
import { Photo } from '@/components/Photo';
import { T } from '@/components/Text';
import { BottomBar, Button, EmptyState, IconButton, Progress, Row, Tag } from '@/components/ui';
import { AdminScreen, Panel } from '@/components/admin';

export default function AdminEvents() {
  const { state } = useStore();
  const actions = useActions();
  const now = Date.now();
  const byDate = [...state.events].sort((a, b) => a.date.localeCompare(b.date));
  const list = [...byDate.filter((e) => new Date(e.date).getTime() >= now), ...byDate.filter((e) => new Date(e.date).getTime() < now).reverse()];
  return (
    <AdminScreen
      title="Events"
      eyebrow="Manage"
      right={<IconButton icon="add" tone="ghost" color={palette.gold} label="New event" onPress={() => router.push('/admin/event-editor')} />}
      bottom={
        <BottomBar>
          <Button title="Create Event" variant="gold" icon="add" onPress={() => router.push('/admin/event-editor')} />
        </BottomBar>
      }
    >
      {list.length ? (
        list.map((e, i) => {
          const regs = state.registrations.filter((r) => r.eventId === e.id).length;
          const past = new Date(e.date).getTime() < Date.now();
          return (
            <FadeIn key={e.id} delay={Math.min(i, 5) * 40}>
              <Panel style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>
                <Row gap={14} style={{ padding: 14, alignItems: 'flex-start', opacity: e.cancelled || past ? 0.6 : 1 }}>
                  <Photo photo={e.photo} width={200} style={{ width: 64, height: 64, borderRadius: 12 }} decorative />
                  <View style={{ flex: 1 }}>
                    <Row gap={6} style={{ flexWrap: 'wrap' }}>
                      <Tag label={e.category} tone="neutral" />
                      {e.featured ? <Tag label="Featured" tone="gold" icon="star" /> : null}
                      {e.cancelled ? <Tag label="Cancelled" tone="purple" /> : null}
                      {past ? <Tag label="Past" tone="neutral" /> : null}
                    </Row>
                    <T v="title3" style={{ marginTop: 6 }} numberOfLines={2}>
                      {e.title}
                    </T>
                    <T v="caption" muted numberOfLines={1}>
                      {longDate(e.date)} · {time(e.date)} · {e.location}
                    </T>
                    <View style={{ marginTop: 10 }}>
                      <Progress value={e.attending / e.capacity} height={3} />
                      <T v="caption" muted style={{ marginTop: 5 }} tabular>
                        {e.attending}/{e.capacity} registered · {regs} via app
                      </T>
                    </View>
                  </View>
                </Row>
                <Row gap={0} style={styles.actions}>
                  <Action label="Edit" onPress={() => router.push({ pathname: '/admin/event-editor', params: { id: e.id } })} />
                  <Action label={e.featured ? 'Unfeature' : 'Feature'} onPress={() => actions.updateEvent(e.id, { featured: !e.featured })} />
                  <Action
                    label={e.cancelled ? 'Restore' : 'Cancel'}
                    onPress={() => (e.cancelled ? actions.updateEvent(e.id, { cancelled: false }) : confirmAction('Cancel event?', `Members registered for ${e.title} will see it as cancelled.`, () => actions.updateEvent(e.id, { cancelled: true }), 'Cancel event'))}
                  />
                  <Action label="Delete" onPress={() => confirmAction('Delete event?', 'This removes the event and all of its registrations.', () => actions.deleteEvent(e.id), 'Delete')} />
                </Row>
              </Panel>
            </FadeIn>
          );
        })
      ) : (
        <EmptyState icon="calendar-outline" title="No events" body="Create your first event." />
      )}
    </AdminScreen>
  );
}

function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PressScale onPress={onPress} haptic accessibilityRole="button" style={{ flex: 1, paddingVertical: 13, alignItems: 'center' }}>
      <T v="subhead" c={label === 'Delete' ? palette.goldSoft : palette.gold}>
        {label}
      </T>
    </PressScale>
  );
}

const styles = StyleSheet.create({ actions: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#3A3B43' } });
