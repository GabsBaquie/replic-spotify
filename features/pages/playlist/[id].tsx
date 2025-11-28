import { Box } from "@/components/restyle";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { fetchPlaylistTracks } from "@/query/search/playlistTracks";
import { startPlayback } from "@/query/player/startPlayback";
import { LibraryHero } from "@/components/ui/LibraryHero";
import { LibraryTrackRow } from "@/components/ui/LibraryTrackRow";
import PlayPauseButton from "@/components/ui/PlayPauseButton";

export default function PlaylistScreen() {
  const { item } = useLocalSearchParams();
  const data = JSON.parse(item as string);
  const [downloadImage, setDownloadImage] = useState(
    require("@/assets/images/icons/download_off.png")
  );
  const [likeImage, setLikeImage] = useState(
    require("@/assets/images/icons/like_off.png")
  );
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLaunchingId, setIsLaunchingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      try {
        const trackData = await fetchPlaylistTracks(data.id);
        setTracks(trackData.items);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching album tracks:", error);
        setLoading(false);
      }
    };
    fetchTracks();
  }, [data.id]);

  const handlePlayTrack = async (trackId?: string, index = 0) => {
    if (!trackId) return;
    try {
      setIsLaunchingId(trackId);
      await startPlayback({
        contextUri: `spotify:playlist:${data.id}`,
        offsetPosition: index,
      });
    } catch (error: any) {
      Alert.alert(
        "Lecture impossible",
        error?.message ?? "Réessaie plus tard."
      );
    } finally {
      setIsLaunchingId(null);
    }
  };

  if (loading) {
    return (
      <Box style={styles.loadingContainer}>
        <ActivityIndicator color="#fff" />
      </Box>
    );
  }

  return (
    <Box style={styles.container}>
      <LibraryHero
        cover={
          <Image
            source={{ uri: data.images[0]?.url }}
            style={styles.heroCover}
          />
        }
        title={data.name}
        subtitle={data.owner?.display_name}
        metadata={["Playlist"]}
        actions={
          <>
            <TouchableOpacity
              onPress={() => {
                setLikeImage(
                  (prev: import("react-native").ImageSourcePropType) => {
                    return prev ===
                      require("@/assets/images/icons/like_off.png")
                      ? require("@/assets/images/icons/like_on.png")
                      : require("@/assets/images/icons/like_off.png");
                  }
                );
              }}
            >
              <Image
                source={likeImage}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setDownloadImage(
                  (prev: import("react-native").ImageSourcePropType) => {
                    return prev ===
                      require("@/assets/images/icons/download_off.png")
                      ? require("@/assets/images/icons/download_on.png")
                      : require("@/assets/images/icons/download_off.png");
                  }
                );
              }}
            >
              <Image
                source={downloadImage}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={require("@/assets/images/icons/more.png")}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </>
        }
        rightSlot={<PlayPauseButton contextUri={`spotify:playlist:${data.id}`} />}
      />
      <FlatList
        data={tracks}
        style={{ marginTop: 20 }}
        keyExtractor={(item, index) =>
          item.track?.id?.toString() || index.toString()
        }
        renderItem={({ item, index }) => (
          <LibraryTrackRow
            title={item.track.name}
            subtitle={item.track.artists?.[0]?.name}
            imageUri={item.track.album?.images?.[0]?.url}
            onPress={() => handlePlayTrack(item.track?.id, index)}
            isActive={isLaunchingId === item.track?.id}
            rightElement={
              <Image
                source={
                  isLaunchingId === item.track?.id
                    ? require("@/assets/images/icons/play.png")
                    : require("@/assets/images/icons/more.png")
                }
                style={styles.rowIcon}
                resizeMode="contain"
              />
            }
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 75,
  },
  play_button: {
    backgroundColor: "#1DB954",
    padding: 20,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heroCover: {
    width: 225,
    height: 225,
    borderRadius: 16,
  },
  actionIcon: {
    width: 20,
    height: 20,
  },
  rowIcon: {
    width: 20,
    height: 20,
  },
});
