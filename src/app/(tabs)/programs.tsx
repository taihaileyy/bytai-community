import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useStore, useMyActivity, useSession } from '@/store/AppStore';
import type { ProgramCategory } from '@/data/types';
import { FadeIn } from '@/components/Motion';
import { T } from '@/components/Text';
import { Chip, ChipRow, EmptyState, LargeTitleScreen, SearchField } from '@/components/ui';
import { ProgramListItem } from '@/components/domain';
import { gutter } from '@/theme';

const CATEGORIES: ('All' | ProgramCategory)[] = ['All', 'Food', 'Youth', 'Learning', 'Wellness', 'Housing'];

export default function Programs() {
  const { state } = useStore();
  const { signedIn } = useSession();
  const { isEnrolled, enrollments } = useMyActivity();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('All');
  const [mine, setMine] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.programs.filter(
      (p) =>
        (cat === 'All' || p.category === cat) &&
        (!mine || isEnrolled(p.id)) &&
        (!q || `${p.title} ${p.summary} ${p.category} ${p.location}`.toLowerCase().includes(q)),
    );
  }, [state.programs, query, cat, mine, isEnrolled]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: state.programs.length };
    state.programs.forEach((p) => (c[p.category] = (c[p.category] ?? 0) + 1));
    return c;
  }, [state.programs]);

  return (
    <LargeTitleScreen title="Programs" subtitle="Free programs for every age, run by neighbors.">
      <SearchField value={query} onChangeText={setQuery} placeholder="Search programs" />
      <ChipRow style={{ marginTop: 14 }}>
        {signedIn ? <Chip label="My programs" icon="bookmark-outline" count={enrollments.length} selected={mine} onPress={() => setMine(!mine)} /> : null}
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} count={counts[c] ?? 0} selected={cat === c} onPress={() => setCat(c)} />
        ))}
      </ChipRow>
      <T v="caption" muted style={{ marginHorizontal: gutter, marginTop: 20, marginBottom: 14 }} accessibilityLiveRegion="polite">
        {list.length} program{list.length === 1 ? '' : 's'}
      </T>
      {list.length ? (
        list.map((p, i) => (
          <FadeIn key={p.id} delay={Math.min(i, 4) * 60}>
            <ProgramListItem program={p} enrolled={!!isEnrolled(p.id)} />
          </FadeIn>
        ))
      ) : (
        <EmptyState
          icon="search"
          title="No programs match"
          body="Try a different search or category."
          action="Clear filters"
          onAction={() => {
            setQuery('');
            setCat('All');
            setMine(false);
          }}
        />
      )}
      <View style={{ height: 8 }} />
    </LargeTitleScreen>
  );
}
