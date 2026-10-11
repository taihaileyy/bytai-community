/**
 * UI kit. Quiet surfaces, hairline separators, charcoal primary actions,
 * the accent reserved for selection and progress.
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
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
  type StyleProp,
  type TextInputProps,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, elevation, font, gutter, radius, space } from '@/theme';
import { initials } from '@/utils/format';
import { PressScale } from './Motion';
import { T } from './Text';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

export const hairline = StyleSheet.hairlineWidth;

/* ───────────────────────── Layout ───────────────────────── */

/** Sets the status bar style only while this screen is focused (tabs stay mounted). */
export function FocusStatusBar({ style }: { style: 'light' | 'dark' }) {
  const focused = useIsFocused();
  return focused ? <StatusBar style={style} /> : null;
}

export const Row = ({ children, style, gap = 8, ...rest }: ViewProps & { gap?: number }) => (
  <View {...rest} style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>
    {children}
  </View>
);

export const Divider = ({ inset = 0, style }: { inset?: number; style?: StyleProp<ViewStyle> }) => (
  <View style={[{ height: hairline, backgroundColor: color.line, marginLeft: inset }, style]} />
);

/**
 * Tab-level screen with an iOS-style large title. As you scroll, a compact
 * title bar fades in with a hairline under it.
 */
export function LargeTitleScreen({
  title,
  subtitle,
  right,
  children,
  contentStyle,
  showDemo = true,
  ...rest
}: ScrollViewProps & {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  showDemo?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(0)).current;
  const barOpacity = y.interpolate({ inputRange: [24, 56], outputRange: [0, 1], extrapolate: 'clamp' });
  const titleScale = y.interpolate({ inputRange: [-80, 0], outputRange: [1.08, 1], extrapolate: 'clamp' });

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <FocusStatusBar style="dark" />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y } } }], { useNativeDriver: true })}
        {...rest}
        contentContainerStyle={[{ paddingTop: insets.top + 12, paddingBottom: 48 }, contentStyle]}
      >
        <View style={{ paddingHorizontal: gutter, marginBottom: 20 }}>
          <Row style={{ justifyContent: 'space-between', minHeight: 40 }}>
            {showDemo ? <DemoBadge /> : <View />}
            <Row gap={10}>{right}</Row>
          </Row>
          <Animated.View style={{ marginTop: 14, transform: [{ scale: titleScale }], transformOrigin: 'left' } as never}>
            <T v="largeTitle" accessibilityRole="header">
              {title}
            </T>
          </Animated.View>
          {subtitle ? (
            <T v="callout" muted style={{ marginTop: 6, maxWidth: 340 }}>
              {subtitle}
            </T>
          ) : null}
        </View>
        {children}
      </Animated.ScrollView>

      <Animated.View
        pointerEvents="none"
        style={[styles.compactBar, { paddingTop: insets.top, height: insets.top + 48, opacity: barOpacity }]}
      >
        <T v="headline">{title}</T>
      </Animated.View>
    </View>
  );
}

/** Plain scrolling screen for pushed/modal routes, with a top navigation bar. */
export function Screen({
  children,
  title,
  right,
  close,
  contentStyle,
  bottom,
  ...rest
}: ScrollViewProps & {
  title?: string;
  right?: React.ReactNode;
  close?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  bottom?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const [scrolled, setScrolled] = useState(false);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setScrolled(e.nativeEvent.contentOffset.y > 4);
  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <FocusStatusBar style="dark" />
      <NavBar title={title} right={right} close={close} divider={scrolled} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={32}
        onScroll={onScroll}
        {...rest}
        contentContainerStyle={[{ paddingHorizontal: gutter, paddingBottom: (bottom ? 120 : 40) + insets.bottom }, contentStyle]}
      >
        {children}
      </ScrollView>
      {bottom}
    </View>
  );
}

