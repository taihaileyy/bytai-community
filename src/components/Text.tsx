import React from 'react';
import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { font } from '@/theme';
import { useScheme } from '@/theme/ToneContext';

/** Type scale: Playfair Display for display, Great Vibes script for flourishes, Inter for reading. */
const scale = {
  hero: { fontFamily: font.serif, fontSize: 38, lineHeight: 42, letterSpacing: -0.6 },
  display: { fontFamily: font.serif, fontSize: 30, lineHeight: 36, letterSpacing: -0.4 },
  title1: { fontFamily: font.serif, fontSize: 25, lineHeight: 31, letterSpacing: -0.3 },
  title2: { fontFamily: font.serif, fontSize: 21, lineHeight: 27, letterSpacing: -0.2 },
  title3: { fontFamily: font.textSemi, fontSize: 16.5, lineHeight: 22, letterSpacing: -0.2 },
  script: { fontFamily: font.script, fontSize: 52, lineHeight: 60 },
  stat: { fontFamily: font.serif, fontSize: 24, lineHeight: 28, letterSpacing: -0.3 },
  headline: { fontFamily: font.textSemi, fontSize: 15, lineHeight: 20, letterSpacing: -0.1 },
  body: { fontFamily: font.text, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: font.textMedium, fontSize: 15, lineHeight: 21 },
  callout: { fontFamily: font.text, fontSize: 13.5, lineHeight: 19 },
  calloutMedium: { fontFamily: font.textMedium, fontSize: 13.5, lineHeight: 19 },
  subhead: { fontFamily: font.textMedium, fontSize: 12.5, lineHeight: 17 },
  caption: { fontFamily: font.text, fontSize: 11.5, lineHeight: 15 },
  eyebrow: { fontFamily: font.textSemi, fontSize: 11, lineHeight: 14, letterSpacing: 2, textTransform: 'uppercase' },
  button: { fontFamily: font.textSemi, fontSize: 14.5, lineHeight: 18, letterSpacing: 0.3 },
} satisfies Record<string, TextStyle>;

export type Variant = keyof typeof scale;

export type TProps = TextProps & { v?: Variant; c?: string; muted?: boolean; accent?: boolean; center?: boolean; tabular?: boolean };

export function T({ v = 'body', c, muted, accent, center, tabular, style, ...rest }: TProps) {
  const s = useScheme();
  return (
    <RNText
      maxFontSizeMultiplier={1.35}
      {...rest}
      style={[
        scale[v],
        { color: c ?? (accent ? s.accentText : muted ? s.muted : s.ink) },
        center && { textAlign: 'center' },
        tabular && { fontVariant: ['tabular-nums'] },
        style,
      ]}
    />
  );
}
