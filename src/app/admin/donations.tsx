import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useStore } from '@/store/AppStore';
import { money } from '@/utils/format';
import { Txt } from '@/components/Txt';
import { Card, Chip, ChipRow, Divider, FocusStatusBar, Row, Screen, Segmented } from '@/components/ui';
import { DonationRow } from '@/components/domain';
import { AdminHeader } from '@/components/admin';
import { DONATION_FUNDS } from '@/data/seed';

type Freq = 'all' | 'one-time' | 'monthly';

export default function AdminDonations() {
  const { state } = useStore();
  const [freq, setFreq] = useState<Freq>('all');
  const [fund, setFund] = useState<string>('All funds');
  const [limit, setLimit] = useState(20);

  const list = useMemo(
    () => state.donations.filter((d) => (freq === 'all' || d.frequency === freq) && (fund === 'All funds' || d.fund === fund)),
    [state.donations, freq, fund],
  );
  const total = list.reduce((s, d) => s + d.amount, 0);
  const avg = list.length ? total / list.length : 0;

  return (
    <Screen header={<AdminHeader title="Donations" eyebrow="Fundraising" />}>
      <FocusStatusBar style="light" />
      <Segmented
        options={[
          { value: 'all', label: 'All' },
          { value: 'one-time', label: 'One-time' },
          { value: 'monthly', label: 'Monthly' },
        ]}
        value={freq}
        onChange={setFreq}
      />
      <View style={{ height: 12 }} />
      <ChipRow>
        {['All funds', ...DONATION_FUNDS].map((f) => (
          <Chip key={f} label={f} selected={fund === f} onPress={() => setFund(f)} />
        ))}
      </ChipRow>
      <Row gap={10} style={{ marginTop: 16 }}>
        {[
          ['Total', money(total)],
          ['Gifts', String(list.length)],
          ['Average', money(Math.round(avg))],
        ].map(([k, v]) => (
          <Card key={k} flat style={{ flex: 1, padding: 14 }}>
            <Txt variant="caption" muted>
              {k}
            </Txt>
            <Txt variant="heading" style={{ marginTop: 4 }}>
              {v}
            </Txt>
          </Card>
        ))}
      </Row>
      <Card style={{ marginTop: 14, paddingVertical: 4 }} flat>
        {list.slice(0, limit).map((d, i) => (
          <View key={d.id}>
            {i > 0 ? <Divider /> : null}
            <DonationRow d={d} showDonor />
          </View>
        ))}
      </Card>
      {limit < list.length ? (
        <Chip label={`Show ${Math.min(20, list.length - limit)} more`} onPress={() => setLimit(limit + 20)} />
      ) : null}
      <Txt variant="caption" muted center style={{ marginTop: 14 }}>
        Simulated donations · no real payments
      </Txt>
    </Screen>
  );
}