export function NavBar({
  title,
  right,
  close,
  divider,
  onBack,
}: {
  title?: string;
  right?: React.ReactNode;
  close?: boolean;
  divider?: boolean;
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));
  return (
    <View
      style={[
        styles.nav,
        { paddingTop: insets.top + 4, borderBottomColor: divider ? color.line : 'transparent' },
      ]}
    >
      <IconButton icon={close ? 'close' : 'chevron-back'} label={close ? 'Close' : 'Back'} onPress={back} />
      <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
        {title ? (
          <T v="headline" numberOfLines={1} accessibilityRole="header">
            {title}
          </T>
        ) : null}
      </View>
      <View style={{ minWidth: 40, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

/** Sticky action bar pinned above the home indicator. */
export function BottomBar({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
      {children}
    </View>
  );
}

/* ───────────────────────── Controls ───────────────────────── */

type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'tertiary' | 'danger' | 'light';

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconRight,
  loading,
  disabled,
  size = 'lg',
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
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: color.ink, fg: color.white },
    accent: { bg: color.accent, fg: color.white },
    secondary: { bg: color.surface, fg: color.ink, border: color.lineStrong },
    tertiary: { bg: 'transparent', fg: color.ink },
    danger: { bg: color.dangerSoft, fg: color.danger },
    light: { bg: color.white, fg: color.ink },
  };
  const c = palette[variant];
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
          borderRadius: size === 'sm' ? radius.pill : radius.md + 2,
          backgroundColor: c.bg,
          paddingHorizontal: size === 'sm' ? 14 : 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.38 : 1,
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
          <T v={size === 'sm' ? 'subhead' : 'headline'} c={c.fg} style={size === 'sm' ? { fontFamily: font.textSemi } : undefined}>
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
}: {
  icon: IconName;
  onPress?: () => void;
  label: string;
  badge?: number;
  tone?: 'plain' | 'glass' | 'ghost' | 'dark';
  size?: number;
}) {
  const bg = { plain: color.surface, glass: 'rgba(255,255,255,0.92)', ghost: 'transparent', dark: 'rgba(20,20,22,0.38)' }[tone];
  const fg = tone === 'dark' ? color.white : color.ink;
  return (
    <PressScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={badge ? `${label}, ${badge} unread` : label}
      hitSlop={6}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: tone === 'plain' ? hairline : 0,
          borderColor: color.line,
        },
        tone === 'glass' && elevation.soft,
      ]}
    >
      <Ionicons name={icon} size={size * 0.48} color={fg} />
      {badge ? (
        <View style={styles.badge}>
          <T v="caption" c={color.white} style={{ fontFamily: font.textSemi, fontSize: 10, lineHeight: 12 }}>
            {badge > 9 ? '9+' : badge}
          </T>
        </View>
      ) : null}
    </PressScale>
  );
}

export function Chip({ label, selected, onPress, icon, count }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName; count?: number }) {
  return (
    <PressScale
      onPress={onPress}
      haptic
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={[styles.chip, selected ? styles.chipOn : null]}
    >
      {icon ? <Ionicons name={icon} size={14} color={selected ? color.white : color.ink2} /> : null}
      <T v="subhead" c={selected ? color.white : color.ink2}>
        {label}
      </T>
      {count != null ? (
        <T v="caption" c={selected ? 'rgba(255,255,255,0.7)' : color.muted}>
          {count}
        </T>
      ) : null}
    </PressScale>
  );
}

export function ChipRow({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={{ paddingHorizontal: gutter, gap: 8 }}
    >
      {children}
    </ScrollView>
  );
}

/** iOS-style segmented control with a sliding thumb. */
export function Segmented<V extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: { value: V; label: string }[];
  value: V;
  onChange: (v: V) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const [w, setW] = useState(0);
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const x = useRef(new Animated.Value(idx)).current;
  useEffect(() => {
    Animated.spring(x, { toValue: idx, useNativeDriver: true, speed: 22, bounciness: 4 }).start();
  }, [idx, x]);
  const seg = w ? (w - 6) / options.length : 0;
  return (
    <View style={[styles.segTrack, style]} onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)} accessibilityRole="tablist">
      {seg ? (
        <Animated.View
          style={[
            styles.segThumb,
            { width: seg, transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [0, seg] }) }] },
          ]}
        />
      ) : null}
      {options.map((o) => {
        const on = o.value === value;
        return (
          <PressScale
            key={o.value}
            haptic
            scaleTo={0.98}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={{ flex: 1, height: 34, alignItems: 'center', justifyContent: 'center' }}
          >
            <T v="subhead" c={on ? color.ink : color.muted} style={on ? { fontFamily: font.textSemi } : undefined}>
              {o.label}
            </T>
          </PressScale>
        );
      })}
    </View>
  );
}

