import AsyncStorage from '@react-native-async-storage/async-storage';

export default async function getTopArtists(
  limit = 10,
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'
) {
  const token = await AsyncStorage.getItem('spotify_access_token');
  if (!token) throw new Error('No access token');

  const res = await fetch(
    `https://api.spotify.com/v1/me/top/artists?limit=${limit}&time_range=${timeRange}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || 'Failed to fetch top artists');
  }

  return data.items;
}