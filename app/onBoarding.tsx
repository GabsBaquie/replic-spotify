import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Box, Text } from '@/components/restyle';

export default function Onboarding() {
  return (
    <>
      <ParallaxScrollView
        headerImage={
          <View style={styles.headerContainer}>
            <Image
              source={require('@/assets/images/spotify-cover.png')}
              style={styles.reactLogo}
            />
            <LinearGradient
              colors={['transparent', '#121212', '#121212']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1.5 }}
            />
          </View>
        }>

        <Box 
          backgroundColor="mainBackground"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          flex={1}
          gap="m"
        >
          <Image
            source={require('@/assets/images/spotify-logo-ligth.png')}
            style={styles.iconLogo}
            resizeMode="contain"
          />
          <Text 
            color="text"
            variant="title"
            textAlign="center"
          >
            Millions of Songs. 
          </Text>
          <Text 
            color="text"
            variant="title"
            textAlign="center"
          >
            Free on Spotify.
          </Text>
        </Box>
      </ParallaxScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 400,
    width: '100%',
  },
  reactLogo: {
    height: '100%',
    width: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  iconLogo: {
    height: 50,
    width: 50,
  },
});
