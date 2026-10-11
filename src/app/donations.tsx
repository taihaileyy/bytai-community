import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useMyActivity, useSession } from '@/store/AppStore';
import { palette } from '@/theme';
import { money } from '@/utils/format';
import { Txt } from '@/components/Txt';
import { AppHeader, Button, Card, Divider, EmptyState, FocusStatusBar, Row, Screen } from '@/components/ui';
import { DonationRow } from '@/components/domain';

export default function Donations() {
  const { signedIn } = useSession();
  const { donations } = useMyActivity();
  const total = donations.reduce((s, d) => s + d.amount, 0);
  const monthly = donations.filter((d) => d.frequency === 'monthly');
  const activeMonthly = monthly[0];

  return (
    <Screen header={<AppHeader title="Giving history" />}>
      <FocusStatusBar style="dark" />
      {!signedIn ? (
        <EmptyState icon="heart-outline" title="Sign in to see your gifts" body="Your donation history and receipts live in the member portal." action="Sign in" onAction={() => router.push('/sign-in')} />
      ) : (
        <>
          <Row gap={10}>
            <Card style={{ flex: 1, backgroundColor: palette.night, borderColor: palette.night }}>
              <Txt variant="caption" color="rgba(241,238,228,0.65)">
                Lifetime giving
              </Txt>
              <Txt variant="display" color={palette.cream} style={{ marginTop: 4 }}>
                {money(total)}
              </Txt>
            </Card>
            <Card style={{ flex: 1 }}>
              <Txt variant="caption" muted>
                Monthly gift
              </Txt>
              <Txt variant="display" style={{ marginTop: 4 }}>
                {activeMonthly ? money(activeMonthly.amount) : '—'}
              </Txt>
            </Card>
          </Row>
          <Card style={{ marginTop: 14, paddingVertical: 4 }}>
            {donations.length ? (
              donations.map((d, i) => (
                <View key={d.id}>
                  {i > 0 ? <Divider /> : null}
                  <DonationRow d={d} />
                  <Txt variant="caption" muted style={{ marginTop: -8, marginBottom: 10, marginLeft: 50, fontSize: 11 }}>
                    Receipt {d.receipt}
                  </Txt>
                </View>
              ))
            ) : (
              <EmptyState icon="heart-outline" title="No gifts yet" body="Your first gift will show up here." />
            )}
          </Card>
          <Button title="Make a gift" icon="heart" style={{ marginTop: 18 }} onPress={() => router.navigate('/give')} />
        </>
      )}
    </Screen>
  );
}
