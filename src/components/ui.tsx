/**
 * Reusable UI kit: buttons, cards, chips, inputs, headers and layout.
 * Every piece reads colors from the active scheme (light app / dark admin).
 */
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
  type ScrollViewProps,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, palette, radius, shadow, space } from '@/theme';
import { useScheme } from '@/theme/SchemeContext';
import { initials } from '@/utils/format';
import { PressScale } from './Motion';
import { Txt } from './Txt';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

/* ───────── Layout ───────── */

export function Screen({
  children,
  header,
  contentStyle,
  padded = true,
  bottomInset = true,
  ...rest
}: ScrollViewProps & {
  header?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  padded?: boolean;
  bottomInset?: boolean;
}) {
  const s = useScheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: s.bg }}>
      {header}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...rest}
        contentContainerStyle={[
          padded && { paddingHorizontal: space.xl },
          { paddingBottom: (bottomInset ? insets.bottom : 0) + 32 },
          contentStyle,
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

/** Header for pushed screens: back button, centered title, optional right slot. */
export function AppHeader({
  title,
  right,
  onBack,
  transparent,
  close,
}: {
  title?: string;
  right?: React.ReactNode;
  onBack?: () => void;
  transparent?: boolean;
  close?: boolean;
}) {
  const s = useScheme();
  const insets = useSafeAreaInsets();
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));
  return (
    <View
      style={{
        paddingTop: insets.top + 6,
        paddingBottom: 10,
        paddingHorizontal: space.lg,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: transparent ? 'transparent' : s.bg,
      }}
    >
      <IconButton icon={close ? 'close' : 'chevron-back'} onPress={back} label="Go back" />
      <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
        {title ? (
          <Txt variant="heading" numberOfLines={1}>
            {title}
          </Txt>
        ) : null}
      </View>
      <View style={{ minWidth: 40, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  badge,
  tone = 'surface',
  size = 40,
}: {
  icon: IconName;
  onPress?: () => void;
  label: string;
  badge?: number;
  tone?: 'surface' | 'clear' | 'inverse';
  size?: number;
}) {
  const s = useScheme();
  const bg = tone === 'surface' ? s.surface : tone === 'inverse' ? 'rgba(255,255,255,0.12)' : 'transparent';
  const fg = tone === 'inverse' ? palette.cream : s.ink;
  return (
    <PressScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: tone === 'surface' ? StyleSheet.hairlineWidth : 0,
        borderColor: s.border,
      }}
    >
      <Ionicons name={icon} size={size * 0.5} color={fg} />
      {badge ? (
        <View style={[styles.badge, { borderColor: tone === 'inverse' ? palette.night : s.bg }]}>
          <Txt variant="caption" color={palette.white} style={{ fontFamily: fonts.semibold, fontSize: 10, lineHeight: 12 }}>
            {badge > 9 ? '9+' : badge}
          </Txt>
        </View>
      ) : null}
    </PressScale>
  );
}

export function Card({
  children,
  style,
  onPress,
  flat,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  flat?: boolean;
}) {
  const s = useScheme();
  const base: ViewStyle = {
    backgroundColor: s.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: s.border,
    ...(flat ? {} : shadow.card),
  };
  if (onPress)
    return (
      <PressScale onPress={onPress} style={[base, style]} accessibilityRole="button">
        {children}
      </PressScale>
    );
  return <View style={[base, style]}>{children}</View>;
}

export function SectionHeader({
  eyebrow,
  title,
  action,
  onAction,
  style,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 30, marginBottom: 14 }, style]}>
      <View style={{ flex: 1 }}>
        {eyebrow ? (
          <Txt variant="eyebrow" accent style={{ marginBottom: 6 }}>
            {eyebrow}
          </Txt>
        ) : null}
        <Txt variant="title">{title}</Txt>
      </View>
      {action ? (
        <PressScale onPress={onAction} hitSlop={8} accessibilityRole="button">
          <Txt variant="label" accent>
            {action} →
          </Txt>
        </PressScale>
      ) : null}
    </View>
  );
}

export const Divider = ({ style }: { style?: StyleProp<ViewStyle> }) => {
  const s = useScheme();
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: s.border }, style]} />;
};

export const Row = ({ children, style, gap = 8 }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>
);

