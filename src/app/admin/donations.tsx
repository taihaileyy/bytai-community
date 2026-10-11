import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useStore } from '@/store/AppStore';
import { gutter } from '@/theme';
import { compact, money, monthShort } from '@/utils/format';
import { DONATION_FUNDS } from '@/data/seed';
import { T } from '@/components/Text';
import { Button, Group, Pill, PillRow, Row, SectionHeader, Segmented } from '@/components/ui';
import { BarChart, DonationRow, RankedBars } from '@/components/domain';
import { AdminScreen, Panel } from '@/components/admin';

type Freq = 'all' | 'one-time' | 'monthly';

export default function Reporting() {
  const { state } = useStore();
  const [freq, setFreq] = useState<Freq>('all');
  const [fund, setFund] = useState('All funds');
  const [limit, setLimit] = useState(12);
  const list = useMemo(() => state.donations.filter((d) => (freq === 'all' || d.frequency === freq) && (fund === 'All funds' || d.fund === fund)), [state.donations, freq, fund]);
  const total = list.reduce((s, d) => s + d.amount, 0);
  const byMonth = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)).map((m) => ({
      label: monthShort(m.toISOString()),
      value: list.filter((d) => new Date(d.date).getMonth() === m.getMonth() && new Date(d.date).getFullYear() === m.getFullYear()).reduce((s, d) => s + d.amount, 0),
    }));
  }, [list]);
  const funds = useMemo(
    () => Object.entries(state.donations.reduce<Record<string, number>>((a, d) => ({ ...a, [d.fund]: (a[d.fund] ?? 0) + d.amount }), {})).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value),
    [state.donations],
  );

  return (
    <AdminScreen title="Reporting" eyebrow="Donations">
      <View style={{ paddingHorizontal: gutter }}>
        <Segmented options={[{ value: 'all', label: 'All' }, { value: 'one-time', label: 'One-time' }, { value: 'monthly', label: 'Monthly' }]} value={freq} onChange={setFreq} />
      </View>
      <PillRow style={{ marginTop: 12 }}>
        {['All funds', ...DONATION_FUNDS].map((f) => (
          <Pill key={f} label={f} selected={fund === f} onPress={() => setFund(f)} />
        ))}
      </PillRow>
      <Panel style={{ marginTop: 16 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          {[
            [money(total), 'Total'],
            [String(list.length), 'Gifts'],
            [money(list.length ? Math.round(total / list.length) : 0), 'Average'],
          ].map(([v, l]) => (
            <View key={l}>
              <T v="stat" style={{ fontSize: 22 }} tabular>
                {v}
              </T>
              <T v="caption" muted>
                {l}
              </T>
            </View>
          ))}
        </Row>
      </Panel>
      <SectionHeader title="Last Six Months" />
      <Panel>
        <BarChart data={byMonth} format={(n) => `$${compact(n)}`} />
      </Panel>
      <SectionHeader title="Giving by Fund" />
      <Panel>
        <RankedBars data={funds} format={(n) => money(n)} />
      </Panel>
      <SectionHeader title="Recent Gifts" />
      <Group>
        {list.slice(0, limit).map((d) => (
          <DonationRow key={d.id} d={d} showDonor />
        ))}
      </Group>
      {limit < list.length ? <Button title={`Show ${Math.min(12, list.length - limit)} more`} variant="ghost" onPress={() => setLimit(limit + 12)} style={{ marginTop: 6 }} /> : null}
      <T v="caption" muted center style={{ marginTop: 10 }}>
        Simulated donations · no real payments
      </T>
    </AdminScreen>
  );
}
