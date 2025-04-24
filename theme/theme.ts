import {createTheme} from '@shopify/restyle';

const palette = {
  // Couleurs sombres Spotify
  spotifyBlack: '#121212',
  spotifyDarkGray: '#282828',
  spotifyLightGray: '#B3B3B3',
  spotifyWhite: '#FFFFFF',
  spotifyGreen: '#1DB954',
  
  // Couleurs d'accent
  accentLight: '#1ED760',
  accentDark: '#1AA34A',
};

const theme = createTheme({
  colors: {
    // Couleurs principales (mode sombre uniquement)
    mainBackground: palette.spotifyBlack,
    mainForeground: palette.spotifyWhite,
    
    // Couleurs de composants
    cardPrimaryBackground: palette.spotifyDarkGray,
    cardSecondaryBackground: '#181818',
    
    // Couleurs de texte - Assurez-vous que ces couleurs sont utilisées dans textVariants
    textPrimary: palette.spotifyWhite,
    textSecondary: palette.spotifyLightGray,
    
    // Couleurs d'accent et d'interaction
    accent: palette.spotifyGreen,
    tint: palette.spotifyWhite,
    icon: palette.spotifyWhite,
    tabIconDefault: palette.spotifyWhite, // Changé en blanc
    tabIconSelected: palette.spotifyWhite,
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
  textVariants: {
    header: {
      fontSize: 34,
      fontWeight: 'bold',
      color: 'textPrimary', 
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: 'textPrimary',
    },
    body: {
      fontSize: 16,
      color: 'textPrimary',
    },
    defaults: {
      fontSize: 16,
      color: 'textPrimary', 
    },
  },
  breakpoints: {
    phone: 0,
    tablet: 768,
  },
});

export type Theme = typeof theme;
export default theme;