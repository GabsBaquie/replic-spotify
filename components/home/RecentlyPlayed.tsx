import { useEffect, useState } from 'react';
import { View, Image, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import getRecentlyPlayed from '@/query/profile/recentlyPlayed';
import { Box, Text } from '@/components/restyle';

// Define a minimal Track type matching Spotify API
interface Track {
  id: string;
  name: string;
  album: { id: string; images: { url: string }[] };
  artists: { name: string }[];
}

export default function RecentlyPlayed() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getRecentlyPlayed(10)
      .then((data: Track[]) => {
        // remove duplicate tracks by id
        const unique = data.filter((track: Track, idx: number, arr: Track[]) =>
          arr.findIndex((t: Track) => t.id === track.id) === idx
        );
        setTracks(unique);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Loading recently played...</Text>
      </View>
    );
  }

  return (
    <Box style={styles.container}>
        
      <Text>Recently Played</Text>

      <FlatList
        horizontal
        data={tracks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/(tabs)/search/track/[id]',
                params: { id: item.id, item: JSON.stringify(item) },
              })
            }
          >
            <Box style={styles.item}>
              {item.album.images[0] && (
                <Image
                  source={{ uri: item.album.images[0].url }}
                  style={styles.image}
                />
              )}
              <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
            </Box>
          </TouchableOpacity>
        )}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  center: { flex: 2, justifyContent: 'center', alignItems: 'center' },
  container: { marginTop: 20, maxHeight: 150 },
  item: { flexDirection: 'column', alignItems: 'center', marginRight: 12 },
  image: { width: 80, height: 80, borderRadius: 4 },
  title: { fontSize: 16, fontWeight: '600', textAlign: 'center', width: 80 },
}); 