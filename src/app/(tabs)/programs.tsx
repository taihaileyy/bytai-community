import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useStore, useMyActivity, useSession } from '@/store/AppStore';
import type { ProgramCategory } from '@/data/types';
import { FadeIn } from '@/components/Motion';
import { Txt } from '@/components/Txt';
import { Chip, ChipRow, EmptyState, FocusStatusBar, PageTitle, Screen, SearchField } from '@/components/ui';
import { ProgramRowCard } from '@/components/domain';

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

  return (
    <Screen>
      <FocusStatusBar style="dark" />
      <PageTitle eyebrow="Programs" title="Find your place" subtitle="Free programs for every age, run by neighbors who care." />
      <SearchField value={query} onChangeText={setQuery} placeholder="Search programs, places, topics" />
      <ChipRow>
        {signedIn ? <Chip label={`Mine (${enrollments.length})`} icon="bookmark" selected={mine} onPress={() => setMine(!mine)} /> : null}
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} selected={cat === c} onPress={() => setCat(c)} />
        ))}
      </ChipRow>
      <Txt variant="caption" muted style={{ marginTop: 16, marginBottom: 10 }}>
        {list.length} program{list.length === 1 ? '' : 's'}
      </Txt>
      {list.length ? (
        list.map((p, i) => (
          <FadeIn key={p.id} delay={i * 50}>
            <ProgramRowCard program={p} enrolled={!!isEnrolled(p.id)} />
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
    </Screen>
  );
}
