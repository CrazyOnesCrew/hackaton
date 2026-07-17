/**
 * Color tokens — PAAG styleguide (lavanda + ámbar).
 * Keep token NAMES stable; screens consume semantic tokens, not raw hex.
 */
module.exports = {
  white: '#ffffff',
  black: '#000000',

  /* Brand primary (lavanda #B9A5F5) */
  primary: {
    50: '#ede8fb',
    100: '#e0d7fa',
    200: '#d8ccf9',
    300: '#b9a5f5',
    400: '#a08eef',
    500: '#8b74e8',
    600: '#7460d4',
    700: '#5c4ab3',
    800: '#46378a',
    900: '#1f2430',
  },
  primaryStrong: '#8b74e8',
  brand: '#b9a5f5',
  brandSoft: '#ede8fb',

  /* AI / highlight — ámbar */
  aiAccent: '#f5a623',
  aiAccentSoft: '#fdf0da',

  secondary: '#1f2430',
  secondarySoft: '#ede8fb',

  accent: '#f5a623',
  accentSoft: '#fdf0da',

  /* Surfaces / background */
  surface: '#ffffff',
  surfaceCard: '#ffffff',
  surfaceRaised: '#ffffff',
  surfaceAlt: '#f5f6fa',
  softSurface: '#f5f6fa',
  background: '#f5f6fa',
  surfaceOverlay: 'rgba(31,36,48,0.48)',

  /* Text */
  textPrimary: '#1f2430',
  textSecondary: '#6b7280',
  textMuted: '#6b7280',
  foreground: '#1f2430',
  slateGray: '#6b7280',

  /* Borders / dividers */
  border: '#eceef4',
  borderSubtle: '#eceef4',

  /* Feedback */
  info: '#8b74e8',
  infoSoft: '#ede8fb',

  charcoal: {
    50: '#F2F2F2',
    100: '#E5E5E5',
    200: '#C9C9C9',
    300: '#B0B0B0',
    400: '#969696',
    500: '#7D7D7D',
    600: '#616161',
    700: '#474747',
    800: '#383838',
    850: '#2E2E2E',
    900: '#1E1E1E',
    950: '#121212',
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#F0EFEE',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  success: {
    50: '#e9f6f0',
    100: '#cdebe0',
    200: '#a3ddc9',
    300: '#6fc9ab',
    400: '#4bb692',
    500: '#219653',
    600: '#2c8a63',
    700: '#236e50',
    800: '#1b543d',
    900: '#123a2a',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EB5757',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
};
