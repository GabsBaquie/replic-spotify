import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://api.spotify.com/v1';

async function getAccessToken(): Promise<string> {
  const token = await AsyncStorage.getItem('spotify_access_token');
  if (!token) throw new Error('No Spotify access token found');
  return token;
}

/** Fetch Spotify artist details */
export async function getArtistDetails(artistId: string): Promise<any> {
  const token = await getAccessToken();
  const response = await fetch(`${API_BASE}/artists/${artistId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) {
  }
  return data;
}

/** Fetch top tracks for a given artist (default market: FR) */
export async function getTopTracksByArtist(
  artistId: string,
  market: string = 'FR'
): Promise<any[]> {
  const token = await getAccessToken();
  const response = await fetch(
    `${API_BASE}/artists/${artistId}/top-tracks?market=${market}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch top tracks by artist');
  }
  return data.tracks;
} 