import { View, type ViewProps } from 'react-native';
import { createBox, useTheme, ResponsiveValue } from '@shopify/restyle';
import { Theme } from '@/theme/theme';

const Box = createBox<Theme>();

export type ThemedViewProps = Omit<ViewProps, 'style'> & {
  backgroundColor?: keyof Theme['colors'];
  padding?: ResponsiveValue<keyof Theme['spacing'], Theme['breakpoints']>;
  margin?: ResponsiveValue<keyof Theme['spacing'], Theme['breakpoints']>;
  borderRadius?: number;
  style?: ViewProps['style'];
};

export function ThemedView({
  style,
  backgroundColor = 'mainBackground',
  padding,
  margin,
  borderRadius,
  ...otherProps
}: ThemedViewProps) {
  const theme = useTheme<Theme>();

  return (
    <Box
      backgroundColor={backgroundColor}
      padding={padding}
      margin={margin}
      borderRadius={borderRadius}
      style={style}
      {...otherProps}
    />
  );
}