export function SearchField({ value, onChangeText, placeholder }: { value: string; onChangeText: (t: string) => void; placeholder: string }) {
  return (
    <Row gap={10} style={styles.search}>
      <Ionicons name="search" size={17} color={color.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={color.muted}
        returnKeyType="search"
        accessibilityLabel={placeholder}
        style={{ flex: 1, fontFamily: font.text, fontSize: 15.5, color: color.ink, height: 44 }}
      />
      {value ? (
        <PressScale onPress={() => onChangeText('')} hitSlop={10} accessibilityLabel="Clear search" accessibilityRole="button">
          <Ionicons name="close-circle" size={18} color={color.faint} />
        </PressScale>
      ) : null}
    </Row>
  );
}

export function Field({ label, hint, style, ...rest }: TextInputProps & { label: string; hint?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 18 }}>
      <T v="subhead" c={color.ink2} style={{ marginBottom: 8 }}>
        {label}
      </T>
      <TextInput
        placeholderTextColor={color.faint}
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
          styles.input,
          focused && { borderColor: color.ink, backgroundColor: color.surface },
          rest.editable === false && { color: color.muted, backgroundColor: color.surfaceAlt },
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
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: color.accent, false: color.sunken }}
        thumbColor={color.white}
        ios_backgroundColor={color.sunken}
        accessibilityLabel={label}
      />
    </Row>
  );
}

export function Stepper({ value, onChange, min = 0, max = 10, label = 'Value' }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label?: string }) {
  const btn = (icon: IconName, next: number, disabled: boolean, a11y: string) => (
    <PressScale
      haptic
      onPress={disabled ? undefined : () => onChange(next)}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ disabled }}
      style={[styles.stepBtn, disabled && { opacity: 0.35 }]}
    >
      <Ionicons name={icon} size={17} color={color.ink} />
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

