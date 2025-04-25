import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Box, Text } from '@/components/restyle';
import { CustomIcon } from '@/components/ui/CustomIcon';
import { RestyleButton } from '@/components/RestyleButton';
import { router } from 'expo-router';


export default function Onboarding() {
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
              end={{ x: 0, y: 1.5 }}
            />
          </View>
        }>

        <Box 
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

        <Box style={styles.boxAuyh}>
        <RestyleButton 
                  title="Sign up free"
                  variant="primary"
                  textColor="textSecondary"
                  onPress={() => {router.push('/signup/step1')}}
                />

          <RestyleButton 
                  title="Continue with Google"
                  variant="outline"
                  icon={<CustomIcon source={require('@/assets/images/google.png')} size={20} />}
                  onPress={() => {}}
                />

          <RestyleButton 
                  title="Continue with Facebook"
                  variant="outline"
                  icon={<CustomIcon source={require('@/assets/images/facebook.png')} size={20} />}
                  onPress={() => {}}
                />

          <RestyleButton 
                  title="Continue with Apple"
                  variant="outline"
                  icon={<CustomIcon source={require('@/assets/images/apple.png')} size={20} />}
                  onPress={() => {}}
                />

          <RestyleButton 
                  title="Log in"
                  variant="transparent"
                  onPress={() => {}}
                />
        </Box>

      </ParallaxScrollView>
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
  boxAuyh: {
    gap: 10,
    marginHorizontal: 50,
    marginVertical: 20
  }
});
