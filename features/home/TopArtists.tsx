import {
  View,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import useTopArtists from "@/hooks/Spotify/useTopArtists";
import { Box, Text } from "@/components/restyle";

export default function TopArtists() {
  const { artists, loading } = useTopArtists(10);
  const router = useRouter();

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
      <Text style={{ marginBottom: 10 }}>Top Artists</Text>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={artists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(tabs)/home/artist/[id]",
                params: { id: item.id },
              })
            }
          >
            <Box style={styles.item}>
              {item.images[0] && (
                <Image
                  source={{ uri: item.images[0].url }}
                  style={styles.image}
                />
              )}
              <Text numberOfLines={2} style={styles.title}>
                {item.name}
              </Text>
            </Box>
          </TouchableOpacity>
        )}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { marginTop: 20 },
  item: { flexDirection: "column", display: "flex" },
  image: { width: 120, height: 120, marginRight: 10 },
  title: { fontSize: 16, fontWeight: "600", textAlign: "center", width: 120 },
});
