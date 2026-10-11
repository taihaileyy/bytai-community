import React, { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DONATION_FUNDS } from '@/data/seed';
import type { DonationFrequency } from '@/data/types';
import { useMyActivity, useSession, useStore } from '@/store/AppStore';
import { fonts, palette, radius, shadow } from '@/theme';
import { money } from '@/utils/format';
import { FadeIn, GrowBar, PressScale } from '@/components/Motion';
import { Txt } from '@/components/Txt';
import { Button, Card, Chip, ChipRow, DemoNotice, FocusStatusBar, PageTitle, Row, Screen, SectionHeader, Segmented, ToggleRow } from '@/components/ui';
import { DonationRow } from '@/components/domain';

const PRESETS = [25, 50, 100, 250];
const IMPACT: [number, string][] = [
  [250, 'Funds a full season of STEM Lab supplies for a team of students.'],
  [100, 'Covers a safety repair, like grab bars or smoke detectors, for a senior.'],
  [50, 'Provides a week of fresh groceries for a family of four.'],
  [25, 'Stocks a homework-club snack shelf for a week.'],
  [1, 'Every dollar keeps our programs free for neighbors.'],
];
const MATCH_GOAL = 25000;

export default function Give() {
  const { state } = useStore();
  const { signedIn } = useSession();
  const { donations } = useMyActivity();
  const [frequency, setFrequency] = useState<DonationFrequency>('one-time');
  const [preset, setPreset] = useState<number | null>(50);
  const [custom, setCustom] = useState('');
  const [fund, setFund] = useState(DONATION_FUNDS[0]);
  const [coverFees, setCoverFees] = useState(true);

  const base = preset ?? (Number(custom.replace(/[^0-9.]/g, '')) || 0);
  const fee = coverFees ? Math.round(base * 0.03 * 100) / 100 : 0;
  const total = Math.round((base + fee) * 100) / 100;
  const impact = IMPACT.find(([min]) => base >= min)?.[1] ?? 'Enter an amount to see your impact.';

  // Matching campaign progress: recent gifts in the last 60 days count toward the match.
  const matched = useMemo(() => {
    const since = Date.now() - 60 * 86400000;
    return Math.min(MATCH_GOAL, 17_600 + state.donations.filter((d) => new Date(d.date).getTime() > since).reduce((s, d) => s + d.amount, 0));
  }, [state.donations]);

  const myTotal = donations.reduce((s, d) => s + d.amount, 0);

  return (
    <Screen>
      <FocusStatusBar style="dark" />
      <PageTitle eyebrow="Give" title="Fuel the good work" subtitle="Every gift keeps our programs free for the neighbors who need them." />

      <FadeIn>
        <Card style={{ backgroundColor: palette.night, borderColor: palette.night }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt variant="eyebrow" color={palette.mintBright}>
              Season matching gift
            </Txt>
            <Ionicons name="sparkles" size={18} color={palette.gold} />
          </Row>
          <Txt variant="title" color={palette.cream} style={{ marginTop: 10 }}>
            {money(matched)} <Txt variant="body" color="rgba(241,238,228,0.6)">of {money(MATCH_GOAL)} matched</Txt>
          </Txt>
          <View style={{ marginTop: 14 }}>
            <GrowBar progress={matched / MATCH_GOAL} color={palette.mint} track="rgba(241,238,228,0.12)" height={10} />
          </View>
          <Txt variant="caption" color="rgba(241,238,228,0.7)" style={{ marginTop: 10 }}>
            A local family foundation doubles every gift through year-end.
          </Txt>
        </Card>
      </FadeIn>

      <SectionHeader title="Choose your gift" />
      <Segmented
        options={[
          { value: 'one-time', label: 'One-time' },
          { value: 'monthly', label: 'Monthly' },
        ]}
        value={frequency}
        onChange={setFrequency}
      />

      <View style={styles.amounts}>
        {PRESETS.map((a) => {
          const on = preset === a;
          return (
            <PressScale
              key={a}
              haptic
              onPress={() => {
                setPreset(a);
                setCustom('');
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={[styles.amount, on && styles.amountOn]}
            >
              <Txt variant="title" color={on ? palette.cream : palette.ink}>
                ${a}
              </Txt>
              {frequency === 'monthly' ? (
                <Txt variant="caption" color={on ? 'rgba(241,238,228,0.7)' : palette.stone}>
                  per month
                </Txt>
              ) : null}
            </PressScale>
          );
        })}
      </View>

      <Row style={[styles.custom, preset === null && { borderColor: palette.green }]} gap={6}>
        <Txt variant="title" muted>
          $
        </Txt>
        <TextInput
          value={custom}
          onChangeText={(t) => {
            setCustom(t.replace(/[^0-9]/g, '').slice(0, 6));
            setPreset(null);
          }}
          onFocus={() => setPreset(null)}
          placeholder="Other amount"
          placeholderTextColor={palette.stoneLight}
          keyboardType="number-pad"
          style={styles.customInput}
          accessibilityLabel="Custom donation amount"
        />
      </Row>

      <View style={styles.impact}>
        <Ionicons name="leaf" size={18} color={palette.green} />
        <Txt variant="body" color={palette.greenDeep} style={{ flex: 1 }}>
          {base > 0 ? <Txt variant="bodyStrong" color={palette.greenDeep}>{money(base)}{frequency === 'monthly' ? '/mo' : ''}: </Txt> : null}
          {impact}
        </Txt>
      </View>

      <Txt variant="label" style={{ marginTop: 22, marginBottom: 10 }}>
        Direct my gift to
      </Txt>
      <ChipRow>
        {DONATION_FUNDS.map((f) => (
          <Chip key={f} label={f} selected={fund === f} onPress={() => setFund(f)} />
        ))}
      </ChipRow>

      <Card flat style={{ marginTop: 16, paddingVertical: 6 }}>
        <ToggleRow
          label="Cover processing fees"
          description={`Adds ${money(fee || base * 0.03, true)} so 100% of your gift goes to programs.`}
          value={coverFees}
          onChange={setCoverFees}
        />
      </Card>

      <Button
        title={base > 0 ? `Continue · ${money(total, fee % 1 !== 0)}${frequency === 'monthly' ? '/mo' : ''}` : 'Enter an amount'}
        icon="lock-closed"
        disabled={base < 1}
        style={{ marginTop: 20 }}
        onPress={() =>
          router.push({ pathname: '/checkout', params: { amount: String(total), gift: String(base), fee: String(fee), frequency, fund } })
        }
      />
      <View style={{ marginTop: 12 }}>
        <DemoNotice>Demo checkout — no real payment is processed and no card details are collected.</DemoNotice>
      </View>

      <SectionHeader eyebrow="Your giving" title="Donation history" action={signedIn && donations.length ? 'See all' : undefined} onAction={() => router.push('/donations')} />
      {signedIn ? (
        <Card>
          <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <Txt variant="caption" muted>
              Lifetime giving
            </Txt>
            <Txt variant="heading" accent>
              {money(myTotal)}
            </Txt>
          </Row>
          {donations.slice(0, 3).map((d) => (
            <DonationRow key={d.id} d={d} />
          ))}
          {!donations.length ? (
            <Txt variant="body" muted style={{ paddingVertical: 10 }}>
              Your gifts will appear here.
            </Txt>
          ) : null}
        </Card>
      ) : (
        <Card>
          <Txt variant="body" muted>
            Sign in to see your gifts, download receipts and manage monthly giving.
          </Txt>
          <Button title="Sign in" variant="secondary" size="md" icon="log-in-outline" style={{ marginTop: 14 }} onPress={() => router.push('/sign-in')} />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  amounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  amount: {
    width: '47.5%',
    flexGrow: 1,
    height: 76,
    borderRadius: radius.lg,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountOn: { backgroundColor: palette.green, borderColor: palette.green, ...shadow.card },
  custom: {
    marginTop: 10,
    height: 60,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: palette.line,
    backgroundColor: palette.card,
    paddingHorizontal: 18,
  },
  customInput: { flex: 1, fontFamily: fonts.display, fontSize: 22, color: palette.ink, height: 56 },
  impact: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: palette.mintSoft,
  },
});
