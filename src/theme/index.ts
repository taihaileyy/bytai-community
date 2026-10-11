/**
 * ByTAI Community design tokens.
 *
 * Direction: warm off-white canvas, charcoal type, one deep-emerald accent
 * used sparingly (progress, selection, key confirmations). Photography and
 * typography carry the personality; color stays quiet.
 */
export const color = {
  bg: '#F7F6F3',
  surface: '#FFFFFF',
  surfaceAlt: '#F0EEE9',
  sunken: '#E9E6E0',
  ink: '#18181A',
  ink2: '#3D3D42',
  muted: '#6A6A70', // ≥ 4.5:1 on bg and surface
  faint: '#A3A3A8', // decorative only
  line: '#E6E3DD',
  lineStrong: '#D6D2CA',
  accent: '#13795B', // 5.4:1 on white
  accentPressed: '#0E5F47',
  accentSoft: '#E4F1EC',
  danger: '#B4441F',
  dangerSoft: '#FBEDE6',
  warn: '#8A5A12',
  warnSoft: '#F8EEDB',
  white: '#FFFFFF',
  black: '#000000',
  scrim: 'rgba(12,12,14,0.62)',
} as const;

export const font = {
  display: 'PlusJakartaSans_700Bold',
  displayHeavy: 'PlusJakartaSans_800ExtraBold',
  displaySemi: 'PlusJakartaSans_600SemiBold',
  text: 'Inter_400Regular',
  textMedium: 'Inter_500Medium',
  textSemi: 'Inter_600SemiBold',
} as const;

export const space = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, x3: 32, x4: 40, x5: 56 } as const;
export const radius = { xs: 8, sm: 10, md: 14, lg: 18, xl: 24, xxl: 32, pill: 999 } as const;
export const gutter = 20;

export const elevation = {
  soft: {
    shadowColor: '#1B1A16',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  float: {
    shadowColor: '#1B1A16',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
} as const;

export const motion = { fast: 160, base: 240, slow: 420 } as const;