export function SectionHeader({
  title,
  action,
  onAction,
  style,
  caption,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  caption?: string;
}) {
  return (
    <View style={[{ paddingHorizontal: gutter, marginTop: 36, marginBottom: 14 }, style]}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <T v="title2" accessibilityRole="header">
          {title}
        </T>
        {action ? (
          <PressScale onPress={onAction} hitSlop={10} accessibilityRole="button" accessibilityLabel={`${action}: ${title}`}>
            <Row gap={2}>
              <T v="calloutMedium" c={color.ink2}>
                {action}
              </T>
              <Ionicons name="chevron-forward" size={15} color={color.ink2} />
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

/** Inset grouped container (iOS Settings style). */
export function Group({ children, style, title }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; title?: string }) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[{ marginHorizontal: gutter }, style]}>
      {title ? (
        <T v="overline" muted style={{ marginBottom: 8, marginLeft: 4 }}>
          {title}
        </T>
      ) : null}
      <View style={styles.group}>
        {items.map((child, i) => (
          <View key={i}>
            {i > 0 ? <Divider inset={16} /> : null}
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
}) {
  const body = (
    <Row gap={14} style={{ paddingHorizontal: 16, paddingVertical: 13, minHeight: 52 }}>
      {leading ?? (icon ? (
        <View style={styles.listIcon}>
          <Ionicons name={icon} size={18} color={destructive ? color.danger : color.ink} />
        </View>
      ) : null)}
      <View style={{ flex: 1 }}>
        <T v="bodyMedium" c={destructive ? color.danger : color.ink} numberOfLines={1}>
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
      {trailing ?? (onPress && !destructive ? <Ionicons name="chevron-forward" size={17} color={color.faint} /> : null)}
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

export function Avatar({ name, size = 44, tone = 'neutral' }: { name: string; size?: number; tone?: 'neutral' | 'dark' | 'accent' }) {
  const bg = { neutral: color.sunken, dark: color.ink, accent: color.accentSoft }[tone];
  const fg = { neutral: color.ink2, dark: color.white, accent: color.accent }[tone];
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={name}>
      <T c={fg} style={{ fontFamily: font.textSemi, fontSize: size * 0.36, lineHeight: size * 0.44 }}>
        {initials(name)}
      </T>
    </View>
  );
}

/** Overlapping avatar stack, e.g. "who's going". */
export function AvatarStack({ names, size = 28 }: { names: string[]; size?: number }) {
  return (
    <Row gap={0}>
      {names.slice(0, 4).map((n, i) => (
        <View key={n + i} style={{ marginLeft: i ? -size * 0.32 : 0, borderRadius: size, borderWidth: 2, borderColor: color.bg }}>
          <Avatar name={n} size={size} tone={i % 2 ? 'neutral' : 'accent'} />
        </View>
      ))}
    </Row>
  );
}

type TagTone = 'neutral' | 'accent' | 'danger' | 'warn' | 'onImage' | 'dark';

export function Tag({ label, tone = 'neutral', icon }: { label: string; tone?: TagTone; icon?: IconName }) {
  const map: Record<TagTone, { bg: string; fg: string }> = {
    neutral: { bg: color.surfaceAlt, fg: color.ink2 },
    accent: { bg: color.accentSoft, fg: color.accent },
    danger: { bg: color.dangerSoft, fg: color.danger },
    warn: { bg: color.warnSoft, fg: color.warn },
    onImage: { bg: 'rgba(255,255,255,0.92)', fg: color.ink },
    dark: { bg: color.ink, fg: color.white },
  };
  const c = map[tone];
  return (
    <View style={[styles.tag, { backgroundColor: c.bg }]}>
      {icon ? <Ionicons name={icon} size={11} color={c.fg} /> : null}
      <T v="caption" c={c.fg} style={{ fontFamily: font.textSemi, fontSize: 11.5 }}>
        {label}
      </T>
    </View>
  );
}

/** Thin progress line. */
export function Progress({ value, tone = 'accent', height = 4 }: { value: number; tone?: 'accent' | 'ink' | 'danger' | 'light'; height?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: Math.max(0, Math.min(1, value)), duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [value, v]);
  const fill = { accent: color.accent, ink: color.ink, danger: color.danger, light: color.white }[tone];
  const track = tone === 'light' ? 'rgba(255,255,255,0.25)' : color.sunken;
  return (
    <View
      style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden' }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
    >
      <Animated.View style={{ height, borderRadius: height, backgroundColor: fill, width: v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}

export function EmptyState({ icon, title, body, action, onAction }: { icon: IconName; title: string; body: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 28 }}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={24} color={color.ink2} />
      </View>
      <T v="title3" center style={{ marginTop: 16 }}>
        {title}
      </T>
      <T v="callout" muted center style={{ marginTop: 6, maxWidth: 280 }}>
        {body}
      </T>
      {action ? <Button title={action} onPress={onAction} variant="secondary" size="md" style={{ marginTop: 20 }} /> : null}
    </View>
  );
}

/** "ByTAI Demo" label shown across the app so prospects know it's a prototype. */
export function DemoBadge({ onImage }: { onImage?: boolean }) {
  return (
    <View
      style={[styles.demo, onImage ? { backgroundColor: 'rgba(20,20,22,0.42)' } : { backgroundColor: color.surface, borderWidth: hairline, borderColor: color.line }]}
      accessibilityLabel="ByTAI demo app"
    >
      <View style={styles.demoDot} />
      <T v="caption" c={onImage ? color.white : color.ink2} style={{ fontFamily: font.textSemi, letterSpacing: 0.2 }}>
        ByTAI Demo
      </T>
    </View>
  );
}

export function Notice({ children, icon = 'information-circle-outline' }: { children: React.ReactNode; icon?: IconName }) {
  return (
    <Row gap={10} style={styles.notice}>
      <Ionicons name={icon} size={18} color={color.ink2} style={{ alignSelf: 'flex-start', marginTop: 1 }} />
      <T v="caption" c={color.ink2} style={{ flex: 1, fontSize: 12.5, lineHeight: 18 }}>
        {children}
      </T>
    </Row>
  );
}

const styles = StyleSheet.create({
  compactBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(247,246,243,0.97)',
    borderBottomWidth: hairline,
    borderBottomColor: color.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: color.bg,
    borderBottomWidth: hairline,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: gutter,
    paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopWidth: hairline,
    borderTopColor: color.line,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: color.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: color.white,
  },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    borderWidth: hairline,
    borderColor: color.lineStrong,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipOn: { backgroundColor: color.ink, borderColor: color.ink },
  segTrack: { flexDirection: 'row', padding: 3, borderRadius: 12, backgroundColor: color.sunken },
  segThumb: { position: 'absolute', top: 3, left: 3, bottom: 3, borderRadius: 9, backgroundColor: color.surface, ...elevation.soft },
  search: {
    height: 46,
    marginHorizontal: gutter,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: color.sunken,
  },
  input: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.surface,
    paddingHorizontal: 16,
    fontFamily: font.text,
    fontSize: 16,
    color: color.ink,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: color.lineStrong,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  group: { backgroundColor: color.surface, borderRadius: radius.lg, overflow: 'hidden', borderWidth: hairline, borderColor: color.line },
  listIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: color.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  tag: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: color.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  demo: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, height: 26, borderRadius: radius.pill },
  demoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: color.accent },
  notice: { padding: 14, borderRadius: radius.md, backgroundColor: color.surfaceAlt },
});

export { space };
