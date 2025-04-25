import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { Box } from './restyle';

const HEADER_HEIGHT = 300;

type Props = PropsWithChildren<{
  headerImage?: ReactElement;
  headerBackgroundColor?: string;
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
}: Props) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1.2, 1]),
        },
      ],
    };
  });

  return (
    <Box backgroundColor="mainBackground" style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.header,
            headerAnimatedStyle,
          ]}>
          {headerImage}
        </Animated.View>
        <Box style={styles.content}>{children}</Box>
      </Animated.ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    gap: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
});
