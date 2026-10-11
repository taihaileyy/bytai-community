import React from 'react';
import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { color, font } from '@/theme';

/** Type scale: Plus Jakarta Sans for display, Inter for reading. */
const scale = {
  hero: { fontFamily: font.displayHeavy, fontSize: 34, lineHeight: 38, letterSpacing: -1.1 },
  largeTitle: { fontFamily: font.displayHeavy, fontSize: 30, lineHeight: 35, letterSpacing: -0.9 },
  title1: { fontFamily: font.display, fontSize: 24, lineHeight: 30, letterSpacing: -0.6 },
  title2: { fontFamily: font.display, fontSize: 20, lineHeight: 26, letterSpacing: -0.4 },
  title3: { fontFamily: font.display, fontSize: 17, lineHeight: 22, letterSpacing: -0.25 },
  stat: { fontFamily: font.display, fontSize: 22, lineHeight: 26, letterSpacing: -0.6 },
  headline: { fontFamily: font.textSemi, fontSize: 15.5, lineHeight: 21, letterSpacing: -0.15 },
  body: { fontFamily: font.text, fontSize: 15.5, lineHeight: 23, letterSpacing: -0.1 },
  bodyMedium: { fontFamily: font.textMedium, fontSize: 15.5, lineHeight: 22, letterSpacing: -0.1 },
  callout: { fontFamily: font.text, fontSize: 14, lineHeight: 20, letterSpacing: -0.05 },
  calloutMedium: { fontFamily: font.textMedium, fontSize: 14, lineHeight: 20, letterSpacing: -0.05 },
  subhead: { fontFamily: font.textMedium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: font.text, fontSize: 12, lineHeight: 16 },
  overline: { fontFamily: font.textSemi, fontSize: 11, lineHeight: 14, letterSpacing: 0.9, textTransform: 'uppercase' },
} satisfies Record<string, TextStyle>;

export type Variant = keyof typeof scale;

export type TProps = TextProps & {
  v?: Variant;
  c?: string;
  muted?: boolean;
  center?: boolean;
  tabular?: boolean;
};

export function T({ v = 'body', c, muted, center, tabular, style, ...rest }: TProps) {
  return (
    <RNText
      maxFontSizeMultiplier={1.4}
      {...rest}
      style={[
        scale[v],
        { color: c ?? (muted ? color.muted : color.ink) },
        center && { textAlign: 'center' },
        tabular && { fontVariant: ['tabular-nums'] },
        style,
      ]}
    />
  );
}
