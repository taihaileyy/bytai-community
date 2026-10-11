import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

const useNative = true;

// Layout keys belong on the outer Pressable so flex/width/margins affect the
// touch target; everything visual stays on the inner animated view.
const OUTER_KEYS = new Set([
  'flex', 'flexGrow', 'flexShrink', 'flexBasis', 'width', 'minWidth', 'maxWidth', 'alignSelf',
  'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'marginHorizontal', 'marginVertical',
  'position', 'top', 'left', 'right', 'bottom', 'zIndex',
]);

function splitStyle(style: StyleProp<ViewStyle>) {
  const flat = (StyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
  const outer: Record<string, unknown> = {};
  const inner: Record<string, unknown> = {};
  for (const k of Object.keys(flat)) (OUTER_KEYS.has(k) ? outer : inner)[k] = flat[k];
  // Let the inner view fill a flexed/sized outer target.
  if (outer.flex != null || outer.flexGrow != null || outer.width != null) inner.flexGrow = 1;
  return { outer: outer as ViewStyle, inner: inner as ViewStyle };
}

/** Fades + lifts children in on mount. Use `delay` to stagger lists. */
export function FadeIn({
  children,
  delay = 0,
  distance = 10,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: useNative,
    }).start();
  }, [v, delay]);
  return (
    <Animated.View
      style={[
        style,
        { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

type PressScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean;
};

/** Pressable that gently scales down while pressed. */
export function PressScale({ children, style, scaleTo = 0.97, haptic = false, onPress, ...rest }: PressScaleProps) {
  const v = useRef(new Animated.Value(1)).current;
  const { outer, inner } = splitStyle(style);
  const to = (toValue: number) =>
    Animated.spring(v, { toValue, useNativeDriver: useNative, speed: 40, bounciness: 6 }).start();
  return (
    <Pressable
      {...rest}
      style={outer}
      onPressIn={(e) => {
        to(scaleTo);
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        to(1);
        rest.onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) Haptics.selectionAsync().catch(() => {});
        onPress?.(e);
      }}
    >
      <Animated.View style={[inner, { transform: [{ scale: v }] }]}>{children as React.ReactNode}</Animated.View>
    </Pressable>
  );
}

/** Animated number that counts up to `value`. */
export function useCountUp(value: number, duration = 1100) {
  const [display, setDisplay] = React.useState(0);
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const id = v.addListener(({ value: x }) => setDisplay(Math.round(x)));
    Animated.timing(v, { toValue: value, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    return () => v.removeListener(id);
  }, [value, duration, v]);
  return display;
}
