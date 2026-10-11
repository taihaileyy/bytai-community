import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DONATION_FUNDS } from '@/data/seed';
import type { DonationFrequency } from '@/data/types';
import { useMyActivity, useSession, useStore } from '@/store/AppStore';
import { color, font, gutter, radius } from '@/theme';
import { money } from '@/utils/format';
import { PressScale } from '@/components/Motion';
import { T } from '@/components/Text';
import { Button, Group, LargeTitleScreen, ListItem, Notice, Progress, Row, SectionHeader, Segmented, Toggle } from '@/components/ui';
import { DonationRow } from '@/components/domain';

const PRESETS = [25, 50, 100, 250];
const IMPACT: [number, string][] = [
  [250, 'Funds a season of STEM Lab supplies for a student team.'],
  [100, 'Covers a home safety repair, like grab bars, for a senior.'],
  [50, 'Provides a week of fresh groceries for a family of four.'],
  [25, 'Stocks the homework-club snack shelf for a week.'],
  [1, 'Every dollar keeps our programs free for neighbors.'],
];
const MATCH_GOAL = 25000;
const FUND_NOTES: Record<string, string> = {
  'Where needed most': 'Lets us respond to the greatest need',
  'Fresh Pantry': 'Groceries and produce for families',
  'Youth Programs': 'STEM Lab and Homework Club',
  'Home Repair Corps': 'Safety repairs for seniors',
};

