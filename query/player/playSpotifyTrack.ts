import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://api.spotify.com/v1';

/**
 * Lance la lecture d'une piste complète sur Spotify Web API.
 * @param trackId ID Spotify de la piste (ex: '3n3Ppam7vgaVa1iaRUc9Lp')
 * @param deviceId Optionnel : identifiant du device Spotify Connect ciblé
 */
export async function playSpotifyTrack(
  trackId: string,
  deviceId?: string
): Promise<void> {
  const token = await AsyncStorage.getItem('spotify_access_token');
  if (!token) throw new Error('No Spotify access token found');

  const url = deviceId
    ? `${API_BASE}/me/player/play?device_id=${deviceId}`
    : `${API_BASE}/me/player/play`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
  });

  if (response.status !== 204) {
    const errorJson = await response.json();
    throw new Error(
      errorJson.error?.message || `Playback failed (status ${response.status})`
    );
  }
}