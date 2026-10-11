import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useActions, useSession } from '@/store/AppStore';
import type { DonationFrequency } from '@/data/types';
import type { ChargeRequest } from '@/services/payments';
import { palette, radius, space } from '@/theme';
import { money } from '@/utils/format';
import { PressScale } from '@/components/Motion';
import { Txt } from '@/components/Txt';
import { AppHeader, Button, Card, DemoNotice, Divider, FocusStatusBar, Row, Screen, type IconName } from '@/components/ui';

const METHODS: { id: ChargeRequest['method']; icon: IconName; title: string; sub: string }[] = [
  { id: 'apple-pay', icon: 'logo-apple', title: 'Apple Pay / Google Pay', sub: 'Simulated wallet' },
  { id: 'card', icon: 'card-outline', title: 'Demo card •••• 4242', sub: 'Test card, never charged' },
  { id: 'bank', icon: 'business-outline', title: 'Bank transfer (ACH)', sub: 'Simulated' },
];

export default function Checkout() {
  const params = useLocalSearchParams<{ amount: string; gift?: string; fee?: string; frequency: DonationFrequency; fund: string }>();
  const amount = Number(params.amount) || 0;
  const gift = Number(params.gift) || amount;
  const fee = Number(params.fee) || 0;
  const frequency = params.frequency === 'monthly' ? 'monthly' : 'one-time';
  const fund = params.fund ?? 'Where needed most';
  const { member } = useSession();
  const actions = useActions();
  const [method, setMethod] = useState<ChargeRequest['method']>('apple-pay');
  const [busy, setBusy] = useState(false);

  const pay = async () => {
    setBusy(true);
    const result = await actions.donate({ amount, frequency, fund, method });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.replace({
      pathname: '/confirm',
      params: {
        kind: 'donation',
        title: 'Thank you!',
        subtitle: `${money(amount, amount % 1 !== 0)}${frequency === 'monthly' ? ' every month' : ''} to ${fund}`,
        detail: member ? `A receipt is saved in your member portal.` : 'Sign in next time to keep track of your gifts.',
        code: result.receipt,
        note: 'This was a simulated payment for demonstration. No money moved.',
      },
    });
  };

  return (
    <Screen header={<AppHeader title="Checkout" close />}>
      <FocusStatusBar style="dark" />
      <View style={styles.demoBanner}>
        <Ionicons name="flask" size={18} color={palette.cream} />
        <Txt variant="label" color={palette.cream} style={{ flex: 1 }}>
          DEMO CHECKOUT · No real payment will be processed
        </Txt>
      </View>

      <Card style={{ marginTop: 16 }}>
        <Txt variant="eyebrow" accent>
          Your gift
        </Txt>
        <Txt variant="hero" style={{ marginTop: 8 }}>
          {money(amount, amount % 1 !== 0)}
          <Txt variant="title" muted>
            {frequency === 'monthly' ? ' /month' : ''}
          </Txt>
        </Txt>
        <Divider style={{ marginVertical: 14 }} />
        {[
          ['Designation', fund],
          ['Frequency', frequency === 'monthly' ? 'Monthly, cancel anytime' : 'One-time'],
          ['Donor', member?.name ?? 'Guest'],
          ...(fee ? [['Gift', money(gift)], ['Fees you’re covering', money(fee, true)]] : []),
          ['Matched by foundation', `+${money(gift)}`],
        ].map(([k, v]) => (
          <Row key={k} style={{ justifyContent: 'space-between', paddingVertical: 5 }}>
            <Txt variant="body" muted>
              {k}
            </Txt>
            <Txt variant="bodyStrong">{v}</Txt>
          </Row>
        ))}
      </Card>

      <Txt variant="label" style={{ marginTop: 24, marginBottom: 10 }}>
        Payment method
      </Txt>
      {METHODS.map((m) => {
        const on = method === m.id;
        return (
          <PressScale key={m.id} haptic onPress={() => setMethod(m.id)} accessibilityRole="radio" accessibilityState={{ checked: on }} style={[styles.method, on && styles.methodOn]}>
            <Ionicons name={m.icon} size={22} color={palette.ink} />
            <View style={{ flex: 1 }}>
              <Txt variant="bodyStrong">{m.title}</Txt>
              <Txt variant="caption" muted>
                {m.sub}
              </Txt>
            </View>
            <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
          </PressScale>
        );
      })}

      <View style={{ marginTop: 14 }}>
        <DemoNotice>
          This prototype never asks for real card numbers. In a production build, payments would run through a secure
          processor such as Stripe.
        </DemoNotice>
      </View>

      <Button title={busy ? 'Processing…' : `Complete demo donation`} icon="lock-closed" loading={busy} onPress={pay} style={{ marginTop: 22 }} />
      <Row gap={6} style={{ justifyContent: 'center', marginTop: 12 }}>
        <Ionicons name="shield-checkmark-outline" size={14} color={palette.stone} />
        <Txt variant="caption" muted>
          Simulated · Secure checkout preview
        </Txt>
      </Row>
    </Screen>
  );
}

const styles = StyleSheet.create({
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: palette.night,
    padding: 14,
    borderRadius: radius.md,
  },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: palette.line,
    backgroundColor: palette.card,
    marginBottom: 10,
  },
  methodOn: { borderColor: palette.green, backgroundColor: '#F7FBF8' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: palette.stoneLight, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: palette.green },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: palette.green },
});
