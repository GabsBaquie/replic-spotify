import {createTheme} from '@shopify/restyle';

const palette = {
  primary: '#1ED760', // Vert Spotify
  secondary: '#F6F6F7',
  accent: '#5C6AC4',
  success: '#008060',
  error: '#D82C0D',
  warning: '#FFC453',
  surface: '#202223',
  surfaceHighlight: '#2C2C2C',
  background: '#121212',
  foreground: '#FFFFFF',
  border: '#44474A',
  text: '#FFFFFF',
  textSecondary: '#00000',
  transparent: 'transparent',
};

const theme = createTheme({
  colors: {
    mainBackground: palette.background,
    mainForeground: palette.foreground,
    primary: palette.primary,
    secondary: palette.secondary,
    accent: palette.accent,
    success: palette.success,
    error: palette.error,
    warning: palette.warning,
    surface: palette.surface,
    surfaceHighlight: palette.surfaceHighlight,
    border: palette.border,
    text: palette.text,
    textSecondary: palette.textSecondary,
    transparent: palette.transparent,
    tabBarActive: palette.primary,     
    tabBarInactive: palette.foreground, 
    tabBarBackground: palette.background,
  },
  spacing: {
    xs: 8,
    s: 12,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadii: {
    none: 0,
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    full: 9999,
  },
  breakpoints: {
    phone: 0,
    tablet: 768,
    desktop: 1024,
  },
  textVariants: {
    defaults: {
      color: 'text',
      fontSize: 16,
      fontWeight: 'bold',
    },
    header: {
      fontWeight: 'bold',
      fontSize: 24,
      lineHeight: 32,
      color: 'text',
    },
    title: {
      fontWeight: 'bold',
      fontSize: 28,
      lineHeight: 34,
      color: 'text',
    },
    subheader: {
      fontWeight: '600',
      fontSize: 20,
      lineHeight: 28,
      color: 'text',
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      color: 'text',
    },
    caption: {
      fontSize: 14,
      lineHeight: 20,
      color: 'textSecondary',
    },
  },
  buttonVariants: {
    defaults: {
      borderRadius: 'full',
      paddingVertical: 's',
      paddingHorizontal: 'm',
    },
    primary: {
      backgroundColor: 'primary',
      color: 'mainForeground',
    },
    secondary: {
      backgroundColor: 'surface',
      borderWidth: 1,
      borderColor: 'border',
      color: 'text',
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: 'border',
      color: 'text',
    },
    transparent: {
      backgroundColor: 'transparent',
      color: 'text',
    },
    critical: {
      backgroundColor: 'error',
      color: 'mainForeground',
    },
  },
});

export type Theme = typeof theme;
export default theme;