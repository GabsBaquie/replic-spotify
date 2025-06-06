import AsyncStorage from '@react-native-async-storage/async-storage';

export async function fetchPlaylistTracks(playlistId: string) {
    const token = await AsyncStorage.getItem('spotify_access_token');
    if (!token) throw new Error('No access token');

    const res = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?market=FR`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to fetch playlist tracks');
    }

    return data;
}