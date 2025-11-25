import {
  View,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import useTopArtists from "@/hooks/useTopArtists";
import { Box, Text } from "@/components/restyle";
import { useCallback } from "react";
import { getLocalDeviceId } from "@/query/player/getLocalDeviceId";
import { playSpotifyTrack } from "@/query/player/playSpotifyTrack";

export default function TopArtists() {
  const { artists, loading } = useTopArtists(10);
  const handlePlay = useCallback(async (artistId: string) => {
    try {
      const deviceId = await getLocalDeviceId();
      await playSpotifyTrack(artistId, deviceId ?? undefined);
    } catch (error: any) {
      Alert.alert(
        "Lecture impossible",
        error?.message ?? "Réessaie plus tard."
      );
    }
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
      <Text style={{ marginBottom: 10 }}>Top Artists</Text>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={artists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePlay(item.id)}>
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
