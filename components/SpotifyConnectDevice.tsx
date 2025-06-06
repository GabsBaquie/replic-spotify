// components/SpotifyWebPlayer.tsx

import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ce composant doit être monté au plus haut niveau de votre App,
// pour que le Spotify Web SDK tourne en arrière-plan dans une WebView invisible.

export default function SpotifyWebPlayer() {
  const [token, setToken] = useState<string | null>(null);
  const webviewRef = useRef<WebView>(null);

  // 1) Récupère l’access_token disponible en AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('spotify_access_token').then((t) => {
      if (t) setToken(t);
    });
  }, []);

  // Si pas de token, on n’affiche pas la WebView
  if (!token) return null;

  // 2) Le HTML qu’on va injecter dans la WebView
  const injectedHtml = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" /></head>
      <body>
        <!-- Charge le SDK JavaScript Spotify -->
        <script src="https://sdk.scdn.co/spotify-player.js"></script>
        <script>
          // On injecte le token Spotify depuis React Native
          window.tokenFromRN = '${token}';
          let player;

          window.onSpotifyWebPlaybackSDKReady = () => {
            player = new Spotify.Player({
              name: 'MonAppRN',
              getOAuthToken: cb => cb(window.tokenFromRN),
            });

            // Connexion au player
            player.connect().then(success => {
              console.log('Web Player ready:', success);
            });

            // Dès que le player est prêt, on reçoit un device_id unique
            player.addListener('ready', ({ device_id }) => {
              console.log('DEVICE_READY dans WebView, id:', device_id);

              // → Transfert de la lecture vers cet appareil, sans lancer immédiatement
              fetch('https://api.spotify.com/v1/me/player', {
                method: 'PUT',
                headers: {
                  'Authorization': 'Bearer ' + window.tokenFromRN,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ device_ids: [device_id], play: false })
              }).then(res => {
                console.log('Transfer playback status:', res.status);
              }).catch(err => console.error('Transfer error:', err));

              // → On notifie React Native que le device est prêt
              window.ReactNativeWebView.postMessage(
                JSON.stringify({ type: 'DEVICE_READY', device_id })
              );
            });

            // Listener des changements d’état du player (play/pause, position, titre, etc.)
            player.addListener('player_state_changed', (state) => {
              // Exemple d’objet state reçu (simplifié) :
              // {
              //   position: 12345,
              //   duration: 234000,
              //   paused: false,
              //   track_window: {
              //     current_track: {
              //       name: "...",
              //       artists: [ { name: "..." } ],
              //       album: { images: [ { url: "..." } ] }
              //     }
              //   }
              // }

              if (!state) return;
              
              // On extrait l’info pertinente
              const track = state.track_window.current_track;
              const payload = {
                type: 'PLAYER_STATE',
                state: {
                  playbackPosition: state.position,
                  trackDuration: state.duration,
                  isPaused: state.paused,
                  track: {
                    name: track.name,
                    artists: track.artists.map(a => a.name),
                    albumArtUri: track.album.images[0]?.url || null,
                  }
                }
              };
              
              window.ReactNativeWebView.postMessage(JSON.stringify(payload));
            });
          };

          // On écoute aussi les messages envoyés par React Native
          window.addEventListener('message', (event) => {
            try {
              const messageData = JSON.parse(event.data);
              // Attendez des messages { type: 'PLAY', uris: [...] }, { type: 'PAUSE' }, { type: 'RESUME' }, { type: 'SEEK', position: ... }
              if (messageData.type === 'PLAY' && Array.isArray(messageData.uris)) {
                player.play({ uris: messageData.uris }).catch(e => console.error('player.play error', e));
              }
              if (messageData.type === 'PAUSE') {
                player.pause().catch(e => console.error('player.pause error', e));
              }
              if (messageData.type === 'RESUME') {
                player.resume().catch(e => console.error('player.resume error', e));
              }
              if (messageData.type === 'SEEK' && typeof messageData.position === 'number') {
                player.seek(messageData.position).catch(e => console.error('player.seek error', e));
              }
            } catch (err) {
              console.error('Impossible de parser message RN → WebView :', err);
            }
          });
        </script>
      </body>
    </html>
  `;

  // 3) Fonction pour gérer les messages reçus de la WebView
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'DEVICE_READY' && data.device_id) {
        // Stocker le device_id en AsyncStorage pour pouvoir l’utiliser ailleurs
        AsyncStorage.setItem('spotify_device_id', data.device_id);
      }
      if (data.type === 'PLAYER_STATE') {
        // Ce sera traité par le composant NowPlayingBar (importé plus bas)
        // On peut remonter cet événement vers un Context global, ou l’envoyer
        // directement un prop callback. Pour la démo, on peut stocker en AsyncStorage
        // ou utiliser un EventEmitter simple. Exemple :
        AsyncStorage.setItem('spotify_player_state', JSON.stringify(data.state));
      }
    } catch (e) {
      console.error('Erreur parsing WebView message :', e);
    }
  };

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