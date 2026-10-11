import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useActions, useSession } from '@/store/AppStore';
import type { DonationFrequency } from '@/data/types';
import type { ChargeRequest } from '@/services/payments';
import { color, font, radius } from '@/theme';
import { money } from '@/utils/format';
import { T } from '@/components/Text';
import { BottomBar, Button, Divider, Group, ListItem, Notice, Row, Screen, Tag, type IconName } from '@/components/ui';

const METHODS: { id: ChargeRequest['method']; icon: IconName; title: string; sub: string }[] = [
  { id: 'apple-pay', icon: 'logo-apple', title: 'Apple Pay / Google Pay', sub: 'Simulated wallet' },
  { id: 'card', icon: 'card-outline', title: 'Demo card •••• 4242', sub: 'Test card, never charged' },
  { id: 'bank', icon: 'business-outline', title: 'Bank transfer', sub: 'Simulated ACH' },
];

export default function Checkout() {
  const params = useLocalSearchParams<{ amount: string; gift?: string; fee?: string; frequency: DonationFrequency; fund: string }>();
  const amount = Number(params.amount) || 0;
  const gift = Number(params.gift) || amount;
  const fee = Number(params.fee) || 0;
  const frequency: DonationFrequency = params.frequency === 'monthly' ? 'monthly' : 'one-time';
  const fund = params.fund ?? 'Where needed most';
  const { member } = useSession();
  const actions = useActions();
  const [method, setMethod] = useState<ChargeRequest['method']>('apple-pay');
  const [busy, setBusy] = useState(false);
  const cents = amount % 1 !== 0;

  const pay = async () => {
    setBusy(true);
    const result = await actions.donate({ amount, frequency, fund, method });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.replace({
      pathname: '/confirm',
      params: {
        kind: 'donation',
        title: 'Thank you',
        subtitle: `${money(amount, cents)}${frequency === 'monthly' ? ' every month' : ''} to ${fund}`,
        detail: member ? 'A receipt is saved in your profile.' : 'Sign in next time to keep track of your gifts.',
        code: result.receipt,
        note: 'This was a simulated payment for demonstration. No money moved.',
        photo: 'family',
      },
    });
  };

  const rows: [string, string][] = [
    ['Designation', fund],
    ['Frequency', frequency === 'monthly' ? 'Monthly' : 'One-time'],
    ['Donor', member?.name ?? 'Guest'],
    ...(fee ? ([['Gift', money(gift)], ['Fees covered', money(fee, true)]] as [string, string][]) : []),
    ['Foundation match', `+${money(gift)}`],
  ];

  return (
    <Screen
      title="Checkout"
      close
      right={<Tag label="Demo" tone="warn" />}
      bottom={
        <BottomBar>
          <Button title={busy ? 'Processing…' : `Give ${money(amount, cents)}`} variant="accent" icon="lock-closed" loading={busy} onPress={pay} />
          <Row gap={6} style={{ justifyContent: 'center', marginTop: 10 }}>
            <Ionicons name="shield-checkmark-outline" size={13} color={color.muted} />
            <T v="caption" muted>
              Simulated checkout · no payment is processed
            </T>
          </Row>
        </BottomBar>
      }
    >
      <View style={{ alignItems: 'center', paddingVertical: 24 }}>
        <T v="overline" muted>
          Your gift
        </T>
        <T style={styles.amount} tabular>
          {money(amount, cents)}
        </T>
        {frequency === 'monthly' ? (
          <T v="callout" muted>
            per month · cancel anytime
          </T>
        ) : null}
      </View>

      <View style={styles.summary}>
        {rows.map(([k, v], i) => (
          <View key={k}>
            {i > 0 ? <Divider /> : null}
            <Row style={{ justifyContent: 'space-between', paddingVertical: 12 }}>
              <T v="callout" muted>
                {k}
              </T>
              <T v="calloutMedium" tabular>
                {v}
              </T>
            </Row>
          </View>
        ))}
      </View>

      <T v="overline" muted style={{ marginTop: 28, marginBottom: 8, marginLeft: 4 }}>
        Payment method
      </T>
      <Group style={{ marginHorizontal: 0 }}>
        {METHODS.map((m) => {
          const on = method === m.id;
          return (
            <ListItem
              key={m.id}
              icon={m.icon}
              title={m.title}
              subtitle={m.sub}
              onPress={() => setMethod(m.id)}
              accessibilityLabel={`${m.title}, ${m.sub}${on ? ', selected' : ''}`}
              trailing={<View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>}
            />
          );
        })}
      </Group>

      <View style={{ marginTop: 16 }}>
        <Notice icon="flask-outline">
          This prototype never asks for real card numbers. A production build would use a secure processor such as Stripe.
        </Notice>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  amount: { fontFamily: font.displayHeavy, fontSize: 48, lineHeight: 56, letterSpacing: -1.8, color: color.ink, marginTop: 6 },
  summary: { paddingHorizontal: 16, borderRadius: radius.lg, backgroundColor: color.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: color.line },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: color.accent },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: color.accent },
});
