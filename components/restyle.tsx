import {
    createBox,
    createText,
    createRestyleComponent,
    createVariant,
  } from '@shopify/restyle';
  import type { Theme } from '@/theme/theme';
  
  const Box = createBox<Theme>();
  
  const BoxWithBackground = (props: React.ComponentProps<typeof Box>) => (
    <Box backgroundColor="mainBackground" {...props} />
  );
  
  const Text = createText<Theme>();
  
  export { BoxWithBackground as Box, Text };