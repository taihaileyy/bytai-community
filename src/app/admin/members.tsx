import React, { useMemo, useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, UIManager, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/store/AppStore';
import { dark, palette, radius } from '@/theme';
import { money, shortDate } from '@/utils/format';
import { PressScale } from '@/components/Motion';
import { Txt } from '@/components/Txt';
import { Avatar, Card, Chip, ChipRow, EmptyState, FocusStatusBar, Row, Screen, SearchField, Tag } from '@/components/ui';
import { AdminHeader } from '@/components/admin';

if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental?.(true);

const SORTS = ['Newest', 'Name', 'Most active'] as const;

export default function Members() {
  const { state } = useStore();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<(typeof SORTS)[number]>('Newest');
  const [open, setOpen] = useState<string | null>(null);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return state.members
      .filter((m) => !query || `${m.name} ${m.email} ${m.neighborhood}`.toLowerCase().includes(query))
      .map((m) => ({
        m,
        programs: state.enrollments.filter((e) => e.memberId === m.id).map((e) => state.programs.find((p) => p.id === e.programId)?.title ?? ''),
        events: state.registrations.filter((r) => r.memberId === m.id).length,
        given: state.donations.filter((d) => d.memberId === m.id || d.donorName === m.name).reduce((s, d) => s + d.amount, 0),
      }))
      .sort((a, b) =>
        sort === 'Name' ? a.m.name.localeCompare(b.m.name) : sort === 'Newest' ? b.m.joined.localeCompare(a.m.joined) : b.m.volunteerHours - a.m.volunteerHours,
      );
  }, [state, q, sort]);

  return (
    <Screen header={<AdminHeader title="Members" eyebrow={`${state.members.length} total`} />}>
      <FocusStatusBar style="light" />
      <SearchField value={q} onChangeText={setQ} placeholder="Search name, email, neighborhood" />
      <ChipRow>
        {SORTS.map((s) => (
          <Chip key={s} label={s} selected={sort === s} onPress={() => setSort(s)} />
        ))}
      </ChipRow>
      <View style={{ height: 14 }} />
      {rows.length ? (
        rows.map(({ m, programs, events, given }) => {
          const expanded = open === m.id;
          return (
            <Card key={m.id} style={{ marginBottom: 10 }} flat>
              <PressScale
                scaleTo={0.99}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setOpen(expanded ? null : m.id);
                }}
                accessibilityRole="button"
              >
                <Row gap={12}>
                  <Avatar name={m.name} color={m.avatarColor === palette.night ? palette.green : m.avatarColor} size={42} />
                  <View style={{ flex: 1 }}>
                    <Row gap={6}>
                      <Txt variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
                        {m.name}
                      </Txt>
                      {m.role === 'admin' ? <Tag label="Admin" fg={palette.night} bg={palette.mintBright} /> : null}
                    </Row>
                    <Txt variant="caption" muted numberOfLines={1}>
                      {m.neighborhood} · joined {shortDate(m.joined)}
                    </Txt>
                  </View>
                  <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={dark.muted} />
                </Row>
              </PressScale>
              {expanded ? (
                <View style={styles.detail}>
                  <Row style={styles.metrics}>
                    {[
                      ['Programs', String(programs.length)],
                      ['Events', String(events)],
                      ['Given', money(given)],
                      ['Hours', String(m.volunteerHours)],
                    ].map(([k, v]) => (
                      <View key={k} style={{ flex: 1, alignItems: 'center' }}>
                        <Txt variant="heading">{v}</Txt>
                        <Txt variant="caption" muted style={{ fontSize: 11 }}>
                          {k}
                        </Txt>
                      </View>
                    ))}
                  </Row>
                  <Txt variant="caption" muted style={{ marginTop: 12 }}>
                    {m.email} · {m.phone}
                  </Txt>
                  {programs.length ? (
                    <Row gap={6} style={{ flexWrap: 'wrap', marginTop: 10 }}>
                      {programs.map((p) => (
                        <Tag key={p} label={p} fg={palette.mintBright} bg={dark.accentSoft} />
                      ))}
                    </Row>
                  ) : null}
                </View>
              ) : null}
            </Card>
          );
        })
      ) : (
        <EmptyState icon="people-outline" title="No members found" body="Try another search." />
      )}
      <Txt variant="caption" muted center style={{ marginTop: 10 }}>
        All member records are fictional sample data.
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  detail: { marginTop: 14, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: dark.border },
  metrics: { backgroundColor: dark.surface2, borderRadius: radius.md, paddingVertical: 12 },
});