export default function Give() {
  const { state } = useStore();
  const { signedIn } = useSession();
  const { donations } = useMyActivity();
  const [frequency, setFrequency] = useState<DonationFrequency>('one-time');
  const [preset, setPreset] = useState<number | null>(50);
  const [custom, setCustom] = useState('');
  const [fund, setFund] = useState(DONATION_FUNDS[0]);
  const [coverFees, setCoverFees] = useState(true);
  const input = useRef<TextInput>(null);

  const base = preset ?? (Number(custom) || 0);
  const fee = coverFees ? Math.round(base * 0.03 * 100) / 100 : 0;
  const total = Math.round((base + fee) * 100) / 100;
  const impact = IMPACT.find(([min]) => base >= min)?.[1] ?? 'Enter an amount to see your impact.';
  const matched = useMemo(() => {
    const since = Date.now() - 60 * 86400000;
    return Math.min(MATCH_GOAL, 17_600 + state.donations.filter((d) => new Date(d.date).getTime() > since).reduce((s, d) => s + d.amount, 0));
  }, [state.donations]);
  const myTotal = donations.reduce((s, d) => s + d.amount, 0);

  return (
    <LargeTitleScreen title="Give" subtitle="Every gift keeps our programs free for the neighbors who need them.">
      <View style={{ paddingHorizontal: gutter }}>
        <Segmented
          options={[
            { value: 'one-time', label: 'One-time' },
            { value: 'monthly', label: 'Monthly' },
          ]}
          value={frequency}
          onChange={setFrequency}
        />

        {/* Amount */}
        <View style={styles.amountCard}>
          <PressScale onPress={() => { setPreset(null); input.current?.focus(); }} scaleTo={0.99} accessibilityRole="button" accessibilityLabel={`Amount ${money(base)}. Tap to enter a custom amount.`}>
            <Row gap={2} style={{ justifyContent: 'center', alignItems: 'flex-start' }}>
              <T style={styles.currency}>$</T>
              {preset === null ? (
                <TextInput
                  ref={input}
                  value={custom}
                  onChangeText={(t) => setCustom(t.replace(/[^0-9]/g, '').slice(0, 5))}
                  placeholder="0"
                  placeholderTextColor={color.faint}
                  keyboardType="number-pad"
                  autoFocus
                  accessibilityLabel="Custom donation amount in dollars"
                  style={[styles.amount, { minWidth: 60 }]}
                />
              ) : (
                <T style={styles.amount} tabular>
                  {preset}
                </T>
              )}
            </Row>
          </PressScale>
          <T v="callout" muted center>
            {frequency === 'monthly' ? 'every month' : 'one-time gift'}
          </T>

          <Row gap={8} style={{ marginTop: 20 }}>
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
                  style={[styles.preset, on && styles.presetOn]}
                >
                  <T v="calloutMedium" c={on ? color.white : color.ink} tabular>
                    ${a}
                  </T>
                </PressScale>
              );
            })}
            <PressScale
              haptic
              onPress={() => { setPreset(null); setTimeout(() => input.current?.focus(), 50); }}
              accessibilityRole="button"
              accessibilityState={{ selected: preset === null }}
              accessibilityLabel="Other amount"
              style={[styles.preset, preset === null && styles.presetOn]}
            >
              <T v="calloutMedium" c={preset === null ? color.white : color.ink}>
                Other
              </T>
            </PressScale>
          </Row>

          <Row gap={10} style={styles.impact}>
            <Ionicons name="leaf-outline" size={17} color={color.accent} />
            <T v="callout" c={color.ink2} style={{ flex: 1 }} accessibilityLiveRegion="polite">
              {impact}
            </T>
          </Row>
        </View>
      </View>

      <SectionHeader title="Direct your gift" style={{ marginTop: 28 }} />
      <Group>
        {DONATION_FUNDS.map((f) => {
          const on = fund === f;
          return (
            <ListItem
              key={f}
              title={f}
              subtitle={FUND_NOTES[f]}
              onPress={() => setFund(f)}
              accessibilityLabel={`${f}${on ? ', selected' : ''}`}
              trailing={
                <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
              }
            />
          );
        })}
      </Group>

      <Group style={{ marginTop: 14 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <Toggle label="Cover processing fees" description={`Adds ${money(base * 0.03, true)} so 100% reaches programs.`} value={coverFees} onChange={setCoverFees} />
        </View>
      </Group>

      <View style={{ paddingHorizontal: gutter, marginTop: 22 }}>
        <Button
          title={base > 0 ? `Continue · ${money(total, total % 1 !== 0)}${frequency === 'monthly' ? '/mo' : ''}` : 'Enter an amount'}
          variant="accent"
          disabled={base < 1}
          onPress={() => router.push({ pathname: '/checkout', params: { amount: String(total), gift: String(base), fee: String(fee), frequency, fund } })}
        />
        <View style={{ marginTop: 12 }}>
          <Notice icon="flask-outline">Demo checkout — no real payment is processed and no card details are collected.</Notice>
        </View>
      </View>

      {/* Matching campaign */}
      <View style={styles.match}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T v="headline">Season matching gift</T>
          <T v="calloutMedium" c={color.accent} tabular>
            {Math.round((matched / MATCH_GOAL) * 100)}%
          </T>
        </Row>
        <T v="caption" muted style={{ marginTop: 2, marginBottom: 12 }}>
          A local family foundation doubles every gift through Dec 31.
        </T>
        <Progress value={matched / MATCH_GOAL} height={6} />
        <T v="caption" muted style={{ marginTop: 8 }} tabular>
          {money(matched)} of {money(MATCH_GOAL)} matched
        </T>
      </View>

      <SectionHeader title="Your giving" action={signedIn && donations.length ? 'History' : undefined} onAction={() => router.push('/donations')} />
      {signedIn ? (
        <Group>
          <ListItem title="Lifetime giving" value={money(myTotal)} />
          {donations.slice(0, 3).map((d) => (
            <DonationRow key={d.id} d={d} />
          ))}
        </Group>
      ) : (
        <Group>
          <ListItem icon="person-circle-outline" title="Sign in to see your gifts" subtitle="Receipts and monthly giving in one place" onPress={() => router.push('/sign-in')} />
        </Group>
      )}
    </LargeTitleScreen>
  );
}

const styles = StyleSheet.create({
  amountCard: {
    marginTop: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.line,
  },
  currency: { fontFamily: font.display, fontSize: 28, lineHeight: 44, color: color.muted, marginTop: 6 },
  amount: { fontFamily: font.displayHeavy, fontSize: 64, lineHeight: 72, letterSpacing: -2.5, color: color.ink, padding: 0 },
  preset: {
    flex: 1,
    height: 42,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surfaceAlt,
  },
  presetOn: { backgroundColor: color.ink },
  impact: { marginTop: 18, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.line },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: color.accent },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: color.accent },
  match: {
    marginHorizontal: gutter,
    marginTop: 28,
    padding: 18,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.line,
  },
});
