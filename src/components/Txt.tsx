import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { fonts } from '@/theme';
import { useScheme } from '@/theme/SchemeContext';

type Variant = 'hero' | 'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'label' | 'caption' | 'eyebrow' | 'stat';

const variants: Record<Variant, TextStyle> = {
  hero: { fontFamily: fonts.display, fontSize: 34, lineHeight: 39, letterSpacing: -0.6 },
  display: { fontFamily: fonts.display, fontSize: 28, lineHeight: 33, letterSpacing: -0.4 },
  title: { fontFamily: fonts.display, fontSize: 22, lineHeight: 27, letterSpacing: -0.2 },
  heading: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.semibold, fontSize: 13.5, lineHeight: 18 },
  caption: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 17 },
  eyebrow: { fontFamily: fonts.mono, fontSize: 11, lineHeight: 14, letterSpacing: 1.1, textTransform: 'uppercase' },
  stat: { fontFamily: fonts.display, fontSize: 26, lineHeight: 30, letterSpacing: -0.4 },
};

export type TxtProps = TextProps & {
  variant?: Variant;
  color?: string;
  muted?: boolean;
  accent?: boolean;
  center?: boolean;
  italic?: boolean;
};

export function Txt({ variant = 'body', color, muted, accent, center, italic, style, ...rest }: TxtProps) {
  const s = useScheme();
  const c = color ?? (accent ? s.accent : muted ? s.muted : s.ink);
  return (
    <Text
      {...rest}
      style={[
        variants[variant],
        { color: c },
        center && { textAlign: 'center' },
        italic && { fontFamily: fonts.displayItalic },
        style,
      ]}
    />
  );
}
