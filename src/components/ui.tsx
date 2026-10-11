/**
 * UI kit for the New Orleans design. Every component reads the active tone
 * (ivory or midnight) from ToneProvider, so the same pieces work on both.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
  type LayoutChangeEvent,
  type ScrollViewProps,
  type StyleProp,
  type TextInputProps,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font, gutter, palette, radius, shadow } from '@/theme';
import { useScheme } from '@/theme/ToneContext';
import type { PhotoKey } from '@/data/photos';
import { initials } from '@/utils/format';
import { PressScale } from './Motion';
import { Photo } from './Photo';
import { T } from './Text';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];
export const hairline = StyleSheet.hairlineWidth;

/* ───────────────────────── Basics ───────────────────────── */

export function FocusStatusBar({ style }: { style: 'light' | 'dark' }) {
  const focused = useIsFocused();
  return focused ? <StatusBar style={style} /> : null;
}

export const Row = ({ children, style, gap = 8, ...rest }: ViewProps & { gap?: number }) => (
  <View {...rest} style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>
    {children}
  </View>
);

export function Divider({ inset = 0, style }: { inset?: number; style?: StyleProp<ViewStyle> }) {
  const s = useScheme();
  return <View style={[{ height: hairline, backgroundColor: s.line, marginLeft: inset }, style]} />;
}

/** Gold fleur-de-lis accent. */
export const Fleur = ({ size = 18, color = palette.gold }: { size?: number; color?: string }) => (
  <MaterialCommunityIcons name="fleur-de-lis" size={size} color={color} accessibilityElementsHidden importantForAccessibility="no" />
);

/** "BYTAI COMMUNITY" wordmark with fleur-de-lis. */
export function Wordmark({ color = palette.ivory, size = 1 }: { color?: string; size?: number }) {
  return (
    <Row gap={8 * size} accessible accessibilityRole="header" accessibilityLabel="ByTAI Community">
      <View>
        <T c={color} style={{ fontFamily: font.serifSemi, fontSize: 21 * size, lineHeight: 24 * size, letterSpacing: 4 * size }}>
          BYTAI
        </T>
        <T c={color} style={{ fontFamily: font.textMedium, fontSize: 7.5 * size, lineHeight: 10 * size, letterSpacing: 3.4 * size, marginTop: 1 }}>
          COMMUNITY
        </T>
      </View>
      <Fleur size={24 * size} />
    </Row>
  );
}

/* ───────────────────────── Screens ───────────────────────── */

/** Header for tab screens: serif title + fleur, optional right action. */
export function TabHeader({ title, right, subtitle }: { title: string; right?: React.ReactNode; subtitle?: string }) {
  const s = useScheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 10, paddingHorizontal: gutter, paddingBottom: 14, backgroundColor: s.bg }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row gap={10}>
          <T v="display" accessibilityRole="header">
            {title}
          </T>
          <Fleur size={22} />
        </Row>
        <Row gap={10}>{right}</Row>
      </Row>
      {subtitle ? (
        <T v="callout" muted style={{ marginTop: 4 }}>
          {subtitle}
        </T>
      ) : null}
    </View>
  );
}

/** Pushed/modal screen with a nav bar and scrolling body. */
export function Screen({
  children,
  title,
  right,
  close,
  contentStyle,
  bottom,
  padded = true,
  ...rest
}: ScrollViewProps & { title?: string; right?: React.ReactNode; close?: boolean; contentStyle?: StyleProp<ViewStyle>; bottom?: React.ReactNode; padded?: boolean }) {
  const s = useScheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: s.bg }}>
      <FocusStatusBar style={s.tone === 'dark' ? 'light' : 'dark'} />
      <NavBar title={title} right={right} close={close} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...rest}
        contentContainerStyle={[padded && { paddingHorizontal: gutter }, { paddingBottom: (bottom ? 120 : 40) + insets.bottom }, contentStyle]}
      >
        {children}
      </ScrollView>
      {bottom}
    </View>
  );
}

