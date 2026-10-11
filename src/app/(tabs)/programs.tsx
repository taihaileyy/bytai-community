import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useMyActivity, useSession, useStore } from '@/store/AppStore';
import type { ProgramCategory } from '@/data/types';
import { palette } from '@/theme';
import { ToneProvider } from '@/theme/ToneContext';
import { FadeIn } from '@/components/Motion';
import { T } from '@/components/Text';
import { EmptyState, FocusStatusBar, IconButton, Pill, PillRow, SearchField, TabHeader } from '@/components/ui';
import { ProgramCard } from '@/components/domain';
import { gutter } from '@/theme';

const CATEGORIES: ('All' | ProgramCategory)[] = ['All', 'Youth', 'Housing', 'Arts', 'Workforce'];

export default function Programs() {
  return (
    <ToneProvider tone="dark">
      <ProgramsBody />
    </ToneProvider>
  );
}

function ProgramsBody() {
  const { state } = useStore();
  const { signedIn } = useSession();
  const { isEnrolled, enrollments } = useMyActivity();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('All');
  const [mine, setMine] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.programs.filter(
      (p) => (cat === 'All' || p.category === cat) && (!mine || isEnrolled(p.id)) && (!q || `${p.title} ${p.summary} ${p.category} ${p.location}`.toLowerCase().includes(q)),
    );
  }, [state.programs, query, cat, mine, isEnrolled]);

  return (
    <View style={{ flex: 1, backgroundColor: palette.midnight }}>
      <FocusStatusBar style="light" />
      <TabHeader
        title="Programs"
        right={
          <IconButton
            icon={searching ? 'close' : 'search'}
            tone="ghost"
            label={searching ? 'Close search' : 'Search programs'}
            onPress={() => {
              if (searching) setQuery('');
              setSearching(!searching);
            }}
          />
        }
      />
      {searching ? (
        <FadeIn distance={6} style={{ marginBottom: 12 }}>
          <SearchField value={query} onChangeText={setQuery} placeholder="Search programs" autoFocus />
        </FadeIn>
      ) : null}
      <View>
        <PillRow>
          {CATEGORIES.map((c) => (
            <Pill key={c} label={c} selected={cat === c && !mine} onPress={() => { setCat(c); setMine(false); }} />
          ))}
          {signedIn ? <Pill label={`Mine · ${enrollments.length}`} icon="bookmark-outline" selected={mine} onPress={() => setMine(!mine)} /> : null}
        </PillRow>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
        <T v="caption" muted style={{ marginHorizontal: gutter, marginBottom: 12 }} accessibilityLiveRegion="polite">
          {list.length} program{list.length === 1 ? '' : 's'}
        </T>
        {list.length ? (
          list.map((p, i) => (
            <FadeIn key={p.id} delay={Math.min(i, 5) * 60}>
              <ProgramCard program={p} enrolled={!!isEnrolled(p.id)} />
            </FadeIn>
          ))
        ) : (
          <EmptyState icon="search" title="No programs match" body="Try a different search or category." action="Clear filters" onAction={() => { setQuery(''); setCat('All'); setMine(false); }} />
        )}
      </ScrollView>
    </View>
  );
}
