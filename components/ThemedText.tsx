import { createText } from '@shopify/restyle';
import type { Theme } from '@/theme/theme';

const RestyleText = createText<Theme>();

type ThemedTextProps = React.ComponentProps<typeof RestyleText> & {
  variant?: keyof Theme['textVariants'];
  style?: any;
};

export function ThemedText({ 
  variant = 'body',
  style,
  color = "textPrimary",
  ...rest 
}: ThemedTextProps) {
  return (
    <RestyleText 
      variant={variant}
      color={color}
      style={style}
      {...rest}
    />
  );
}

export type { ThemedTextProps };
