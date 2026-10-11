import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Place } from '@/data/places';
import { font, palette } from '@/theme';
import { PressScale } from './Motion';
import { T } from './Text';

const W = 100;
const H = 80;

/** Deterministic street grid: a few rotated blocks of parallel lines. */
function useStreets() {
  return useMemo(() => {
    const blocks = [
      { cx: 30, cy: 40, rot: -12, n: 14, len: 46, gap: 3.2 },
      { cx: 30, cy: 40, rot: 78, n: 12, len: 40, gap: 3.6 },
      { cx: 68, cy: 34, rot: 24, n: 12, len: 40, gap: 3.4 },
      { cx: 68, cy: 34, rot: 114, n: 10, len: 34, gap: 3.8 },
      { cx: 50, cy: 18, rot: 4, n: 9, len: 52, gap: 3 },
      { cx: 50, cy: 18, rot: 94, n: 14, len: 22, gap: 4 },
      { cx: 62, cy: 70, rot: -20, n: 6, len: 36, gap: 3 },
      { cx: 62, cy: 70, rot: 70, n: 8, len: 16, gap: 4 },
    ];
    return blocks;
  }, []);
}

/**
 * Illustrated New Orleans map (not to scale): Lake Pontchartrain, the river
 * crescent, a gold street grid and neighborhood labels. Markers are native
 * views on top so they're easy to tap and accessible.
 */
export function NolaMap({ places, selected, onSelect, height = 330 }: { places: Place[]; selected?: string; onSelect: (id: string) => void; height?: number }) {
  const streets = useStreets();
  return (
    <View style={{ height, backgroundColor: '#14161B', overflow: 'hidden' }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1C2433" />
            <Stop offset="1" stopColor="#171C26" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={W} height={H} fill="#14161B" />
        {/* Lake Pontchartrain */}
        <Path d="M0 0 H100 V7 C 88 10, 76 6, 64 9 S 40 11, 28 8 S 8 10, 0 7 Z" fill="url(#lake)" />
        {/* Street grid */}
        <G stroke={palette.gold} strokeOpacity={0.16} strokeWidth={0.22}>
          {streets.map((b, bi) => (
            <G key={bi} transform={`rotate(${b.rot} ${b.cx} ${b.cy})`}>
              {Array.from({ length: b.n }, (_, i) => {
                const off = (i - (b.n - 1) / 2) * b.gap;
                return <Line key={i} x1={b.cx - b.len / 2} y1={b.cy + off} x2={b.cx + b.len / 2} y2={b.cy + off} />;
              })}
            </G>
          ))}
        </G>
        {/* Major roads */}
        <G stroke={palette.gold} strokeOpacity={0.42} strokeWidth={0.5} fill="none">
          <Path d="M -2 34 C 20 30, 40 36, 58 30 S 88 22, 102 26" />
          <Path d="M 18 70 C 26 52, 34 38, 40 14" />
          <Path d="M 50 50 C 60 40, 72 30, 92 12" />
        </G>
        {/* Mississippi River crescent */}
        <Path d="M -4 52 C 14 70, 38 78, 54 62 S 76 40, 104 58" stroke="#22324A" strokeWidth={6.5} fill="none" strokeLinecap="round" />
        <Path d="M -4 52 C 14 70, 38 78, 54 62 S 76 40, 104 58" stroke="#2B3F5C" strokeWidth={0.4} fill="none" />
        {/* Labels */}
        <G fill="#8E8A83" fontFamily={font.textSemi} fontSize={2.3} letterSpacing={0.5}>
          <SvgText x="52" y="16">GENTILLY</SvgText>
          <SvgText x="76" y="36">BYWATER</SvgText>
          <SvgText x="14" y="64">CENTRAL</SvgText>
          <SvgText x="16" y="67">CITY</SvgText>
          <SvgText x="66" y="73">ALGIERS</SvgText>
          <SvgText x="18" y="28">MID-CITY</SvgText>
        </G>
        <SvgText x="40" y="40" fill="#C9C2B4" fontFamily={font.serif} fontSize={5}>
          New Orleans
        </SvgText>
        <SvgText x="6" y="5" fill="#5C6577" fontFamily={font.text} fontSize={2.2} letterSpacing={0.4}>
          LAKE PONTCHARTRAIN
        </SvgText>
      </Svg>

      {places.map((p) => (
        <Marker key={p.id} place={p} selected={p.id === selected} onPress={() => onSelect(p.id)} />
      ))}

      <View style={styles.label} pointerEvents="none">
        <T v="caption" c={palette.ivory} style={{ fontSize: 10, letterSpacing: 0.4 }}>
          Demo map · illustrative, fictional locations
        </T>
      </View>
    </View>
  );
}

function Marker({ place, selected, onPress }: { place: Place; selected: boolean; onPress: () => void }) {
  const v = useRef(new Animated.Value(selected ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(v, { toValue: selected ? 1 : 0, useNativeDriver: true, speed: 16, bounciness: 12 }).start();
  }, [selected, v]);
  const size = 30;
  return (
    <View style={{ position: 'absolute', left: `${place.x * 100}%`, top: `${place.y * 100}%`, marginLeft: -size / 2, marginTop: -size - 6, zIndex: selected ? 2 : 1 }}>
      <PressScale onPress={onPress} haptic hitSlop={8} accessibilityRole="button" accessibilityLabel={`${place.name}, ${place.miles} miles`} accessibilityState={{ selected }}>
        <Animated.View style={{ alignItems: 'center', transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) }, { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }] }}>
          <View style={[styles.pin, { width: size, height: size, borderRadius: size / 2 }, selected && styles.pinOn]}>
            <MaterialCommunityIcons name="fleur-de-lis" size={16} color={palette.midnight} />
          </View>
          <View style={styles.tip} />
        </Animated.View>
      </PressScale>
    </View>
  );
}

const styles = StyleSheet.create({
  pin: { backgroundColor: palette.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#1A1B20', shadowColor: palette.gold, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  pinOn: { borderColor: palette.ivory },
  tip: { width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: palette.gold, marginTop: -1 },
  label: { position: 'absolute', right: 10, bottom: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: 'rgba(16,17,21,0.75)' },
});
