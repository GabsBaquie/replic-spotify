import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CategoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [category, setCategory] = useState<any>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = await AsyncStorage.getItem('spotify_access_token');
        if (!token) throw new Error('Token manquant');

        const res = await fetch(`https://api.spotify.com/v1/browse/categories/${id}?locale=fr_FR`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || 'Erreur récupération catégorie');

        setCategory(data);

        const playlistRes = await fetch(`https://api.spotify.com/v1/browse/categories/${id}/playlists?limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const playlistData = await playlistRes.json();
        if (!playlistRes.ok) throw new Error(playlistData?.error?.message || 'Erreur récupération playlists');

        setPlaylists(playlistData.playlists.items);

        if (playlistData.playlists.items.length > 0) {
          const firstPlaylistId = playlistData.playlists.items[0].id;
          const tracksRes = await fetch(`https://api.spotify.com/v1/playlists/${firstPlaylistId}/tracks?limit=10`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const tracksData = await tracksRes.json();
          if (!tracksRes.ok) throw new Error(tracksData.error?.message || 'Erreur récupération musiques');
          setTracks(tracksData.items);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  console.log(category);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Chargement de la catégorie...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>Erreur : {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {category.icons?.[0]?.url && (
        <Image source={{ uri: category.icons[0].url }} style={styles.image} />
      )}
      <Text style={styles.title}>{category.name}</Text>
      <Text style={styles.desc}>ID : {category.id}</Text>
      <View style={{ marginTop: 30 }}>
        {playlists.map((pl) => (
          <View key={pl.id} style={{ alignItems: 'center', marginBottom: 20 }}>
            {pl.images?.[0]?.url && (
              <Image source={{ uri: pl.images[0].url }} style={{ width: 100, height: 100, borderRadius: 8 }} />
            )}
            <Text style={{ color: 'white', marginTop: 8 }}>{pl.name}</Text>
          </View>
        ))}
      </View>
      <View style={{ marginTop: 30 }}>
        <Text style={styles.title}>Musiques</Text>
        {tracks.map(({ track }) => (
          <View key={track.id} style={{ alignItems: 'center', marginBottom: 20 }}>
            {track.album?.images?.[0]?.url && (
              <Image source={{ uri: track.album.images[0].url }} style={{ width: 80, height: 80, borderRadius: 8 }} />
            )}
            <Text style={{ color: 'white', marginTop: 8 }}>{track.name}</Text>
            <Text
              style={{ color: '#1DB954', marginTop: 4, fontSize: 12 }}
              onPress={() => {
                if (track.external_urls?.spotify) {
                  Linking.openURL(track.external_urls.spotify);
                }
              }}
            >
              Écouter sur Spotify
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#121212' },
  image: { width: 150, height: 150, marginBottom: 20 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  desc: { color: 'gray', fontSize: 14, marginTop: 8 },
});