export function NavBar({ title, right, close, onBack }: { title?: string; right?: React.ReactNode; close?: boolean; onBack?: () => void }) {
  const s = useScheme();
  const insets = useSafeAreaInsets();
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: insets.top + 4, paddingHorizontal: 12, paddingBottom: 8, backgroundColor: s.bg }}>
      <IconButton icon={close ? 'close' : 'arrow-back'} label={close ? 'Close' : 'Back'} onPress={back} tone="ghost" />
      <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
        {title ? (
          <T v="title2" numberOfLines={1} accessibilityRole="header" style={{ fontSize: 19 }}>
            {title}
          </T>
        ) : null}
      </View>
      <View style={{ minWidth: 40, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

export function BottomBar({ children }: { children: React.ReactNode }) {
  const s = useScheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: gutter,
        paddingTop: 12,
        paddingBottom: Math.max(insets.bottom, 12) + 4,
        backgroundColor: s.bg,
        borderTopWidth: hairline,
        borderTopColor: s.line,
      }}
    >
      {children}
    </View>
  );
}

/* ───────────────────────── Controls ───────────────────────── */

type ButtonVariant = 'gold' | 'purple' | 'dark' | 'outline' | 'ghost' | 'ivory';

export function Button({
  title,
  onPress,
  variant = 'purple',
  icon,
  iconRight,
  loading,
  disabled,
  size = 'lg',
  caps,
  style,
  accessibilityLabel,
}: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  caps?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const s = useScheme();
  const map: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    gold: { bg: palette.gold, fg: palette.midnight },
    purple: { bg: palette.purple, fg: palette.ivory },
    dark: { bg: palette.midnight, fg: palette.ivory },
    ivory: { bg: palette.ivory, fg: palette.midnight },
    outline: { bg: 'transparent', fg: s.ink, border: s.tone === 'dark' ? palette.gold : s.line },
    ghost: { bg: 'transparent', fg: s.accentText },
  };
  const c = map[variant];
  const h = size === 'lg' ? 54 : size === 'md' ? 44 : 34;
  return (
    <PressScale
      onPress={disabled || loading ? undefined : onPress}
      haptic
      scaleTo={0.975}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={[
        {
          height: h,
          borderRadius: radius.pill,
          backgroundColor: c.bg,
          paddingHorizontal: size === 'sm' ? 14 : 22,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.4 : 1,
          borderWidth: c.border ? 1 : 0,
          borderColor: c.border,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={c.fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={size === 'sm' ? 15 : 18} color={c.fg} /> : null}
          <T v={size === 'sm' ? 'subhead' : 'button'} c={c.fg} style={[caps && { letterSpacing: 1.6, textTransform: 'uppercase', fontSize: 13.5 }, size === 'sm' && { fontFamily: font.textSemi }]}>
            {title}
          </T>
          {iconRight ? <Ionicons name={iconRight} size={size === 'sm' ? 15 : 18} color={c.fg} /> : null}
        </>
      )}
    </PressScale>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  badge,
  tone = 'plain',
  size = 40,
  color,
}: {
  icon: IconName;
  onPress?: () => void;
  label: string;
  badge?: number;
  tone?: 'plain' | 'glass' | 'ghost';
  size?: number;
  color?: string;
}) {
  const s = useScheme();
  const bg = { plain: s.surface, glass: 'rgba(16,17,21,0.42)', ghost: 'transparent' }[tone];
  const fg = color ?? (tone === 'glass' ? palette.ivory : s.ink);
  return (
    <PressScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={badge ? `${label}, ${badge} unread` : label}
      hitSlop={6}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: tone === 'plain' ? hairline : 0,
        borderColor: s.line,
      }}
    >
      <Ionicons name={icon} size={size * 0.52} color={fg} />
      {badge ? (
        <View style={styles.badge}>
          <T c={palette.midnight} style={{ fontFamily: font.textSemi, fontSize: 10, lineHeight: 12 }}>
            {badge > 9 ? '9+' : badge}
          </T>
        </View>
      ) : null}
    </PressScale>
  );
}

