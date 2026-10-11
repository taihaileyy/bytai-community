import React, { useState } from 'react';
import { View } from 'react-native';
import { useStore } from '@/store/AppStore';
import { color, gutter } from '@/theme';
import { shortDate } from '@/utils/format';
import { T } from '@/components/Text';
import { Photo } from '@/components/Photo';
import { Avatar, Chip, ChipRow, Divider, Progress, Row, Tag } from '@/components/ui';
import { AdminScreen, Panel } from '@/components/admin';

export default function AdminEnrollments() {
  const { state } = useStore();
  const [programId, setProgramId] = useState('all');
  const programs = programId === 'all' ? state.programs : state.programs.filter((p) => p.id === programId);

  return (
    <AdminScreen title="Enrollments" eyebrow="Programs">
      <ChipRow>
        <Chip label="All" selected={programId === 'all'} onPress={() => setProgramId('all')} />
        {state.programs.map((p) => (
          <Chip key={p.id} label={p.title.split(' ').slice(0, 2).join(' ')} selected={programId === p.id} onPress={() => setProgramId(p.id)} />
        ))}
      </ChipRow>
      <View style={{ height: 18 }} />
      {programs.map((p) => {
        const list = state.enrollments.filter((e) => e.programId === p.id).sort((a, b) => b.date.localeCompare(a.date));
        const shown = programId === 'all' ? list.slice(0, 3) : list;
        return (
          <Panel key={p.id} style={{ marginBottom: 12 }}>
            <Row gap={14}>
              <Photo photo={p.photo} width={160} style={{ width: 48, height: 48, borderRadius: 12 }} decorative />
              <View style={{ flex: 1 }}>
                <T v="headline" numberOfLines={1}>
                  {p.title}
                </T>
                <T v="caption" muted tabular>
                  {list.length} via app · {p.enrolled}/{p.capacity} seats
                </T>
              </View>
            </Row>
            <View style={{ marginTop: 14 }}>
              <Progress value={p.enrolled / p.capacity} tone={p.enrolled >= p.capacity ? 'danger' : 'accent'} />
            </View>
            {shown.map((e, i) => {
              const m = state.members.find((x) => x.id === e.memberId);
              if (!m) return null;
              return (
                <View key={e.id}>
                  <Divider style={{ marginTop: i === 0 ? 14 : 0 }} />
                  <Row gap={10} style={{ paddingVertical: 10 }}>
                    <Avatar name={m.name} size={28} />
                    <T v="callout" style={{ flex: 1 }} numberOfLines={1}>
                      {m.name}
                    </T>
                    {e.status === 'waitlist' ? <Tag label="Waitlist" tone="warn" /> : null}
                    <T v="caption" muted>
                      {shortDate(e.date)}
                    </T>
                  </Row>
                </View>
              );
            })}
            {programId === 'all' && list.length > 3 ? (
              <T v="caption" c={color.ink2} style={{ marginTop: 4 }} onPress={() => setProgramId(p.id)} accessibilityRole="button">
                View all {list.length} →
              </T>
            ) : null}
            {!list.length ? (
              <T v="caption" muted style={{ marginTop: 12 }}>
                No app enrollments yet.
              </T>
            ) : null}
          </Panel>
        );
      })}
    </AdminScreen>
  );
}
