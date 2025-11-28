import { Box, Text } from "@/components/restyle";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import PlayPauseButton from "@/components/ui/PlayPauseButton";
import { LibraryHero } from "@/components/ui/LibraryHero";
import { LibraryTrackRow } from "@/components/ui/LibraryTrackRow";
import { startPlayback } from "@/query/player/startPlayback";

type ActionConfig = {
  label: string;
  icon: ImageSourcePropType;
  handler: (router: ReturnType<typeof useRouter>, track: any) => void;
};

const baseActions: ActionConfig[] = [
  {
    label: "Add to playlist",
    icon: require("@/assets/images/icons/add_playlist.png"),
    handler: () => {},
  },
  {
    label: "Share",
    icon: require("@/assets/images/icons/share.png"),
    handler: () => {},
  },
  {
    label: "View album",
    icon: require("@/assets/images/icons/album.png"),
    handler: (router, track) =>
      router.push({
        pathname: "/(tabs)/search/album/[id]",
        params: { id: track.album.id, item: JSON.stringify(track.album) },
      }),
  },
  {
    label: "View artist",
    icon: require("@/assets/images/icons/artist.png"),
    handler: (router, track) =>
      router.push({
        pathname: "/home/artist/[id]",
        params: { id: track.artists[0].id },
      }),
  },
];

export default function TrackScreen() {
  const { item } = useLocalSearchParams();
  const router = useRouter();
  const data = JSON.parse(item as string);
  const [likeImage, setLikeImage] = useState(
    require("@/assets/images/icons/like_off.png")
  );
  const [downloadImage, setDownloadImage] = useState(
    require("@/assets/images/icons/download_off.png")
  );

  const actions = useMemo(() => baseActions, []);

  useEffect(() => {
    const autoplay = async () => {
      try {
        await startPlayback({ uris: [`spotify:track:${data.id}`] });
      } catch (error) {
        console.error("Failed to autoplay track", error);
      }
    };

    autoplay();
  }, [data.id]);

  return (
    <Box style={styles.container}>
      <LibraryHero
        cover={
          <Image
            source={{ uri: data.album.images[0]?.url }}
            style={styles.heroCover}
          />
        }
        title={data.name}
        subtitle={data.artists[0]?.name}
        metadata={[
          "Single",
          data.album.release_date.split("-")[0],
          data.album.name,
        ]}
        actions={
          <>
            <TouchableOpacity
              onPress={() =>
                setLikeImage((prev: ImageSourcePropType) =>
                  prev === require("@/assets/images/icons/like_off.png")
                    ? require("@/assets/images/icons/like_on.png")
                    : require("@/assets/images/icons/like_off.png")
                )
              }
            >
              <Image
                source={likeImage}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                setDownloadImage((prev: ImageSourcePropType) =>
                  prev === require("@/assets/images/icons/download_off.png")
                    ? require("@/assets/images/icons/download_on.png")
                    : require("@/assets/images/icons/download_off.png")
                )
              }
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
        rightSlot={<PlayPauseButton />}
      />

      <Text style={styles.sectionTitle}>Actions</Text>
      <FlatList
        data={actions}
        keyExtractor={(action) => action.label}
        scrollEnabled={false}
        renderItem={({ item: action }) => (
          <LibraryTrackRow
            title={action.label}
            subtitle=""
            fallbackColor="#2a2a2a"
            leftAccessory={
              <Image
                source={action.icon}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            }
            onPress={() => action.handler(router, data)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 60,
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
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  separator: {
    height: 8,
  },
});
