import React, { useState } from 'react';
import { View } from 'react-native';
import { useStore } from '@/store/AppStore';
import { getCategoryColor } from '@/theme';
import { shortDate } from '@/utils/format';
import { GrowBar } from '@/components/Motion';
import { Txt } from '@/components/Txt';
import { Avatar, Card, Chip, ChipRow, Divider, EmptyState, FocusStatusBar, IconBubble, Row, Screen, Tag, type IconName } from '@/components/ui';
import { AdminHeader } from '@/components/admin';
import { useScheme } from '@/theme/SchemeContext';

export default function AdminEnrollments() {
  const { state } = useStore();
  const s = useScheme();
  const [programId, setProgramId] = useState<string>('all');
  const programs = programId === 'all' ? state.programs : state.programs.filter((p) => p.id === programId);

  return (
    <Screen header={<AdminHeader title="Enrollments" eyebrow="Programs" />}>
      <FocusStatusBar style="light" />
      <ChipRow>
        <Chip label="All programs" selected={programId === 'all'} onPress={() => setProgramId('all')} />
        {state.programs.map((p) => (
          <Chip key={p.id} label={p.title.split(' ').slice(0, 2).join(' ')} selected={programId === p.id} onPress={() => setProgramId(p.id)} />
        ))}
      </ChipRow>
      <View style={{ height: 14 }} />
      {programs.map((p) => {
        const c = getCategoryColor(p.category);
        const list = state.enrollments.filter((e) => e.programId === p.id).sort((a, b) => b.date.localeCompare(a.date));
        return (
          <Card key={p.id} flat style={{ marginBottom: 12 }}>
            <Row gap={12}>
              <IconBubble icon={p.icon as IconName} fg={c.fg} bg={c.bg} size={40} />
              <View style={{ flex: 1 }}>
                <Txt variant="heading" numberOfLines={1}>
                  {p.title}
                </Txt>
                <Txt variant="caption" muted>
                  {list.length} app enrollments · {p.enrolled}/{p.capacity} seats
                </Txt>
              </View>
            </Row>
            <View style={{ marginTop: 12 }}>
              <GrowBar progress={p.enrolled / p.capacity} color={c.fg} track={s.surface2} height={6} />
            </View>
            {programId !== 'all' || list.length <= 4 ? null : (
              <Txt variant="caption" accent style={{ marginTop: 10 }}>
                Showing 4 of {list.length} · tap the chip above to see all
              </Txt>
            )}
            {(programId === 'all' ? list.slice(0, 4) : list).map((e, i) => {
              const m = state.members.find((x) => x.id === e.memberId);
              if (!m) return null;
              return (
                <View key={e.id}>
                  <Divider style={{ marginTop: i === 0 ? 12 : 0 }} />
                  <Row gap={10} style={{ paddingVertical: 10 }}>
                    <Avatar name={m.name} color={m.avatarColor} size={30} />
                    <Txt variant="body" style={{ flex: 1 }} numberOfLines={1}>
                      {m.name}
                    </Txt>
                    {e.status === 'waitlist' ? <Tag label="Waitlist" fg="#8A6A1E" bg="#F3E7C7" /> : null}
                    <Txt variant="caption" muted>
                      {shortDate(e.date)}
                    </Txt>
                  </Row>
                </View>
              );
            })}
            {!list.length ? (
              <View style={{ marginTop: 8 }}>
                <EmptyState icon="school-outline" title="No app enrollments yet" body="Members who enroll in the app will appear here." />
              </View>
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}
