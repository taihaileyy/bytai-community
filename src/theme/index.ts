/**
 * ByTAI Community design tokens.
 * Member app = warm "paper" light theme. Admin console = the dark builtbyTAI
 * palette, so the two interfaces feel clearly separate.
 */
export const palette = {
  ink: '#16150F',
  night: '#131310',
  night2: '#1B1A15',
  night3: '#24221A',
  nightBorder: '#33301F',
  cream: '#F1EEE4',
  paper: '#F4F1E8',
  paper2: '#ECE7D9',
  card: '#FFFDF7',
  stone: '#6B6553',
  stoneLight: '#A69E8C',
  line: '#E2DBC8',
  green: '#2F7A63',
  greenDeep: '#1F5745',
  mint: '#6FBBA1',
  mintBright: '#8ED0B8',
  mintSoft: '#DCEDE4',
  gold: '#C9A24A',
  goldSoft: '#F3E7C7',
  clay: '#C4674F',
  claySoft: '#F5DED6',
  sky: '#4F7FA8',
  skySoft: '#DCE7F1',
  white: '#FFFFFF',
} as const;

export type ColorScheme = {
  bg: string;
  surface: string;
  surface2: string;
  ink: string;
  muted: string;
  border: string;
  accent: string;
  accentInk: string;
  accentSoft: string;
};

export const light: ColorScheme = {
  bg: palette.paper,
  surface: palette.card,
  surface2: palette.paper2,
  ink: palette.ink,
  muted: palette.stone,
  border: palette.line,
  accent: palette.green,
  accentInk: palette.white,
  accentSoft: palette.mintSoft,
};

export const dark: ColorScheme = {
  bg: palette.night,
  surface: palette.night2,
  surface2: palette.night3,
  ink: palette.cream,
  muted: palette.stoneLight,
  border: palette.nightBorder,
  accent: palette.mint,
  accentInk: palette.night,
  accentSoft: '#22382F',
};

export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayItalic: 'Fraunces_500Medium_Italic',
  body: 'WorkSans_400Regular',
  medium: 'WorkSans_500Medium',
  semibold: 'WorkSans_600SemiBold',
  mono: 'IBMPlexMono_500Medium',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40 } as const;
export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const shadow = {
  card: {
    shadowColor: '#2A2414',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  lifted: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
} as const;

/** Category accent colors used by programs and events. */
export const categoryColors: Record<string, { fg: string; bg: string }> = {
  Food: { fg: palette.clay, bg: palette.claySoft },
  Youth: { fg: palette.sky, bg: palette.skySoft },
  Learning: { fg: palette.green, bg: palette.mintSoft },
  Wellness: { fg: '#8A6BB0', bg: '#ECE4F5' },
  Housing: { fg: '#A0782A', bg: palette.goldSoft },
  Volunteer: { fg: palette.green, bg: palette.mintSoft },
  Fundraiser: { fg: '#A0782A', bg: palette.goldSoft },
  Workshop: { fg: palette.sky, bg: palette.skySoft },
  Community: { fg: palette.clay, bg: palette.claySoft },
};

export const getCategoryColor = (c: string) =>
  categoryColors[c] ?? { fg: palette.green, bg: palette.mintSoft };
