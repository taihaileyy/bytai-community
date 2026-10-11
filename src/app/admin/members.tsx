import React, { useMemo, useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, UIManager, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/store/AppStore';
import { gutter, palette, radius } from '@/theme';
import { money, shortDate } from '@/utils/format';
import { PressScale } from '@/components/Motion';
import { T } from '@/components/Text';
import { Avatar, Divider, EmptyState, Pill, PillRow, Row, SearchField, Tag } from '@/components/ui';
import { AdminScreen } from '@/components/admin';

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
        given: state.donations.filter((d) => d.memberId === m.id).reduce((s, d) => s + d.amount, 0),
      }))
      .sort((a, b) => (sort === 'Name' ? a.m.name.localeCompare(b.m.name) : sort === 'Newest' ? b.m.joined.localeCompare(a.m.joined) : b.m.volunteerHours - a.m.volunteerHours));
  }, [state, q, sort]);

  return (
    <AdminScreen title="Members" eyebrow={`${state.members.length} in demo · 1,248 sample total`}>
      <SearchField value={q} onChangeText={setQ} placeholder="Search name, email, neighborhood" />
      <PillRow style={{ marginTop: 12 }}>
        {SORTS.map((s) => (
          <Pill key={s} label={s} selected={sort === s} onPress={() => setSort(s)} />
        ))}
      </PillRow>
      <View style={styles.list}>
        {rows.length ? (
          rows.map(({ m, programs, events, given }, i) => {
            const expanded = open === m.id;
            return (
              <View key={m.id}>
                {i > 0 ? <Divider inset={70} /> : null}
                <PressScale
                  scaleTo={0.99}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setOpen(expanded ? null : m.id);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  accessibilityLabel={`${m.name}, ${m.neighborhood}`}
                >
                  <Row gap={14} style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
                    <Avatar name={m.name} size={40} />
                    <View style={{ flex: 1 }}>
                      <Row gap={6}>
                        <T v="bodyMedium" numberOfLines={1} style={{ flexShrink: 1 }}>
                          {m.name}
                        </T>
                        {m.role === 'admin' ? <Tag label="Admin" tone="gold" /> : null}
                      </Row>
                      <T v="caption" muted>
                        {m.neighborhood} · joined {shortDate(m.joined)}
                      </T>
                    </View>
                    <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={17} color={palette.gold} />
                  </Row>
                </PressScale>
                {expanded ? (
                  <View style={styles.detail}>
                    <Row style={{ justifyContent: 'space-between' }}>
                      {[
                        [String(programs.length), 'Programs'],
                        [String(events), 'Events'],
                        [money(given), 'Given'],
                        [`${m.volunteerHours}`, 'Hours'],
                      ].map(([v, l]) => (
                        <View key={l} style={{ alignItems: 'center', flex: 1 }}>
                          <T v="stat" style={{ fontSize: 20 }}>
                            {v}
                          </T>
                          <T v="caption" muted>
                            {l}
                          </T>
                        </View>
                      ))}
                    </Row>
                    <T v="caption" muted style={{ marginTop: 12 }}>
                      {m.email} · {m.phone}
                    </T>
                    {programs.length ? (
                      <Row gap={6} style={{ flexWrap: 'wrap', marginTop: 10 }}>
                        {programs.map((p) => (
                          <Tag key={p} label={p} tone="neutral" />
                        ))}
                      </Row>
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          })
        ) : (
          <EmptyState icon="people-outline" title="No members found" body="Try another search." />
        )}
      </View>
      <T v="caption" muted center style={{ marginTop: 16 }}>
        All member records are fictional sample data.
      </T>
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  list: { marginHorizontal: gutter, marginTop: 16, borderRadius: radius.lg, backgroundColor: palette.charcoal, overflow: 'hidden' },
  detail: { marginHorizontal: 14, marginBottom: 14, padding: 14, borderRadius: radius.md, backgroundColor: palette.midnight },
});
