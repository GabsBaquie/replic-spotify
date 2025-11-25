import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback } from "react";
import useRecentlyPlayed from "@/hooks/useRecentlyPlayed";
import { Box, Text } from "@/components/restyle";
import { getLocalDeviceId } from "@/query/player/getLocalDeviceId";
import { playSpotifyTrack } from "@/query/player/playSpotifyTrack";

export default function RecentlyPlayed() {
  const { tracks, loading } = useRecentlyPlayed(20);

  const handlePlay = useCallback(async (trackId: string) => {
    try {
      const deviceId = await getLocalDeviceId();
      await playSpotifyTrack(trackId, deviceId ?? undefined);
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
        <Text>Loading recently played...</Text>
      </View>
    );
  }

  return (
    <Box style={styles.container}>
      <Text style={styles.heading}>Recently Played</Text>
      <FlatList
        data={tracks}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePlay(item.id)}>
            <Box style={styles.item}>
              {item.album.images[0] && (
                <Image
                  source={{ uri: item.album.images[0].url }}
                  style={styles.image}
                />
              )}
              <Text style={styles.title} numberOfLines={2}>
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
  center: { flex: 2, justifyContent: "center", alignItems: "center" },
  container: { marginTop: 20 },
  heading: { marginBottom: 10, fontSize: 18, fontWeight: "600", color: "#fff" },
  item: { flexDirection: "column", alignItems: "center", marginRight: 12 },
  image: { width: 120, height: 120, borderRadius: 4 },
  title: { fontSize: 16, fontWeight: "600", textAlign: "center", width: 120 },
});
