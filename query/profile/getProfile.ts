import AsyncStorage from '@react-native-async-storage/async-storage';

export default async function getProfile() {
  const accessToken = await AsyncStorage.getItem('spotify_access_token');
  if (!accessToken) throw new Error('No Spotify access token found');

  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  // Parse response JSON and log for debugging
  const data = await response.json();
  console.log('Spotify /me response:', response.status, data);
  if (!response.ok) {
    // Use Spotify error message if provided
    throw new Error(data.error?.message || data.message || 'Failed to fetch profile');
  }
  return data;
}
  
  