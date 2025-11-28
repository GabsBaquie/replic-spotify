import { Box } from "@/components/restyle";
import PlayPauseButton from "@/components/ui/PlayPauseButton";
import { LibraryHero } from "@/components/ui/LibraryHero";
import { LibraryTrackRow } from "@/components/ui/LibraryTrackRow";
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
import albumTracks from "@/query/search/albumTracks";
import { startPlayback } from "@/query/player/startPlayback";

export default function AlbumScreen() {
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
        const trackData = await albumTracks(data.id);
        setTracks(trackData.items ?? []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching album tracks:", error);
        setLoading(false);
      }
    };
    fetchTracks();
  }, [data.id]);

  const handlePlayTrack = async (trackId: string, index: number) => {
    try {
      setIsLaunchingId(trackId);
      await startPlayback({
        contextUri: `spotify:album:${data.id}`,
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
        subtitle={data.artists[0]?.name}
        metadata={["Album", data.release_date.split("-")[0]]}
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
        rightSlot={<PlayPauseButton contextUri={`spotify:album:${data.id}`} />}
      />
      <FlatList
        data={tracks}
        style={{ marginTop: 20 }}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item, index }) => (
          <LibraryTrackRow
            title={item.name}
            subtitle={item.artists?.[0]?.name}
            imageUri={data.images[0]?.url}
            onPress={() => handlePlayTrack(item.id, index)}
            isActive={isLaunchingId === item.id}
            rightElement={
              <Image
                source={
                  isLaunchingId === item.id
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
