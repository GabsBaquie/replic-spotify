import AsyncStorage from '@react-native-async-storage/async-storage';

export default async function searchContent(
  query: string,
  type = 'artist,album,track,playlist',
  limit = 10,
  offset = 5
) {
  const token = await AsyncStorage.getItem('spotify_access_token');
  if (!token) throw new Error('No access token');

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${query}&type=${type}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || 'Failed to fetch search results');
  }
  console.log('Search results:', data);
  console.log('Search results:', data.tracks.items[0].name);
  return data;
}