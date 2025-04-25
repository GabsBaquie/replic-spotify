import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Redirect } from 'expo-router';
import { Box, Text } from '@/components/restyle';

export default function HomeScreen() {
  const isoboarding = true;

  if (isoboarding) {
    return <Redirect href="/onBoarding" />;
  }
  
  return (
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
            end={{ x: 0, y: 1.82 }}
          />
        </View>
      }>
        
      <Box style={styles.titleContainer}>
      <Image
                  source={require('@/assets/images/spotify-logo-ligth.png')}
                  style={styles.iconLogo}
                  resizeMode="contain"
                />

        <Text 
          color="text"
          variant="title"
          style={styles.stepContainer}
        >
          Millions of Songs. 
        </Text>
         <Text 
          color="text"
          variant="title"
          style={styles.stepContainer}
        >
          Free on Spotify.
        </Text>
      </Box>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15,
  },
  stepContainer: {
    alignItems: 'center',
    textAlign: 'center',
  },
  headerContainer: {
    position: 'relative',
    height: 350,
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
