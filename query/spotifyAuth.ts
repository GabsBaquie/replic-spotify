import * as AuthSession from 'expo-auth-session';
import { exchangeCodeAsync, TokenResponse } from 'expo-auth-session';

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const clientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID as string;
const scopes = [
  'user-read-email',
  'playlist-read-private',
  'user-read-private',
  'user-read-recently-played',
  'user-top-read',
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
];;

const redirectUri = process.env.EXPO_PUBLIC_SPOTIFY_REDIRECT_URI as string;

export function useSpotifyAuth() {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      scopes,
      redirectUri,
      responseType: 'code',
      usePKCE: true,
    },
    discovery
  );

  // Échange du code contre un token
  const getAccessToken = async () => {
    if (response?.type !== 'success' || !response.params.code) return null;
  
    try {
      const tokenResult: TokenResponse = await exchangeCodeAsync(
        {
          code: response.params.code,
          clientId,
          redirectUri,
          extraParams: {
            code_verifier: request?.codeVerifier ?? '',
          },
        },
        discovery
      );

      // console.log('Token obtenu avec succès.', tokenResult);

      return tokenResult;

    } catch (err) {
      console.error('Token exchange failed:', err);
      return null;
    }
  };

  return { request, promptAsync, getAccessToken, response };
}