/** Filter pill. Selected = champagne gold on dark, midnight on ivory. */
export function Pill({ label, selected, onPress, icon, count, style }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName; count?: number; style?: StyleProp<ViewStyle> }) {
  const s = useScheme();
  const darkTone = s.tone === 'dark';
  const on = darkTone ? { bg: palette.gold, fg: palette.midnight } : { bg: palette.midnight, fg: palette.ivory };
  const off = darkTone ? { bg: palette.charcoal, fg: palette.ivory, border: '#3A3B43' } : { bg: palette.paper, fg: palette.midnight, border: s.line };
  const c = selected ? on : off;
  return (
    <PressScale
      onPress={onPress}
      haptic
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={[
        { height: 34, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: c.bg, borderWidth: selected ? 0 : 1, borderColor: (c as { border?: string }).border, flexDirection: 'row', alignItems: 'center', gap: 6 },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={14} color={c.fg} /> : null}
      <T v="subhead" c={c.fg} style={selected ? { fontFamily: font.textSemi } : undefined}>
        {label}
      </T>
      {count != null ? (
        <T v="caption" c={c.fg} style={{ opacity: 0.6 }}>
          {count}
        </T>
      ) : null}
    </PressScale>
  );
}

export function PillRow({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={style} contentContainerStyle={{ paddingHorizontal: gutter, gap: 8 }}>
      {children}
    </ScrollView>
  );
}

/** Two/three-way toggle with a sliding thumb. */
export function Segmented<V extends string>({ options, value, onChange, style }: { options: { value: V; label: string }[]; value: V; onChange: (v: V) => void; style?: StyleProp<ViewStyle> }) {
  const s = useScheme();
  const [w, setW] = useState(0);
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const x = useRef(new Animated.Value(idx)).current;
  useEffect(() => {
    Animated.spring(x, { toValue: idx, useNativeDriver: true, speed: 22, bounciness: 4 }).start();
  }, [idx, x]);
  const seg = w ? (w - 8) / options.length : 0;
  const thumb = s.tone === 'dark' ? palette.gold : palette.midnight;
  return (
    <View
      style={[{ flexDirection: 'row', padding: 4, borderRadius: radius.pill, backgroundColor: s.tone === 'dark' ? palette.charcoal : palette.paper, borderWidth: hairline, borderColor: s.line }, style]}
      onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}
      accessibilityRole="tablist"
    >
      {seg ? (
        <Animated.View
          style={{ position: 'absolute', top: 4, left: 4, bottom: 4, width: seg, borderRadius: radius.pill, backgroundColor: thumb, transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [0, seg] }) }] }}
        />
      ) : null}
      {options.map((o) => {
        const on = o.value === value;
        const fg = on ? (s.tone === 'dark' ? palette.midnight : palette.ivory) : s.ink;
        return (
          <PressScale key={o.value} haptic scaleTo={0.98} onPress={() => onChange(o.value)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={{ flex: 1, height: 36, alignItems: 'center', justifyContent: 'center' }}>
            <T v="subhead" c={fg} style={on ? { fontFamily: font.textSemi } : undefined}>
              {o.label}
            </T>
          </PressScale>
        );
      })}
    </View>
  );
}

