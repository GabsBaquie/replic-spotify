import { Image, StyleSheet } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerImage={
          <Image
            source={require('@/assets/images/spotify-cover.png')}
            style={styles.reactLogo}
          />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText 
          color="textPrimary"
          variant="title"
          style={styles.stepContainer}
        >
          Welcome!
        </ThemedText>
        <HelloWave />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 400,
    width: '100%',
  },
});
