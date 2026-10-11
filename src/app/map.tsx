import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { PLACES, type PlaceKind } from '@/data/places';
import { gutter, palette, radius } from '@/theme';
import { ToneProvider } from '@/theme/ToneContext';
import { FadeIn, PressScale } from '@/components/Motion';
import { NolaMap } from '@/components/NolaMap';
import { Photo } from '@/components/Photo';
import { T } from '@/components/Text';
import { notice } from '@/utils/confirm';
import { Button, EmptyState, FocusStatusBar, IconButton, NavBar, Pill, Row, SearchField } from '@/components/ui';

const KINDS: PlaceKind[] = ['Programs', 'Events', 'Resources'];

export default function CommunityMap() {
  return (
    <ToneProvider tone="dark">
      <MapBody />
    </ToneProvider>
  );
}

function MapBody() {
  const [kind, setKind] = useState<PlaceKind>('Programs');
  const [selected, setSelected] = useState<string | undefined>();
  const [q, setQ] = useState('');
  const [searching, setSearching] = useState(false);

  const places = useMemo(() => {
    const query = q.trim().toLowerCase();
    return PLACES.filter((p) => p.kind === kind && (!query || `${p.name} ${p.tags.join(' ')}`.toLowerCase().includes(query))).sort((a, b) => a.miles - b.miles);
  }, [kind, q]);

  return (
    <View style={{ flex: 1, backgroundColor: palette.midnight }}>
      <FocusStatusBar style="light" />
      <NavBar
        right={<IconButton icon={searching ? 'close' : 'search'} tone="ghost" color={palette.ivory} label={searching ? 'Close search' : 'Search places'} onPress={() => { if (searching) setQ(''); setSearching(!searching); }} />}
      />
      <T v="display" style={{ marginHorizontal: gutter, marginTop: -4, marginBottom: 12 }} accessibilityRole="header">
        Community Near You
      </T>
      {searching ? (
        <View style={{ marginBottom: 12 }}>
          <SearchField value={q} onChangeText={setQ} placeholder="Search places" autoFocus />
        </View>
      ) : null}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} stickyHeaderIndices={[1]}>
        <NolaMap places={places} selected={selected} onSelect={(id) => setSelected(id === selected ? undefined : id)} />
        <View style={{ backgroundColor: palette.midnight, paddingVertical: 14 }}>
          <Row gap={8} style={{ paddingHorizontal: gutter }}>
            {KINDS.map((k) => (
              <Pill key={k} label={k} selected={kind === k} onPress={() => { setKind(k); setSelected(undefined); }} style={{ flex: 1, justifyContent: 'center' }} />
            ))}
          </Row>
        </View>
        {places.length ? (
          places.map((p, i) => {
            const on = p.id === selected;
            return (
              <FadeIn key={p.id} delay={i * 50}>
                <PressScale onPress={() => setSelected(on ? undefined : p.id)} scaleTo={0.985} accessibilityRole="button" accessibilityState={{ expanded: on }} accessibilityLabel={`${p.name}. ${p.tags.join(', ')}. ${p.miles} miles away.`} style={[styles.row, on && styles.rowOn]}>
                  <Row gap={14}>
                    <Photo photo={p.photo} width={240} decorative style={styles.thumb} />
                    <View style={{ flex: 1 }}>
                      <T v="title3" c={palette.ivory} numberOfLines={1}>
                        {p.name}
                      </T>
                      <T v="caption" c="#B3ADA3" numberOfLines={1} style={{ marginTop: 3 }}>
                        {p.tags.join(' • ')}
                      </T>
                      <Row gap={4} style={{ marginTop: 5 }}>
                        <Ionicons name="navigate-outline" size={12} color={palette.gold} />
                        <T v="caption" c={palette.gold}>
                          {p.miles} miles
                        </T>
                      </Row>
                    </View>
                    <Ionicons name={on ? 'chevron-up' : 'chevron-forward'} size={18} color={palette.gold} />
                  </Row>
                  {on ? (
                    <Row gap={10} style={{ marginTop: 14 }}>
                      {p.hours ? (
                        <T v="caption" c="#B3ADA3" style={{ flex: 1 }}>
                          {p.hours}
                        </T>
                      ) : (
                        <View style={{ flex: 1 }} />
                      )}
                      {p.href ? <Button title="View details" size="sm" variant="gold" iconRight="arrow-forward" onPress={() => router.push(p.href as never)} /> : <Button title="Directions" size="sm" variant="outline" icon="navigate-outline" onPress={() => notice('Directions (demo)', 'In the finished app this opens Apple or Google Maps with directions.')} />}
                    </Row>
                  ) : null}
                </PressScale>
              </FadeIn>
            );
          })
        ) : (
          <EmptyState icon="location-outline" title="No places found" body="Try another search or category." />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginHorizontal: gutter, marginBottom: 10, padding: 12, borderRadius: radius.lg, backgroundColor: palette.charcoal, borderWidth: StyleSheet.hairlineWidth, borderColor: '#33343C' },
  rowOn: { borderColor: palette.gold },
  thumb: { width: 64, height: 64, borderRadius: radius.sm },
});
