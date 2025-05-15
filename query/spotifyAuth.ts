import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const clientId = 'clientid';
const clientSecret = 'clientsecret'; // Ne pas mettre ça en prod dans l'app mobile !
const scopes = ['user-read-email', 'playlist-read-private'];

const redirectUri = 'redirecturi';

export function useSpotifyAuth() {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      scopes,
      redirectUri,
      responseType: 'code',
    },
    discovery
  );

console.log('redirectUri:', redirectUri); // Debugging line

  // Échange du code contre un token
  const getAccessToken = async () => {
    if (response?.type !== 'success' || !response.params.code) return null;

    const credsB64 = btoa(`${clientId}:${clientSecret}`);

    const res = await fetch(discovery.tokenEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credsB64}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=authorization_code&code=${response.params.code}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}`,
    });

    const json = await res.json();
    if (!json.access_token) throw new Error('Access token manquant');
    return json;
  };

  return { request, promptAsync, getAccessToken, response };
}
