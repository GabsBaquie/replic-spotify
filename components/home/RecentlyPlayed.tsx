import { View, Image, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import useRecentlyPlayed from '@/hooks/useRecentlyPlayed';
import { Box, Text } from '@/components/restyle';

export default function RecentlyPlayed() {
  const { tracks, loading } = useRecentlyPlayed(20);
  const router = useRouter();

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
        
      <Text style={{marginBottom: 10}}>Recently Played</Text>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
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
  container: { marginTop: 20 },
  item: { flexDirection: 'column', alignItems: 'center', marginRight: 12 },
  image: { width: 120, height: 120, borderRadius: 4 },
  title: { fontSize: 16, fontWeight: '600', textAlign: 'center', width: 120 },
}); 