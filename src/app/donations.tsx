import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useMyActivity, useSession } from '@/store/AppStore';
import { font, palette, radius } from '@/theme';
import { ToneProvider } from '@/theme/ToneContext';
import { money } from '@/utils/format';
import { T } from '@/components/Text';
import { BottomBar, Button, Divider, EmptyState, Row, Screen } from '@/components/ui';
import { DonationRow } from '@/components/domain';

export default function Donations() {
  return (
    <ToneProvider tone="light">
      <Body />
    </ToneProvider>
  );
}

function Body() {
  const { signedIn } = useSession();
  const { donations } = useMyActivity();
  const total = donations.reduce((s, d) => s + d.amount, 0);
  const monthly = donations.find((d) => d.frequency === 'monthly');
  const year = donations.filter((d) => new Date(d.date).getFullYear() === new Date().getFullYear()).reduce((s, d) => s + d.amount, 0);
  return (
    <Screen title="My Donations" bottom={signedIn ? <BottomBar><Button title="Give Again" variant="gold" icon="heart" onPress={() => router.navigate('/give')} /></BottomBar> : undefined}>
      {!signedIn ? (
        <EmptyState icon="heart-outline" title="Sign in to see your gifts" body="Your donation history and receipts live in your profile." action="Sign in" onAction={() => router.push('/sign-in')} />
      ) : (
        <>
          <View style={styles.hero}>
            <T v="eyebrow" c={palette.gold}>
              Lifetime giving
            </T>
            <T style={{ fontFamily: font.serif, fontSize: 44, lineHeight: 50, color: palette.ivory, marginTop: 6 }} tabular>
              {money(total)}
            </T>
            <Row style={{ marginTop: 14, gap: 24 }}>
              <View>
                <T v="headline" c={palette.ivory}>
                  {money(year)}
                </T>
                <T v="caption" c="#B3ADA3">
                  This year
                </T>
              </View>
              <View>
                <T v="headline" c={palette.ivory}>
                  {monthly ? `${money(monthly.amount)}/mo` : '—'}
                </T>
                <T v="caption" c="#B3ADA3">
                  Monthly gift
                </T>
              </View>
              <View>
                <T v="headline" c={palette.ivory}>
                  {donations.length}
                </T>
                <T v="caption" c="#B3ADA3">
                  Gifts
                </T>
              </View>
            </Row>
          </View>
          <T v="eyebrow" muted style={{ marginTop: 24, marginBottom: 10, marginLeft: 2 }}>
            Receipts
          </T>
          <View style={styles.list}>
            {donations.length ? (
              donations.map((d, i) => (
                <View key={d.id}>
                  {i > 0 ? <Divider inset={64} /> : null}
                  <DonationRow d={d} />
                  <T v="caption" muted style={{ marginTop: -8, marginBottom: 12, marginLeft: 64 }}>
                    Receipt {d.receipt}
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
  hero: { padding: 20, borderRadius: radius.xl, backgroundColor: palette.midnight, marginTop: 8 },
  list: { borderRadius: radius.lg, backgroundColor: palette.paper, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E3D8C6', overflow: 'hidden' },
});
