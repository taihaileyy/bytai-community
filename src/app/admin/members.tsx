import React, { useMemo, useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, UIManager, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/store/AppStore';
import { color, gutter, radius } from '@/theme';
import { money, shortDate } from '@/utils/format';
import { PressScale } from '@/components/Motion';
import { T } from '@/components/Text';
import { Avatar, Chip, ChipRow, Divider, EmptyState, Row, SearchField, Tag } from '@/components/ui';
import { Stat, StatStrip } from '@/components/domain';
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
        given: state.donations.filter((d) => d.memberId === m.id || d.donorName === m.name).reduce((s, d) => s + d.amount, 0),
      }))
      .sort((a, b) => (sort === 'Name' ? a.m.name.localeCompare(b.m.name) : sort === 'Newest' ? b.m.joined.localeCompare(a.m.joined) : b.m.volunteerHours - a.m.volunteerHours));
  }, [state, q, sort]);

  return (
    <AdminScreen title="Members" eyebrow={`${state.members.length} people`}>
      <SearchField value={q} onChangeText={setQ} placeholder="Search name, email, neighborhood" />
      <ChipRow style={{ marginTop: 12 }}>
        {SORTS.map((s) => (
          <Chip key={s} label={s} selected={sort === s} onPress={() => setSort(s)} />
        ))}
      </ChipRow>
      <View style={styles.list}>
        {rows.length ? (
          rows.map(({ m, programs, events, given }, i) => {
            const expanded = open === m.id;
            return (
              <View key={m.id}>
                {i > 0 ? <Divider inset={72} /> : null}
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
                  <Row gap={14} style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                    <Avatar name={m.name} size={42} tone={m.role === 'admin' ? 'dark' : 'neutral'} />
                    <View style={{ flex: 1 }}>
                      <Row gap={6}>
                        <T v="bodyMedium" numberOfLines={1} style={{ flexShrink: 1 }}>
                          {m.name}
                        </T>
                        {m.role === 'admin' ? <Tag label="Admin" tone="dark" /> : null}
                      </Row>
                      <T v="caption" muted>
                        {m.neighborhood} · joined {shortDate(m.joined)}
                      </T>
                    </View>
                    <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={17} color={color.faint} />
                  </Row>
                </PressScale>
                {expanded ? (
                  <View style={styles.detail}>
                    <StatStrip>
                      <Stat value={programs.length} label="Programs" />
                      <Stat value={events} label="Events" />
                      <Stat value={given} prefix="$" label="Given" />
                      <Stat value={m.volunteerHours} label="Hours" />
                    </StatStrip>
                    <T v="caption" muted style={{ marginTop: 14 }}>
                      {m.email} · {m.phone}
                    </T>
                    {programs.length ? (
                      <Row gap={6} style={{ flexWrap: 'wrap', marginTop: 10 }}>
                        {programs.map((p) => (
                          <Tag key={p} label={p} />
                        ))}
                      </Row>
                    ) : null}
                    <T v="caption" muted style={{ marginTop: 10 }}>
                      Lifetime giving {money(given)}
                    </T>
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
  list: { marginHorizontal: gutter, marginTop: 18, borderRadius: radius.lg, backgroundColor: color.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: color.line, overflow: 'hidden' },
  detail: { marginHorizontal: 16, marginBottom: 14, padding: 14, borderRadius: radius.md, backgroundColor: color.bg },
});
