import AsyncStorage from '@react-native-async-storage/async-storage';

export default async function albumTracks(
    albumId: string,
    offset = 0
    ) {
        const token = await AsyncStorage.getItem('spotify_access_token');
        if (!token) throw new Error('No access token');

        const res = await fetch(
            `https://api.spotify.com/v1/albums/${albumId}/tracks?market=FR&offset=${offset}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.error?.message || 'Failed to fetch album tracks');
        }

        // Dev LOG
        console.log('Album Tracks Data:', data);
        // End Dev LOG

        return data;
    }