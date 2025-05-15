import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';

export default function ArtistDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [artist, setArtist] = useState<any>(null);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('spotify_access_token');
        if (!token) throw new Error('No Spotify access token found');
        const res = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch artist');
        setArtist(data);

        const tracksRes = await fetch(`https://api.spotify.com/v1/artists/${id}/top-tracks?market=FR`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tracksData = await tracksRes.json();
        if (!tracksRes.ok) throw new Error(tracksData.error?.message || 'Failed to fetch top tracks');
        setTopTracks(tracksData.tracks);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading artist...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {artist.images?.[0]?.url && (
        <Image source={{ uri: artist.images[0].url }} style={styles.image} />
      )}
      <Text style={styles.name}>{artist.name}</Text>
      <Text style={styles.followers}>{artist.followers.total.toLocaleString()} Followers</Text>
      <Text style={styles.genres}>{artist.genres.join(', ')}</Text>
      <Text style={styles.sectionTitle}>Top Tracks</Text>
      {topTracks.map(track => (
        <View key={track.id} style={styles.trackItem}>
          {track.album?.images?.[0]?.url && (
            <Image source={{ uri: track.album.images[0].url }} style={styles.trackImage} />
          )}
          <Text style={styles.trackName}>{track.name}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { alignItems: 'center', padding: 20 },
  image: { width: 200, height: 200, borderRadius: 100, marginBottom: 20 },
  name: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 10 },
  followers: { fontSize: 16, color: 'gray', marginBottom: 10 },
  genres: { fontSize: 14, color: 'white', textAlign: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginTop: 30, marginBottom: 10 },
  trackItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  trackImage: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  trackName: { fontSize: 16, color: 'white', flexShrink: 1 },
});