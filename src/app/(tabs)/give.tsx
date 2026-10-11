import React, { useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DONATION_FUNDS } from '@/data/seed';
import type { DonationFrequency } from '@/data/types';
import { useMyActivity, useSession, useStore } from '@/store/AppStore';
import { font, gutter, palette, radius } from '@/theme';
import { ToneProvider } from '@/theme/ToneContext';
import { money } from '@/utils/format';
import { FadeIn, PressScale } from '@/components/Motion';
import { Photo } from '@/components/Photo';
import { T } from '@/components/Text';
import { Button, DemoBadge, FocusStatusBar, Group, ListItem, Notice, Progress, Row, SectionHeader, Segmented, Toggle, type IconName } from '@/components/ui';
import { DonationRow } from '@/components/domain';

const PRESETS = [25, 50, 100, 250];
const MATCH_GOAL = 25000;
const FUND_ICONS: Record<string, IconName> = {
  'Food & essential resources': 'basket-outline',
  'Youth programs': 'people-outline',
  'Housing support': 'home-outline',
  'Arts & cultural initiatives': 'color-palette-outline',
  'Community events': 'calendar-outline',
};
const IMPACT: [number, string][] = [
  [250, 'Covers a month of mentoring for two students.'],
  [100, 'Funds a week of safe housing for someone in recovery.'],
  [50, 'Provides a week of groceries for a family of four.'],
  [25, 'Buys art supplies for a studio night.'],
  [1, 'Every dollar keeps our programs free for neighbors.'],
];

