/**
 * ByTAI Community · New Orleans design tokens.
 *
 * Midnight + champagne gold + royal purple + warm ivory. Photography and
 * serif display type carry the mood; gold is for accents and primary
 * calls to action on dark, purple for primary actions on ivory.
 * No red, no bright green.
 */
export const palette = {
  midnight: '#101115',
  charcoal: '#222329',
  charcoal2: '#2B2C33',
  gold: '#E5B76B',
  goldDeep: '#8A6A2E', // gold-toned text on ivory (≥ 4.5:1)
  goldSoft: '#F3E4C6',
  purple: '#301438',
  purple2: '#4A2357',
  lilac: '#EADFEF',
  ivory: '#F8F3EB',
  ivory2: '#EFE7DA',
  paper: '#FFFCF7',
  white: '#FFFFFF',
} as const;

export type Tone = 'dark' | 'light';

export interface Scheme {
  tone: Tone;
  bg: string;
  surface: string; // cards
  surface2: string; // chips, tracks, inset tiles
  ink: string;
  muted: string;
  faint: string;
  line: string;
  accentText: string; // gold-ish text that passes contrast on this background
}

export const dark: Scheme = {
  tone: 'dark',
  bg: palette.midnight,
  surface: palette.charcoal,
  surface2: palette.charcoal2,
  ink: palette.ivory,
  muted: '#B3ADA3',
  faint: '#7D786F',
  line: '#33343C',
  accentText: palette.gold,
};

export const light: Scheme = {
  tone: 'light',
  bg: palette.ivory,
  surface: palette.paper,
  surface2: palette.ivory2,
  ink: palette.midnight,
  muted: '#6B6255',
  faint: '#A39886',
  line: '#E3D8C6',
  accentText: palette.goldDeep,
};

export const font = {
  serif: 'PlayfairDisplay_700Bold',
  serifSemi: 'PlayfairDisplay_600SemiBold',
  serifRegular: 'PlayfairDisplay_400Regular',
  script: 'GreatVibes_400Regular',
  text: 'Inter_400Regular',
  textMedium: 'Inter_500Medium',
  textSemi: 'Inter_600SemiBold',
} as const;

export const gutter = 20;
export const radius = { xs: 8, sm: 10, md: 14, lg: 18, xl: 24, xxl: 30, pill: 999 } as const;

export const shadow = {
  card: { shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  soft: { shadowColor: '#3A2A12', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
} as const;
