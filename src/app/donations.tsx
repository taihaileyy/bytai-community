import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useMyActivity, useSession } from '@/store/AppStore';
import { color, radius } from '@/theme';
import { money } from '@/utils/format';
import { T } from '@/components/Text';
import { BottomBar, Button, Divider, EmptyState, Screen } from '@/components/ui';
import { DonationRow, Stat, StatStrip } from '@/components/domain';

export default function Donations() {
  const { signedIn } = useSession();
  const { donations } = useMyActivity();
  const total = donations.reduce((s, d) => s + d.amount, 0);
  const monthly = donations.find((d) => d.frequency === 'monthly');
  const year = donations.filter((d) => new Date(d.date).getFullYear() === new Date().getFullYear()).reduce((s, d) => s + d.amount, 0);

  return (
    <Screen
      title="Giving history"
      bottom={signedIn ? <BottomBar><Button title="Make a gift" variant="accent" icon="heart" onPress={() => router.navigate('/give')} /></BottomBar> : undefined}
    >
      {!signedIn ? (
        <EmptyState icon="heart-outline" title="Sign in to see your gifts" body="Your donation history and receipts live in your profile." action="Sign in" onAction={() => router.push('/sign-in')} />
      ) : (
        <>
          <View style={{ paddingVertical: 20 }}>
            <T v="overline" muted>
              Lifetime giving
            </T>
            <T v="largeTitle" style={{ fontSize: 40, lineHeight: 46, marginTop: 4 }} tabular>
              {money(total)}
            </T>
          </View>
          <View style={styles.card}>
            <StatStrip>
              <Stat value={Math.round(year)} prefix="$" label="This year" />
              <Stat value={monthly?.amount ?? 0} prefix="$" label="Monthly gift" />
              <Stat value={donations.length} label="Gifts" />
            </StatStrip>
          </View>
          <T v="overline" muted style={{ marginTop: 28, marginBottom: 8, marginLeft: 4 }}>
            Receipts
          </T>
          <View style={[styles.card, { padding: 0 }]}>
            {donations.length ? (
              donations.map((d, i) => (
                <View key={d.id}>
                  {i > 0 ? <Divider inset={64} /> : null}
                  <DonationRow d={d} />
                  <T v="caption" c={color.faint} style={{ marginTop: -8, marginBottom: 12, marginLeft: 64 }}>
                    {d.receipt}
                  </T>
                </View>
              ))
            ) : (
              <EmptyState icon="heart-outline" title="No gifts yet" body="Your first gift will show up here." />
            )}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: radius.lg, backgroundColor: color.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: color.line },
});