export default function Give() {
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const { signedIn } = useSession();
  const { donations } = useMyActivity();
  const [frequency, setFrequency] = useState<DonationFrequency>('one-time');
  const [preset, setPreset] = useState<number | null>(50);
  const [custom, setCustom] = useState('');
  const [fund, setFund] = useState(DONATION_FUNDS[0]);
  const [coverFees, setCoverFees] = useState(true);
  const y = useRef(new Animated.Value(0)).current;

  const base = preset ?? (Number(custom) || 0);
  const fee = coverFees ? Math.round(base * 0.03 * 100) / 100 : 0;
  const total = Math.round((base + fee) * 100) / 100;
  const impact = IMPACT.find(([min]) => base >= min)?.[1] ?? 'Choose an amount to see your impact.';
  const matched = useMemo(() => {
    const since = Date.now() - 60 * 86400000;
    return Math.min(MATCH_GOAL, 17_600 + state.donations.filter((d) => new Date(d.date).getTime() > since).reduce((s, d) => s + d.amount, 0));
  }, [state.donations]);
  const scale = y.interpolate({ inputRange: [-200, 0], outputRange: [1.35, 1], extrapolate: 'clamp' });

  return (
    <View style={{ flex: 1, backgroundColor: palette.ivory }}>
      <FocusStatusBar style="light" />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y } } }], { useNativeDriver: true })}
        style={{ backgroundColor: palette.midnight }}
        contentContainerStyle={{ backgroundColor: palette.ivory, paddingBottom: 40 }}
      >
        <View style={{ height: 360, overflow: 'hidden' }}>
          <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale }] }]}>
            <Photo photo="balcony" width={1400} scrim={0.9} scrimTop style={StyleSheet.absoluteFill} />
          </Animated.View>
          <View style={{ position: 'absolute', top: insets.top + 10, left: gutter }}>
            <DemoBadge onImage />
          </View>
          <View style={{ position: 'absolute', left: gutter, right: gutter, bottom: 46 }}>
            <FadeIn>
              <T v="script" c={palette.gold} accessibilityRole="header" style={{ textShadowColor: 'rgba(229,183,107,0.45)', textShadowRadius: 14 }}>
                Give Back to NOLA
              </T>
              <T v="callout" c={palette.ivory} style={{ marginTop: 6, maxWidth: 290 }}>
                Your support helps provide resources, programs and opportunities for our community.
              </T>
            </FadeIn>
          </View>
        </View>

        <ToneProvider tone="light">
          <View style={styles.panel}>
            <Segmented
              options={[
                { value: 'one-time', label: 'One-time' },
                { value: 'monthly', label: 'Monthly' },
              ]}
              value={frequency}
              onChange={setFrequency}
            />
            <Row gap={8} style={{ marginTop: 16 }}>
              {PRESETS.map((a) => {
                const on = preset === a;
                return (
                  <PressScale
                    key={a}
                    haptic
                    onPress={() => { setPreset(a); setCustom(''); }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={`${a} dollars`}
                    style={[styles.amount, on && styles.amountOn]}
                  >
                    <T v="headline" c={on ? palette.ivory : palette.midnight} tabular>
                      ${a}
                    </T>
                  </PressScale>
                );
              })}
            </Row>
            <Row style={{ marginTop: 14, justifyContent: 'space-between' }} gap={12}>
              <T v="calloutMedium">Custom amount</T>
              <Row gap={4} style={[styles.custom, preset === null && { borderColor: palette.purple }]}>
                <T v="body" muted>
                  $
                </T>
                <TextInput
                  value={custom}
                  onChangeText={(t) => { setCustom(t.replace(/[^0-9]/g, '').slice(0, 5)); setPreset(t ? null : 50); }}
                  onFocus={() => custom && setPreset(null)}
                  placeholder="0.00"
                  placeholderTextColor="#A39886"
                  keyboardType="number-pad"
                  accessibilityLabel="Custom donation amount in dollars"
                  style={{ flex: 1, fontFamily: font.textMedium, fontSize: 16, color: palette.midnight, height: 44 }}
                />
              </Row>
            </Row>
            <Row gap={8} style={{ marginTop: 14 }}>
              <Ionicons name="sparkles-outline" size={15} color={palette.goldDeep} />
              <T v="caption" c={palette.goldDeep} style={{ flex: 1 }} accessibilityLiveRegion="polite">
                {base > 0 ? `${money(base)}${frequency === 'monthly' ? '/month' : ''}: ` : ''}
                {impact}
              </T>
            </Row>
          </View>

          <SectionHeader title="Your Gift Supports" style={{ marginTop: 26 }} />
          <Group>
            {DONATION_FUNDS.map((f) => {
              const on = fund === f;
              return (
                <ListItem
                  key={f}
                  icon={FUND_ICONS[f]}
                  title={f}
                  onPress={() => setFund(f)}
                  accessibilityLabel={`${f}${on ? ', selected' : ''}`}
                  trailing={<View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>}
                />
              );
            })}
          </Group>
          <Group style={{ marginTop: 12 }}>
            <View style={{ paddingHorizontal: 16 }}>
              <Toggle label="Cover processing fees" description={`Adds ${money(base * 0.03, true)} so 100% reaches the community.`} value={coverFees} onChange={setCoverFees} />
            </View>
          </Group>

          <View style={{ paddingHorizontal: gutter, marginTop: 20 }}>
            <Button
              title={base > 0 ? `Continue to Give · ${money(total, total % 1 !== 0)}${frequency === 'monthly' ? '/mo' : ''}` : 'Continue to Give'}
              variant="gold"
              iconRight="arrow-forward"
              disabled={base < 1}
              onPress={() => router.push({ pathname: '/checkout', params: { amount: String(total), gift: String(base), fee: String(fee), frequency, fund } })}
            />
            <View style={{ marginTop: 12 }}>
              <Notice icon="shield-checkmark-outline">Demo checkout — no real payment is processed and no card details are collected.</Notice>
            </View>
          </View>

          <View style={styles.match}>
            <Row style={{ justifyContent: 'space-between' }}>
              <T v="title3" c={palette.ivory}>
                Season Matching Gift
              </T>
              <T v="headline" c={palette.gold} tabular>
                {Math.round((matched / MATCH_GOAL) * 100)}%
              </T>
            </Row>
            <T v="caption" c="#B3ADA3" style={{ marginTop: 4, marginBottom: 14 }}>
              A local family foundation doubles every gift through Dec 31.
            </T>
            <ToneProvider tone="dark">
              <Progress value={matched / MATCH_GOAL} height={5} />
            </ToneProvider>
            <T v="caption" c="#B3ADA3" style={{ marginTop: 8 }} tabular>
              {money(matched)} of {money(MATCH_GOAL)} matched · sample data
            </T>
          </View>

          <SectionHeader title="Your Giving" action={signedIn && donations.length ? 'History' : undefined} onAction={() => router.push('/donations')} />
          {signedIn ? (
            <Group>
              <ListItem title="Lifetime giving" value={money(donations.reduce((s, d) => s + d.amount, 0))} />
              {donations.slice(0, 3).map((d) => (
                <DonationRow key={d.id} d={d} />
              ))}
            </Group>
          ) : (
            <Group>
              <ListItem icon="person-circle-outline" title="Sign in to see your gifts" subtitle="Receipts and monthly giving in one place" onPress={() => router.push('/sign-in')} />
            </Group>
          )}
        </ToneProvider>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { marginTop: -28, marginHorizontal: 12, padding: 18, borderRadius: radius.xl, backgroundColor: palette.ivory },
  amount: { flex: 1, height: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.paper, borderWidth: 1, borderColor: '#E3D8C6' },
  amountOn: { backgroundColor: palette.midnight, borderColor: palette.midnight },
  custom: { flex: 1, maxWidth: 190, height: 46, paddingHorizontal: 14, borderRadius: radius.md, backgroundColor: palette.paper, borderWidth: 1, borderColor: '#E3D8C6' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#CFC3AE', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: palette.purple },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: palette.purple },
  match: { marginHorizontal: gutter, marginTop: 26, padding: 18, borderRadius: radius.lg, backgroundColor: palette.midnight },
});
