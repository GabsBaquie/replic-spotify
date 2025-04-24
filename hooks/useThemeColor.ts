/**
 * Hook personnalisé pour obtenir les couleurs du thème sombre
 */

import { Colors } from '@/constants/Colors';

export function useThemeColor(
  props: { dark?: string },
  colorName: keyof typeof Colors
) {
  const colorFromProps = props.dark;

  if (colorFromProps) {
    return colorFromProps;
  }
  
  return Colors[colorName];
}
