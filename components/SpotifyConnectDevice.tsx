// components/SpotifyConnectDevice.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SpotifyConnectDevice() {
  const [token, setToken] = useState<string | null>(null);
  const webviewRef = useRef<WebView>(null);

  // 1) Récupérer le token Spotify depuis AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('spotify_access_token').then((t) => {
      if (t) setToken(t);
    });
  }, []);

  // 2) Réception des messages venant de la WebView
  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'DEVICE_READY' && data.device_id) {
        // On stocke le device_id dans AsyncStorage
        await AsyncStorage.setItem('spotify_device_id', data.device_id);
        console.log('→ DEVICE_READY reçu, stocké Device ID =', data.device_id);
      }
    } catch (e) {
      console.error('Error parsing message from WebView:', e);
    }
  };

  if (!token) {
    // Tant que le token n’est pas chargé, on ne monte pas la WebView
    return null;
  }

  // 3) HTML injecté dans la WebView pour instancier le Web Playback SDK
  const injectedHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
      </head>
      <body>
        <script src="https://sdk.scdn.co/spotify-player.js"></script>
        <script>
          window.tokenFromRN = '${token}';
          let player;

          window.onSpotifyWebPlaybackSDKReady = () => {
            player = new Spotify.Player({
              name: 'MonAppRN',
              getOAuthToken: cb => cb(window.tokenFromRN),
            });

            // Tentative de connexion du SDK
            player.connect().then(success => {
              console.log('Web Playback SDK connected ?', success);
            });

            // Dès que le SDK est prêt, on transfère la session vers ce device
            player.addListener('ready', ({ device_id }) => {
              console.log('Player ready, device_id:', device_id);
              // ① Transférer la lecture vers ce device (sans lancer la lecture)
              fetch('https://api.spotify.com/v1/me/player', {
                method: 'PUT',
                headers: {
                  'Authorization': 'Bearer ' + window.tokenFromRN,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ device_ids: [device_id], play: false })
              })
              .then(res => {
                console.log('Transfer playback response status:', res.status);
              })
              .catch(err => console.error('Transfer error:', err));

              // ② Envoyer le device_id à React Native
              window.ReactNativeWebView.postMessage(
                JSON.stringify({ type: 'DEVICE_READY', device_id })
              );
            });

            // Optionnel : si React Native envoie { type: 'play', uris: [...] }, on joue
            window.addEventListener('message', event => {
              try {
                const messageData = JSON.parse(event.data || '{}');
                if (messageData.type === 'play' && Array.isArray(messageData.uris)) {
                  player.play({ uris: messageData.uris }).catch(err => {
                    console.error('Erreur player.play():', err);
                  });
                }
              } catch (e) {
                console.error('Impossible de parser le message:', e);
              }
            });
          };
        </script>
      </body>
    </html>
  `;

  // 4) On rend la WebView (invisible/tondeuse)
  return (
    <View style={styles.webviewContainer}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html: injectedHtml }}
        javaScriptEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        onMessage={handleMessage}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webviewContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    opacity: 0.01,
    zIndex: -1,
  },
});