export function SearchField({ value, onChangeText, placeholder, autoFocus }: { value: string; onChangeText: (t: string) => void; placeholder: string; autoFocus?: boolean }) {
  const s = useScheme();
  return (
    <Row gap={10} style={{ height: 46, marginHorizontal: gutter, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: s.surface, borderWidth: hairline, borderColor: s.line }}>
      <Ionicons name="search" size={17} color={s.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={s.muted}
        autoFocus={autoFocus}
        returnKeyType="search"
        accessibilityLabel={placeholder}
        style={{ flex: 1, fontFamily: font.text, fontSize: 15, color: s.ink, height: 44 }}
      />
      {value ? (
        <PressScale onPress={() => onChangeText('')} hitSlop={10} accessibilityLabel="Clear search" accessibilityRole="button">
          <Ionicons name="close-circle" size={18} color={s.faint} />
        </PressScale>
      ) : null}
    </Row>
  );
}

export function Field({ label, hint, style, ...rest }: TextInputProps & { label: string; hint?: string }) {
  const s = useScheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 18 }}>
      <T v="subhead" muted style={{ marginBottom: 8 }}>
        {label}
      </T>
      <TextInput
        placeholderTextColor={s.faint}
        accessibilityLabel={label}
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          { minHeight: 52, borderRadius: radius.md, borderWidth: 1, borderColor: focused ? (s.tone === 'dark' ? palette.gold : palette.purple) : s.line, backgroundColor: s.surface, paddingHorizontal: 16, fontFamily: font.text, fontSize: 16, color: s.ink },
          rest.editable === false && { color: s.muted, backgroundColor: s.surface2 },
          rest.multiline && { minHeight: 112, textAlignVertical: 'top', paddingTop: 14 },
          style,
        ]}
      />
      {hint ? (
        <T v="caption" muted style={{ marginTop: 6 }}>
          {hint}
        </T>
      ) : null}
    </View>
  );
}

export function Toggle({ label, description, value, onChange }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void }) {
  const s = useScheme();
  return (
    <Row gap={12} style={{ paddingVertical: 12 }}>
      <View style={{ flex: 1 }}>
        <T v="bodyMedium">{label}</T>
        {description ? (
          <T v="caption" muted style={{ marginTop: 2 }}>
            {description}
          </T>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: s.tone === 'dark' ? palette.gold : palette.purple, false: s.surface2 }} thumbColor={palette.white} ios_backgroundColor={s.surface2} accessibilityLabel={label} />
    </Row>
  );
}

export function Stepper({ value, onChange, min = 0, max = 10, label = 'Value' }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label?: string }) {
  const s = useScheme();
  const btn = (icon: IconName, next: number, disabled: boolean, a11y: string) => (
    <PressScale
      haptic
      onPress={disabled ? undefined : () => onChange(next)}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ disabled }}
      style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: s.line, backgroundColor: s.surface, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.35 : 1 }}
    >
      <Ionicons name={icon} size={17} color={s.ink} />
    </PressScale>
  );
  return (
    <Row gap={12} accessibilityLabel={`${label}: ${value}`}>
      {btn('remove', value - 1, value <= min, 'Decrease')}
      <T v="title3" tabular style={{ minWidth: 20, textAlign: 'center' }}>
        {value}
      </T>
      {btn('add', value + 1, value >= max, 'Increase')}
    </Row>
  );
}

/* ───────────────────────── Display ───────────────────────── */

export function SectionHeader({ title, action, onAction, style, caption }: { title: string; action?: string; onAction?: () => void; style?: StyleProp<ViewStyle>; caption?: string }) {
  const s = useScheme();
  return (
    <View style={[{ paddingHorizontal: gutter, marginTop: 30, marginBottom: 14 }, style]}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <T v="title2" accessibilityRole="header">
          {title}
        </T>
        {action ? (
          <PressScale onPress={onAction} hitSlop={10} accessibilityRole="button" accessibilityLabel={`${action}: ${title}`}>
            <Row gap={4}>
              <T v="calloutMedium" c={s.ink}>
                {action}
              </T>
              <Ionicons name="arrow-forward" size={14} color={s.ink} />
            </Row>
          </PressScale>
        ) : null}
      </Row>
      {caption ? (
        <T v="callout" muted style={{ marginTop: 4 }}>
          {caption}
        </T>
      ) : null}
    </View>
  );
}

