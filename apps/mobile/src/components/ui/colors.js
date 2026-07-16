/**
 * Color tokens for the template — a neutral blue palette. Customize for your brand.
 *
 * Palette:
 *   brand-primary    #2F5DED  (blue)     → primary CTA, active, brand
 *   navy             #14224A  (dark)     → bottom nav container
 *   light-blue       #EAF0FF  (soft)     → price/rating pill backgrounds, soft accents
 *   surface-base     #F4F6F9  (cool)     → app background
 *   surface-card     #FFFFFF             → cards / raised surfaces
 *   text-primary     #1C1E23             → primary text
 *   text-secondary   #74798A             → secondary text
 *   success          #219653
 *   danger           #EB5757
 *
 * Token NAMES are kept stable so the new identity cascades through existing
 * screens that already consume `primary`, `background`, `secondary`, `accent`,
 * `textPrimary`, `border`, etc. Only the hex values changed.
 *
 * Do NOT hardcode hex in screens — always consume semantic tokens (see
 * apps/mobile/DESIGN.md). Update docs/design/* before changing identity here.
 */
module.exports = {
  white: '#ffffff',
  black: '#000000',

  /* Brand primary (blue #2F5DED) */
  primary: {
    50: '#eaf0ff',
    100: '#cddaff',
    200: '#9db6fb',
    300: '#6f92f6',
    400: '#4c73ee',
    500: '#2f5ded',
    600: '#2748c2',
    700: '#1f3899',
    800: '#182a70',
    900: '#14224a',
  },
  primaryStrong: '#2748c2',
  brand: '#2f5ded',
  brandSoft: '#eaf0ff',

  /* AI accent — brand-led (blue). AI surfaces may use a subtle
     lift over the brand instead of a separate hue. */
  aiAccent: '#2f5ded',
  aiAccentSoft: '#eaf0ff',

  /* Brand secondary (navy #14224A) */
  secondary: '#14224a',
  secondarySoft: '#eaf0ff',

  /* Brand accent — folded into brand blue */
  accent: '#2f5ded',
  accentSoft: '#eaf0ff',

  /* Surfaces / background */
  surface: '#ffffff',
  surfaceCard: '#ffffff',
  surfaceRaised: '#ffffff',
  surfaceAlt: '#f4f6f9',
  softSurface: '#f4f6f9',
  background: '#f4f6f9',
  surfaceOverlay: 'rgba(28,30,35,0.48)',

  /* Text */
  textPrimary: '#1c1e23',
  textSecondary: '#74798a',
  textMuted: '#74798a',
  foreground: '#1c1e23',
  slateGray: '#74798a',

  /* Borders / dividers */
  border: '#e5e7eb',
  borderSubtle: '#e5e7eb',

  /* Feedback (single semantic values) */
  info: '#2f5ded',
  infoSoft: '#eaf0ff',

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
