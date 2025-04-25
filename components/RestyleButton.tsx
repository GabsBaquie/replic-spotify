import { TouchableOpacity, View } from 'react-native';
import { createRestyleComponent, createVariant, spacing, SpacingProps, VariantProps } from '@shopify/restyle';
import { Theme } from '@/theme/theme';
import { Box, Text } from '@/components/restyle';

type ButtonVariants = VariantProps<Theme, 'buttonVariants'>;
type ButtonSpacingProps = SpacingProps<Theme>;

type RestyleButtonProps = ButtonVariants &
  ButtonSpacingProps & {
    title: string;
    onPress: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
    fullWidth?: boolean;
    textColor?: keyof Theme['colors']; // Ajout de la prop textColor
  };

const BaseButton = createRestyleComponent<ButtonVariants & ButtonSpacingProps & React.ComponentProps<typeof TouchableOpacity>, Theme>([
  spacing,
  createVariant({ themeKey: 'buttonVariants' }),
], TouchableOpacity);

export function RestyleButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  fullWidth = false,
  textColor,
  ...rest
}: RestyleButtonProps) {
  return (
    <BaseButton
      variant={variant}
      onPress={onPress}
      disabled={disabled}
      style={{ 
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : undefined 
      }}
      {...rest}>
      <Box flexDirection="row" alignItems="center" justifyContent="center">
        {icon && <Box marginRight="s">{icon}</Box>}
        <Text 
          variant="body" 
          color={textColor || (variant === 'outline' ? 'text' : 'mainForeground')}
        >
          {title}
        </Text>
      </Box>
    </BaseButton>
  );
}