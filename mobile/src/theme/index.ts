// Central design tokens — brand palette, spacing, radii, fonts.
export const colors = {
  primary: '#C8A97E',
  primaryDark: '#A8864A',
  primaryLight: '#D9BFA0',
  secondary: '#D8A7B1',
  bg: '#FFF9F5',
  surface: '#F5EFE8',
  text: '#1C1C1C',
  muted: '#6B7280',
  border: '#E8DDD4',
  white: '#FFFFFF',
  danger: '#EF4444',
  success: '#22C55E',
} as const;

export const fonts = {
  heading: 'PlayfairDisplay_600SemiBold',
  headingBold: 'PlayfairDisplay_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
} as const;

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32,
} as const;

export const radii = {
  sm: 8, md: 12, lg: 16, xl: 22, xxl: 28, full: 999,
} as const;

// Soft luxe gradient pairs for image-less cards (rotated by index).
export const gradients: [string, string][] = [
  ['#E9D8C4', '#D8A7B1'],
  ['#D8C3A5', '#C8A97E'],
  ['#EADCD0', '#C9A99B'],
  ['#D9C2B0', '#B89B86'],
  ['#E8D5C8', '#CBA98E'],
  ['#DCC9BC', '#B7967E'],
  ['#E6D2C0', '#D1A98D'],
  ['#D5BBA6', '#A8864A'],
];

export const shadow = {
  card: {
    shadowColor: '#1C1C1C',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  soft: {
    shadowColor: '#1C1C1C',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
} as const;

export const theme = { colors, fonts, spacing, radii, gradients, shadow };
export type Theme = typeof theme;