/* ───────── Controls ───────── */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'inverse';

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  size = 'lg',
  style,
  haptic = true,
}: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
}) {
  const s = useScheme();
  const map: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: s.accent, fg: s.accentInk },
    secondary: { bg: s.surface, fg: s.ink, border: s.border },
    ghost: { bg: 'transparent', fg: s.accent },
    danger: { bg: palette.claySoft, fg: palette.clay },
    inverse: { bg: palette.cream, fg: palette.night },
  };
  const c = map[variant];
  const h = size === 'lg' ? 54 : size === 'md' ? 44 : 34;
  return (
    <PressScale
      onPress={disabled || loading ? undefined : onPress}
      haptic={haptic}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
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
          opacity: disabled ? 0.45 : 1,
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
          <Txt variant="label" color={c.fg} style={size === 'lg' ? { fontSize: 15.5 } : undefined}>
            {title}
          </Txt>
        </>
      )}
    </PressScale>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
}) {
  const s = useScheme();
  return (
    <PressScale
      onPress={onPress}
      haptic
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        paddingHorizontal: 14,
        height: 36,
        borderRadius: radius.pill,
        backgroundColor: selected ? s.ink : s.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: selected ? s.ink : s.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {icon ? <Ionicons name={icon} size={14} color={selected ? s.bg : s.muted} /> : null}
      <Txt variant="label" color={selected ? s.bg : s.ink}>
        {label}
      </Txt>
    </PressScale>
  );
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -space.xl }}
      contentContainerStyle={{ paddingHorizontal: space.xl, gap: 8 }}
    >
      {children}
    </ScrollView>
  );
}

export function Tag({ label, fg, bg, icon }: { label: string; fg: string; bg: string; icon?: IconName }) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: radius.pill,
        backgroundColor: bg,
      }}
    >
      {icon ? <Ionicons name={icon} size={11} color={fg} /> : null}
      <Txt variant="eyebrow" color={fg} style={{ fontSize: 10, letterSpacing: 0.8 }}>
        {label}
      </Txt>
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const s = useScheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: s.surface2, borderRadius: radius.pill, padding: 4 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <PressScale
            key={o.value}
            haptic
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={{
              flex: 1,
              height: 40,
              borderRadius: radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: active ? s.surface : 'transparent',
              ...(active ? shadow.card : {}),
            }}
          >
            <Txt variant="label" color={active ? s.ink : s.muted}>
              {o.label}
            </Txt>
          </PressScale>
        );
      })}
    </View>
  );
}

export function Field({
  label,
  hint,
  style,
  ...rest
}: TextInputProps & { label: string; hint?: string }) {
  const s = useScheme();
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Txt variant="label" style={{ marginBottom: 8 }}>
        {label}
      </Txt>
      <TextInput
        placeholderTextColor={s.muted}
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
          {
            minHeight: 50,
            borderRadius: radius.md,
            borderWidth: 1.5,
            borderColor: focused ? s.accent : s.border,
            backgroundColor: s.surface,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontFamily: fonts.body,
            fontSize: 15.5,
            color: s.ink,
          },
          rest.multiline && { minHeight: 110, textAlignVertical: 'top' },
          style,
        ]}
      />
      {hint ? (
        <Txt variant="caption" muted style={{ marginTop: 6 }}>
          {hint}
        </Txt>
      ) : null}
    </View>
  );
}

export function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const s = useScheme();
  return (
    <Row style={{ paddingVertical: 10 }} gap={12}>
      <View style={{ flex: 1 }}>
        <Txt variant="bodyStrong">{label}</Txt>
        {description ? (
          <Txt variant="caption" muted>
            {description}
          </Txt>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: s.accent, false: s.surface2 }}
        thumbColor={palette.white}
        ios_backgroundColor={s.surface2}
      />
    </Row>
  );
}

/* ───────── Display ───────── */

export function Avatar({ name, color, size = 44 }: { name: string; color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Txt color={palette.cream} style={{ fontFamily: fonts.semibold, fontSize: size * 0.36 }}>
        {initials(name)}
      </Txt>
    </View>
  );
}

export function IconBubble({
  icon,
  fg,
  bg,
  size = 44,
}: {
  icon: IconName;
  fg: string;
  bg: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon} size={size * 0.48} color={fg} />
    </View>
  );
}

