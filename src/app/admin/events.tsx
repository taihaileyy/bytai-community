import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useActions, useStore } from '@/store/AppStore';
import { dark, getCategoryColor, palette } from '@/theme';
import { longDate, time } from '@/utils/format';
import { confirmAction } from '@/utils/confirm';
import { FadeIn, GrowBar } from '@/components/Motion';
import { Txt } from '@/components/Txt';
import { Button, Card, EmptyState, FocusStatusBar, IconButton, Row, Screen, Tag } from '@/components/ui';
import { DateBlock } from '@/components/domain';
import { AdminHeader } from '@/components/admin';

export default function AdminEvents() {
  const { state } = useStore();
  const actions = useActions();
  const list = [...state.events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Screen
      header={<AdminHeader title="Events" eyebrow="Manage" right={<IconButton icon="add" label="New event" onPress={() => router.push('/admin/event-editor')} />} />}
    >
      <FocusStatusBar style="light" />
      <Button title="Create new event" icon="add-circle" onPress={() => router.push('/admin/event-editor')} style={{ marginBottom: 16 }} />
      {list.length ? (
        list.map((e, i) => {
          const c = getCategoryColor(e.category);
          const regs = state.registrations.filter((r) => r.eventId === e.id).length;
          return (
            <FadeIn key={e.id} delay={i * 40}>
              <Card flat style={{ marginBottom: 12, opacity: e.cancelled ? 0.7 : 1 }}>
                <Row gap={14} style={{ alignItems: 'flex-start' }}>
                  <DateBlock iso={e.date} />
                  <View style={{ flex: 1 }}>
                    <Row gap={6} style={{ flexWrap: 'wrap' }}>
                      <Tag label={e.category} fg={c.fg} bg={c.bg} />
                      {e.featured ? <Tag label="Featured" fg={palette.night} bg={palette.gold} icon="star" /> : null}
                      {e.cancelled ? <Tag label="Cancelled" fg={palette.clay} bg={palette.claySoft} /> : null}
                    </Row>
                    <Txt variant="heading" style={{ marginTop: 8 }}>
                      {e.title}
                    </Txt>
                    <Txt variant="caption" muted>
                      {longDate(e.date)} · {time(e.date)} · {e.location}
                    </Txt>
                    <View style={{ marginTop: 10 }}>
                      <GrowBar progress={e.attending / e.capacity} color={dark.accent} track={dark.surface2} height={6} />
                      <Txt variant="caption" muted style={{ marginTop: 5, fontSize: 11.5 }}>
                        {e.attending}/{e.capacity} attending · {regs} app RSVPs
                      </Txt>
                    </View>
                  </View>
                </Row>
                <Row gap={8} style={{ marginTop: 14, flexWrap: 'wrap' }}>
                  <Button size="sm" variant="secondary" icon="create-outline" title="Edit" onPress={() => router.push({ pathname: '/admin/event-editor', params: { id: e.id } })} />
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={e.featured ? 'star' : 'star-outline'}
                    title={e.featured ? 'Unfeature' : 'Feature'}
                    onPress={() => actions.updateEvent(e.id, { featured: !e.featured })}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={e.cancelled ? 'refresh' : 'ban-outline'}
                    title={e.cancelled ? 'Restore' : 'Cancel'}
                    onPress={() =>
                      e.cancelled
                        ? actions.updateEvent(e.id, { cancelled: false })
                        : confirmAction('Cancel event?', `Members registered for ${e.title} will see it as cancelled.`, () => actions.updateEvent(e.id, { cancelled: true }), 'Cancel event')
                    }
                  />
                  <Button
                    size="sm"
                    variant="danger"
                    icon="trash-outline"
                    title="Delete"
                    onPress={() => confirmAction('Delete event?', 'This removes the event and all of its RSVPs.', () => actions.deleteEvent(e.id), 'Delete')}
                  />
                </Row>
              </Card>
            </FadeIn>
          );
        })
      ) : (
        <EmptyState icon="calendar-outline" title="No events" body="Create your first event." />
      )}
    </Screen>
  );
}
