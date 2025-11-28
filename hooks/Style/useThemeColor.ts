/**
 * Hook personnalisé pour obtenir les couleurs du thème sombre
 */

import { useTheme } from '@shopify/restyle';
import { Theme } from '@/theme/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof Theme['colors']
) {
  const theme = useTheme<Theme>();
  return theme.colors[colorName];
}
