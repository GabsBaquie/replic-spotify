import { useEffect } from 'react';
import { Image, StyleSheet, View, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Box, Text } from '@/components/restyle';
import { CustomIcon } from '@/components/ui/CustomIcon';
import { RestyleButton } from '@/components/RestyleButton';
import { useSpotifyAuth } from '@/query/spotifyAuth';

export default function Onboarding() {
  const { promptAsync, getAccessToken, response } = useSpotifyAuth();

  useEffect(() => {
    const fetchToken = async () => {
      const tokenData = await getAccessToken();
      if (tokenData?.access_token) {
        console.log('Token obtenu avec succès.');
        console.log(tokenData);
      }
    };
    

    if (response?.type === 'success') {
      if (response.authentication?.accessToken) {
        console.log('Connexion réussie : Token obtenu avec succès.', response.authentication.accessToken);
      } else {
        console.log('Connexion réussie : Pas d\'accessToken dans la réponse.');
      }
      fetchToken();
      router.push('/(tabs)/library');
    }
  }, [response]);

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
      <Box flexDirection="column" alignItems="center" justifyContent="center" flex={1} gap="m" backgroundColor='transparent'>
        <Image
          source={require('@/assets/images/spotify-logo-ligth.png')}
          style={styles.iconLogo}
          resizeMode="contain"
        />
        <Text color="text" variant="title" textAlign="center">Millions of Songs.</Text>
        <Text color="text" variant="title" textAlign="center">Free on Spotify.</Text>
      </Box>

      <Box style={styles.boxAuth}>
        <RestyleButton
          title="Sign up free"
          variant="primary"
          textColor="textSecondary"
          onPress={() => promptAsync()}
        />

        <RestyleButton
          title="Continue with Google"
          variant="outline"
          icon={<CustomIcon source={require('@/assets/images/icons/google.png')} size={20} />}
          onPress={() => {}}
        />

        <RestyleButton
          title="Continue with Facebook"
          variant="outline"
          icon={<CustomIcon source={require('@/assets/images/icons/facebook.png')} size={20} />}
          onPress={() => {}}
        />

        <RestyleButton
          title="Continue with Apple"
          variant="outline"
          icon={<CustomIcon source={require('@/assets/images/icons/apple.png')} size={20} />}
          onPress={() => {}}
        />

        <RestyleButton
          title="Log in"
          variant="transparent"
          onPress={() => promptAsync()}
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
  boxAuth: {
    gap: 10,
    marginHorizontal: 50,
    marginVertical: 20,
  },
});
