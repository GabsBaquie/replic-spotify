import { StyleSheet, Image, Platform } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import {Box, Text} from '@/components/restyle'

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <Box style={styles.titleContainer}>
        <Text variant="title">Explore</Text>
      </Box>
      <Box>This app includes example code to help you get started.</Box>
      <Collapsible title="File-based routing">
        <Text>
          This app has two screens:{' '}
          <Text variant="body">app/(tabs)/index.tsx</Text> and{' '}
          <Text variant="body">app/(tabs)/explore.tsx</Text>
        </Text>
        <Text>
          The layout file in <Text variant="body">app/(tabs)/_layout.tsx</Text>{' '}
          sets up the tab navigator.
        </Text>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <Text variant="body">Learn more</Text>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <Text>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <Text variant="subheader">w</Text> in the terminal running this project.
        </Text>
      </Collapsible>
      <Collapsible title="Images">
        <Text>
          For static images, you can use the <Text variant="subheader">@2x</Text> and{' '}
          <Text variant="subheader">@3x</Text> suffixes to provide files for different screen densities
        </Text>
        <Image source={require('@/assets/images/spotify-logo.png')} style={{ alignSelf: 'center' }} />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <Text variant="body">Learn more</Text>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Custom fonts">
        <Text>
          Open <Text variant="subheader">app/_layout.tsx</Text> to see how to load{' '}
          <Text style={{ fontFamily: 'SpaceMono' }}>
            custom fonts such as this one.
          </Text>
        </Text>
        <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/font">
          <Text variant="body">Learn more</Text>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Light and dark mode components">
        <Text>
          This template has light and dark mode support. The{' '}
          <Text variant="subheader">useColorScheme()</Text> hook lets you inspect
          what the user's current color scheme is, and so you can adjust UI colors accordingly.
        </Text>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <Text variant="body">Learn more</Text>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animations">
        <Text>
          This template includes an example of an animated component. The{' '}
          <Text variant="subheader">components/HelloWave.tsx</Text> component uses
          the powerful <Text variant="subheader">react-native-reanimated</Text>{' '}
          library to create a waving hand animation.
        </Text>
        {Platform.select({
          ios: (
            <Text>
              The <Text variant="subheader">components/ParallaxScrollView.tsx</Text>{' '}
              component provides a parallax effect for the header image.
            </Text>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