/** Container for list rows with hairline separators. */
export function Group({ children, style, title, card = true }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; title?: string; card?: boolean }) {
  const s = useScheme();
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[{ marginHorizontal: gutter }, style]}>
      {title ? (
        <T v="eyebrow" muted style={{ marginBottom: 10, marginLeft: 2 }}>
          {title}
        </T>
      ) : null}
      <View style={card ? { backgroundColor: s.surface, borderRadius: radius.lg, overflow: 'hidden', borderWidth: hairline, borderColor: s.line } : undefined}>
        {items.map((child, i) => (
          <View key={i}>
            {i > 0 ? <Divider inset={card ? 16 : 0} /> : null}
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}

export function ListItem({
  icon,
  title,
  subtitle,
  value,
  onPress,
  leading,
  trailing,
  destructive,
  accessibilityLabel,
  padded = true,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  destructive?: boolean;
  accessibilityLabel?: string;
  padded?: boolean;
}) {
  const s = useScheme();
  const fg = destructive ? (s.tone === 'dark' ? palette.gold : palette.purple) : s.ink;
  const body = (
    <Row gap={14} style={{ paddingHorizontal: padded ? 16 : 0, paddingVertical: 13, minHeight: 54 }}>
      {leading ?? (icon ? <Ionicons name={icon} size={20} color={fg} style={{ width: 24 }} /> : null)}
      <View style={{ flex: 1 }}>
        <T v="bodyMedium" c={fg} numberOfLines={1}>
          {title}
        </T>
        {subtitle ? (
          <T v="caption" muted numberOfLines={2} style={{ marginTop: 2 }}>
            {subtitle}
          </T>
        ) : null}
      </View>
      {value ? (
        <T v="callout" muted>
          {value}
        </T>
      ) : null}
      {trailing ?? (onPress && !destructive ? <Ionicons name="chevron-forward" size={17} color={s.faint} /> : null)}
    </Row>
  );
  return onPress ? (
    <PressScale onPress={onPress} scaleTo={0.985} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? title}>
      {body}
    </PressScale>
  ) : (
    body
  );
}

export function Avatar({ name, size = 44, photo, ring }: { name: string; size?: number; photo?: PhotoKey; ring?: boolean }) {
  const s = useScheme();
  const inner = photo ? (
    <Photo photo={photo} width={size * 3} decorative style={{ width: size, height: size, borderRadius: size / 2 }} />
  ) : (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: s.tone === 'dark' ? palette.charcoal2 : palette.purple, alignItems: 'center', justifyContent: 'center' }}>
      <T c={s.tone === 'dark' ? palette.gold : palette.ivory} style={{ fontFamily: font.textSemi, fontSize: size * 0.36, lineHeight: size * 0.44 }}>
        {initials(name)}
      </T>
    </View>
  );
  return (
    <View accessibilityLabel={name} style={ring ? { padding: 2, borderRadius: size, borderWidth: 1.5, borderColor: palette.gold } : undefined}>
      {inner}
    </View>
  );
}

export function AvatarStack({ names, size = 28 }: { names: string[]; size?: number }) {
  const s = useScheme();
  return (
    <Row gap={0}>
      {names.slice(0, 4).map((n, i) => (
        <View key={n + i} style={{ marginLeft: i ? -size * 0.3 : 0, borderRadius: size, borderWidth: 2, borderColor: s.bg }}>
          <Avatar name={n} size={size} />
        </View>
      ))}
    </Row>
  );
}

type TagTone = 'gold' | 'purple' | 'lilac' | 'dark' | 'onImage' | 'neutral';

