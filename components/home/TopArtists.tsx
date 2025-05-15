import { useEffect, useState } from 'react';
import { View, Image, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import getTopArtists from '@/query/profile/topArtists';
import { Box, Text } from '@/components/restyle';

// Define Artist type
type Artist = {
  id: string;
  name: string;
  images: { url: string }[];
};

export default function TopArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopArtists(10)
      .then(data => {
        console.log('Top artists fetched:', data);
        setArtists(data);
      })
      .catch((err: any) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Loading top artists...</Text>
      </View>
    );
  }

  return (
    <Box style={styles.container}>
      <Text>Top Artists</Text>

      <FlatList
        horizontal
        data={artists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
        <Box style={styles.item}>
          {item.images[0] && (
            <Image source={{ uri: item.images[0].url }} style={styles.image} />
          )}
          <Text>{item.name}</Text>
        </Box>
      )}
    />
    </Box>
  );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 150, display: 'flex', gap: 10},
    item: { flexDirection: 'column',  display: 'flex'},
    image: { width: 100, height: 100, marginRight: 10 },
    name: { fontSize: 16, color: 'white' },
  });