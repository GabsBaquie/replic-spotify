import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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

    <ThemedView style={styles.titleContainer}>
          <Image
                      source={require('@/assets/images/spotify-logo-ligth.png')}
                      style={styles.iconLogo}
                      resizeMode="contain"
                    />

            <ThemedText 
              color="textPrimary"
              variant="title"
              style={styles.stepContainer}
            >
              Millions of Songs. 
            </ThemedText>
            <ThemedText 
              color="textPrimary"
              variant="title"
              style={styles.stepContainer}
            >
              Free on Spotify.
            </ThemedText>
          </ThemedView>
      </ParallaxScrollView>

</>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  stepContainer: {
    alignItems: 'center',
    textAlign: 'center',
  },
  headerContainer: {
    height: 450,
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