export function Tag({ label, tone = 'gold', icon }: { label: string; tone?: TagTone; icon?: IconName }) {
  const s = useScheme();
  const map: Record<TagTone, { bg: string; fg: string }> = {
    gold: s.tone === 'dark' ? { bg: palette.gold, fg: palette.midnight } : { bg: palette.goldSoft, fg: '#6B4E1E' },
    purple: { bg: palette.purple, fg: palette.ivory },
    lilac: { bg: palette.lilac, fg: palette.purple },
    dark: { bg: palette.midnight, fg: palette.gold },
    onImage: { bg: 'rgba(16,17,21,0.62)', fg: palette.ivory },
    neutral: { bg: s.surface2, fg: s.ink },
  };
  const c = map[tone];
  return (
    <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: c.bg }}>
      {icon ? <Ionicons name={icon} size={11} color={c.fg} /> : null}
      <T c={c.fg} style={{ fontFamily: font.textSemi, fontSize: 10.5, lineHeight: 13, letterSpacing: 1.1, textTransform: 'uppercase' }}>
        {label}
      </T>
    </View>
  );
}

export function Progress({ value, height = 4 }: { value: number; height?: number }) {
  const s = useScheme();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: Math.max(0, Math.min(1, value)), duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [value, v]);
  const fill = s.tone === 'dark' ? palette.gold : palette.purple;
  return (
    <View style={{ height, borderRadius: height, backgroundColor: s.surface2, overflow: 'hidden' }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}>
      <Animated.View style={{ height, borderRadius: height, backgroundColor: fill, width: v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}

export function EmptyState({ icon, title, body, action, onAction }: { icon: IconName; title: string; body: string; action?: string; onAction?: () => void }) {
  const s = useScheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 28 }}>
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: s.surface2, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={24} color={s.tone === 'dark' ? palette.gold : palette.purple} />
      </View>
      <T v="title2" center style={{ marginTop: 16 }}>
        {title}
      </T>
      <T v="callout" muted center style={{ marginTop: 6, maxWidth: 280 }}>
        {body}
      </T>
      {action ? <Button title={action} onPress={onAction} variant="outline" size="md" style={{ marginTop: 20 }} /> : null}
    </View>
  );
}

/** "BYTAI DEMO" label so prospects know this is a portfolio prototype. */
export function DemoBadge({ onImage }: { onImage?: boolean }) {
  const s = useScheme();
  const darkish = onImage || s.tone === 'dark';
  return (
    <Row gap={6} style={{ paddingHorizontal: 10, height: 24, borderRadius: radius.pill, backgroundColor: darkish ? 'rgba(16,17,21,0.55)' : palette.paper, borderWidth: hairline, borderColor: darkish ? 'rgba(229,183,107,0.45)' : s.line }} accessibilityLabel="ByTAI demo app">
      <Fleur size={11} />
      <T c={darkish ? palette.ivory : palette.midnight} style={{ fontFamily: font.textSemi, fontSize: 9.5, lineHeight: 12, letterSpacing: 1.4 }}>
        BYTAI DEMO
      </T>
    </Row>
  );
}

export function Notice({ children, icon = 'information-circle-outline' }: { children: React.ReactNode; icon?: IconName }) {
  const s = useScheme();
  return (
    <Row gap={10} style={{ padding: 14, borderRadius: radius.md, backgroundColor: s.surface2, alignItems: 'flex-start' }}>
      <Ionicons name={icon} size={18} color={s.tone === 'dark' ? palette.gold : palette.purple} />
      <T v="caption" c={s.ink} style={{ flex: 1, fontSize: 12.5, lineHeight: 18 }}>
        {children}
      </T>
    </Row>
  );
}

/** Gold square tile with a dark icon (program cards). */
export function IconTile({ icon, size = 40, tone = 'gold' }: { icon: IconName; size?: number; tone?: 'gold' | 'ivory' | 'dark' }) {
  const bg = { gold: palette.gold, ivory: palette.ivory, dark: palette.charcoal }[tone];
  const fg = tone === 'dark' ? palette.gold : palette.midnight;
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={size * 0.5} color={fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.midnight,
  },
});

export { shadow };
