import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font, palette } from '@/theme';
import { PressScale } from './Motion';
import { T } from './Text';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export const TABS: Record<string, { label: string; icon: IconName; active: IconName }> = {
  index: { label: 'Home', icon: 'home-outline', active: 'home' },
  programs: { label: 'Programs', icon: 'grid-outline', active: 'grid' },
  events: { label: 'Events', icon: 'calendar-outline', active: 'calendar' },
  give: { label: 'Give', icon: 'heart-outline', active: 'heart' },
  account: { label: 'More', icon: 'person-circle-outline', active: 'person-circle' },
};

type Props = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean }; navigate: (name: string) => void };
  badges?: Record<string, number | undefined>;
};

/** Midnight bottom bar with champagne-gold active state. */
export function TabBar({ state, navigation, badges = {} }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]} accessibilityRole="tablist">
      {state.routes.map((route, i) => {
        const meta = TABS[route.name];
        if (!meta) return null;
        const focused = state.index === i;
        const onPress = () => {
          const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
        };
        return <TabItem key={route.key} meta={meta} focused={focused} onPress={onPress} badge={badges[route.name]} />;
      })}
    </View>
  );
}

function TabItem({ meta, focused, onPress, badge }: { meta: (typeof TABS)[string]; focused: boolean; onPress: () => void; badge?: number }) {
  const v = useRef(new Animated.Value(focused ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(v, { toValue: focused ? 1 : 0, useNativeDriver: true, speed: 18, bounciness: 10 }).start();
  }, [focused, v]);
  const color = focused ? palette.gold : '#8E8A83';
  return (
    <PressScale haptic onPress={onPress} scaleTo={0.9} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={badge ? `${meta.label}, ${badge} new` : meta.label} style={styles.item}>
      <Animated.View style={{ transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) }, { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }}>
        <Ionicons name={focused ? meta.active : meta.icon} size={22} color={color} />
        {badge ? <View style={styles.badge} /> : null}
      </Animated.View>
      <T style={{ fontSize: 10.5, lineHeight: 13, marginTop: 4, color, fontFamily: focused ? font.textSemi : font.textMedium }}>{meta.label}</T>
      <Animated.View style={[styles.indicator, { opacity: v }]} />
    </PressScale>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: palette.midnight, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#2A2B31', paddingTop: 10, paddingHorizontal: 6 },
  item: { flex: 1, alignItems: 'center' },
  badge: { position: 'absolute', top: -1, right: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.gold, borderWidth: 1.5, borderColor: palette.midnight },
  indicator: { marginTop: 5, width: 18, height: 2, borderRadius: 1, backgroundColor: palette.gold },
});
