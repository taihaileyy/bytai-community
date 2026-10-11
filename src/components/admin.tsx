import React from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gutter, palette, radius } from '@/theme';
import { ToneProvider } from '@/theme/ToneContext';
import { T } from './Text';
import { Fleur, FocusStatusBar, NavBar, Row } from './ui';

/** Midnight shell for admin sub-pages. */
export function AdminScreen({ title, eyebrow = 'Admin', right, children, bottom }: { title: string; eyebrow?: string; right?: React.ReactNode; children: React.ReactNode; bottom?: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <ToneProvider tone="dark">
      <View style={{ flex: 1, backgroundColor: palette.midnight }}>
        <FocusStatusBar style="light" />
        <NavBar right={right} />
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: (bottom ? 120 : 48) + insets.bottom }}>
          <View style={{ paddingHorizontal: gutter, paddingBottom: 18 }}>
            <Row gap={6}>
              <Fleur size={12} />
              <T v="eyebrow" c={palette.gold}>
                {eyebrow}
              </T>
            </Row>
            <T v="display" style={{ marginTop: 6 }} accessibilityRole="header">
              {title}
            </T>
          </View>
          {children}
        </ScrollView>
        {bottom}
      </View>
    </ToneProvider>
  );
}

export function Panel({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  panel: { marginHorizontal: gutter, padding: 16, borderRadius: radius.lg, backgroundColor: palette.charcoal, borderWidth: StyleSheet.hairlineWidth, borderColor: '#33343C' },
});
