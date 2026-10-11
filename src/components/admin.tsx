import React from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, gutter, radius } from '@/theme';
import { T } from './Text';
import { DemoBadge, FocusStatusBar, NavBar, Row } from './ui';

/** Shared shell for admin screens: nav bar, "Admin console" overline, large title. */
export function AdminScreen({
  title,
  eyebrow = 'Admin console',
  right,
  root,
  children,
  bottom,
}: {
  title: string;
  eyebrow?: string;
  right?: React.ReactNode;
  root?: boolean;
  children: React.ReactNode;
  bottom?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <FocusStatusBar style="dark" />
      <NavBar close={root} right={right ?? <DemoBadge />} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: (bottom ? 120 : 48) + insets.bottom }}
      >
        <View style={{ paddingHorizontal: gutter, paddingTop: 4, paddingBottom: 18 }}>
          <Row gap={6}>
            <View style={styles.adminDot} />
            <T v="overline" muted>
              {eyebrow}
            </T>
          </Row>
          <T v="largeTitle" style={{ marginTop: 6 }} accessibilityRole="header">
            {title}
          </T>
        </View>
        {children}
      </ScrollView>
      {bottom}
    </View>
  );
}

export function Panel({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  adminDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: color.ink },
  panel: {
    marginHorizontal: gutter,
    padding: 18,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.line,
  },
});
