import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, space } from '@/theme';
import { Txt } from './Txt';
import { DemoPill, IconButton, Row } from './ui';

/** Header used across admin screens. */
export function AdminHeader({ title, eyebrow = 'Admin console', right, root }: { title: string; eyebrow?: string; right?: React.ReactNode; root?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 8, paddingHorizontal: space.xl, paddingBottom: 14, backgroundColor: palette.night }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <IconButton
          icon={root ? 'close' : 'chevron-back'}
          label={root ? 'Exit admin' : 'Back'}
          onPress={() => (router.canGoBack() ? router.back() : router.replace(root ? '/account' : '/admin'))}
        />
        <DemoPill inverse />
        <View style={{ minWidth: 40, alignItems: 'flex-end' }}>{right}</View>
      </Row>
      <Txt variant="eyebrow" accent style={{ marginTop: 18 }}>
        {eyebrow}
      </Txt>
      <Txt variant="display" style={{ marginTop: 6 }}>
        {title}
      </Txt>
    </View>
  );
}