export function ListRow({
  icon,
  title,
  subtitle,
  right,
  onPress,
  iconColor,
  iconBg,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  iconColor?: string;
  iconBg?: string;
}) {
  const s = useScheme();
  const content = (
    <Row gap={14} style={{ paddingVertical: 12 }}>
      {icon ? <IconBubble icon={icon} fg={iconColor ?? s.accent} bg={iconBg ?? s.accentSoft} size={40} /> : null}
      <View style={{ flex: 1 }}>
        <Txt variant="bodyStrong" numberOfLines={1}>
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="caption" muted numberOfLines={2}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={s.muted} /> : null)}
    </Row>
  );
  return onPress ? (
    <PressScale onPress={onPress} scaleTo={0.985} accessibilityRole="button">
      {content}
    </PressScale>
  ) : (
    content
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
  onAction,
}: {
  icon: IconName;
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}) {
  const s = useScheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20 }}>
      <IconBubble icon={icon} fg={s.accent} bg={s.accentSoft} size={56} />
      <Txt variant="heading" center style={{ marginTop: 14 }}>
        {title}
      </Txt>
      <Txt variant="body" muted center style={{ marginTop: 6, maxWidth: 300 }}>
        {body}
      </Txt>
      {action ? <Button title={action} onPress={onAction} size="md" style={{ marginTop: 18 }} /> : null}
    </View>
  );
}

/** Small "ByTAI DEMO" pill shown throughout the app. */
export function DemoPill({ inverse }: { inverse?: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: radius.pill,
        backgroundColor: inverse ? 'rgba(241,238,228,0.12)' : palette.night,
        borderWidth: inverse ? StyleSheet.hairlineWidth : 0,
        borderColor: 'rgba(241,238,228,0.25)',
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: palette.mint }} />
      <Txt variant="eyebrow" color={palette.cream} style={{ fontSize: 9.5, letterSpacing: 1 }}>
        ByTAI Demo
      </Txt>
    </View>
  );
}

/** Inline notice used on checkout and sign-in to explain demo behavior. */
export function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 10,
        padding: 14,
        borderRadius: radius.md,
        backgroundColor: palette.goldSoft,
        borderWidth: 1,
        borderColor: '#E6D29E',
        borderStyle: 'dashed',
      }}
    >
      <Ionicons name="information-circle" size={20} color="#8A6A1E" />
      <Txt variant="caption" color="#5E4A16" style={{ flex: 1, fontSize: 13, lineHeight: 18 }}>
        {children}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: palette.clay,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});

/** Sets the status bar style only while this screen is focused (tabs stay mounted). */
export function FocusStatusBar({ style }: { style: 'light' | 'dark' }) {
  const focused = useIsFocused();
  return focused ? <StatusBar style={style} /> : null;
}

/** Large page title used at the top of tab screens. */
export function PageTitle({ eyebrow, title, subtitle, right }: { eyebrow?: string; title: string; subtitle?: string; right?: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 14, marginBottom: 18 }}>
      <Row style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <DemoPill />
        {right}
      </Row>
      {eyebrow ? (
        <Txt variant="eyebrow" accent style={{ marginBottom: 8 }}>
          {eyebrow}
        </Txt>
      ) : null}
      <Txt variant="display">{title}</Txt>
      {subtitle ? (
        <Txt variant="body" muted style={{ marginTop: 6 }}>
          {subtitle}
        </Txt>
      ) : null}
    </View>
  );
}

export function SearchField({ value, onChangeText, placeholder }: { value: string; onChangeText: (t: string) => void; placeholder: string }) {
  const s = useScheme();
  return (
    <Row
      gap={10}
      style={{
        height: 48,
        borderRadius: radius.pill,
        backgroundColor: s.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: s.border,
        paddingHorizontal: 16,
        marginBottom: 14,
      }}
    >
      <Ionicons name="search" size={18} color={s.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={s.muted}
        returnKeyType="search"
        style={{ flex: 1, fontFamily: fonts.body, fontSize: 15, color: s.ink, height: 46 }}
      />
      {value ? (
        <PressScale onPress={() => onChangeText('')} hitSlop={8} accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={18} color={s.muted} />
        </PressScale>
      ) : null}
    </Row>
  );
}

export function Stepper({ value, onChange, min = 0, max = 10 }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  const s = useScheme();
  const btn = (icon: IconName, next: number, disabled: boolean) => (
    <PressScale
      haptic
      onPress={disabled ? undefined : () => onChange(next)}
      accessibilityRole="button"
      accessibilityLabel={icon === 'add' ? 'Increase' : 'Decrease'}
      style={{
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: s.surface2,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Ionicons name={icon} size={18} color={s.ink} />
    </PressScale>
  );
  return (
    <Row gap={14}>
      {btn('remove', value - 1, value <= min)}
      <Txt variant="heading" style={{ minWidth: 22, textAlign: 'center' }}>
        {value}
      </Txt>
      {btn('add', value + 1, value >= max)}
    </Row>
  );
}
