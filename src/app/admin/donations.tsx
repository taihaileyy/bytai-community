import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useStore } from '@/store/AppStore';
import { gutter } from '@/theme';
import { money } from '@/utils/format';
import { DONATION_FUNDS } from '@/data/seed';
import { T } from '@/components/Text';
import { Button, Chip, ChipRow, Group, Segmented } from '@/components/ui';
import { DonationRow, Stat, StatStrip } from '@/components/domain';
import { AdminScreen, Panel } from '@/components/admin';

type Freq = 'all' | 'one-time' | 'monthly';

export default function AdminDonations() {
  const { state } = useStore();
  const [freq, setFreq] = useState<Freq>('all');
  const [fund, setFund] = useState('All funds');
  const [limit, setLimit] = useState(15);
  const list = useMemo(() => state.donations.filter((d) => (freq === 'all' || d.frequency === freq) && (fund === 'All funds' || d.fund === fund)), [state.donations, freq, fund]);
  const total = list.reduce((s, d) => s + d.amount, 0);

  return (
    <AdminScreen title="Donations" eyebrow="Fundraising">
      <View style={{ paddingHorizontal: gutter }}>
        <Segmented
          options={[
            { value: 'all', label: 'All' },
            { value: 'one-time', label: 'One-time' },
            { value: 'monthly', label: 'Monthly' },
          ]}
          value={freq}
          onChange={setFreq}
        />
      </View>
      <ChipRow style={{ marginTop: 12 }}>
        {['All funds', ...DONATION_FUNDS].map((f) => (
          <Chip key={f} label={f} selected={fund === f} onPress={() => setFund(f)} />
        ))}
      </ChipRow>
      <Panel style={{ marginTop: 18 }}>
        <StatStrip>
          <Stat value={total} prefix="$" label="Total" />
          <Stat value={list.length} label="Gifts" />
          <Stat value={list.length ? Math.round(total / list.length) : 0} prefix="$" label="Average" />
        </StatStrip>
      </Panel>
      <Group style={{ marginTop: 14 }}>
        {list.slice(0, limit).map((d) => (
          <DonationRow key={d.id} d={d} showDonor />
        ))}
      </Group>
      {limit < list.length ? (
        <Button title={`Show ${Math.min(15, list.length - limit)} more`} variant="tertiary" onPress={() => setLimit(limit + 15)} style={{ marginTop: 6 }} />
      ) : null}
      <T v="caption" muted center style={{ marginTop: 12 }}>
        Simulated donations · {money(state.donations.reduce((s, d) => s + d.amount, 0))} recorded in total
      </T>
    </AdminScreen>
  );
}
