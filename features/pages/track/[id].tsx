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
import useSupabasePlayer from "@/hooks/Player/useSupabasePlayer";
import type { SongWithArtists } from "@/lib/supabase";

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
      track.album &&
      router.push({
        pathname: "/(tabs)/search/album/[id]",
        params: { id: track.album.id, item: JSON.stringify(track.album) },
      }),
  },
  {
    label: "View artist",
    icon: require("@/assets/images/icons/artist.png"),
    handler: (router, track) => {
      const artistId = track.artists?.[0]?.id;
      if (artistId)
        router.push({
          pathname: "/(tabs)/library/artist/[id]",
          params: {
            id: artistId,
            source: "supabase",
            item: JSON.stringify(track.artists[0]),
          },
        });
    },
  },
];

export default function TrackScreen() {
  const { item, source } = useLocalSearchParams<{ item?: string; source?: string }>();
  const router = useRouter();
  const supabasePlayer = useSupabasePlayer();
  const [likeImage, setLikeImage] = useState(
    require("@/assets/images/icons/like_off.png")
  );
  const [downloadImage, setDownloadImage] = useState(
    require("@/assets/images/icons/download_off.png")
  );

  const isSupabase = source === "supabase" && item;
  const data = item ? JSON.parse(item as string) : null;

  const supabaseTrackInfo = useMemo(() => {
    if (!isSupabase || !data) return null;
    const song = data as SongWithArtists;
    const uri = song.song_url ?? "";
    return {
      name: song.title,
      artists: song.artists?.map((a) => a.name) ?? [],
      artistIds: song.artists?.map((a) => a.id) ?? [],
      albumArtUri: song.image_url ?? null,
      uri,
    };
  }, [isSupabase, data]);

  useEffect(() => {
    if (!data) return;
    if (isSupabase && supabaseTrackInfo?.uri) {
      supabasePlayer.play(supabaseTrackInfo).catch((err) =>
        console.warn("[TrackScreen] Supabase autoplay failed:", err?.message)
      );
    } else if (!isSupabase && data.id) {
      startPlayback({ uris: [`spotify:track:${data.id}`] }).catch((err) =>
        console.warn("Failed to autoplay track", err)
      );
    }
  }, [isSupabase, data?.id, supabaseTrackInfo?.uri]);

  const actions = useMemo(() => baseActions, []);

  if (!data) {
    return null;
  }

  const coverUri = isSupabase
    ? (data as SongWithArtists).image_url
    : (data as any).album?.images?.[0]?.url;
  const title = isSupabase ? (data as SongWithArtists).title : (data as any).name;
  const subtitle = isSupabase
    ? (data as SongWithArtists).artists?.[0]?.name
    : (data as any).artists?.[0]?.name;
  const metadata = isSupabase
    ? ["Créateur"]
    : [
        "Single",
        (data as any).album?.release_date?.split("-")[0],
        (data as any).album?.name,
      ].filter(Boolean);

  return (
    <Box style={styles.container}>
      <LibraryHero
        cover={
          <Image
            source={{ uri: coverUri ?? "https://via.placeholder.com/300" }}
            style={styles.heroCover}
          />
        }
        title={title}
        subtitle={subtitle}
        metadata={metadata}
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
        rightSlot={
          isSupabase ? (
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => supabasePlayer.togglePlayPause()}
            >
              <Image
                source={
                  supabasePlayer.state?.isPaused !== false
                    ? require("@/assets/images/icons/play.png")
                    : require("@/assets/images/icons/pause.png")
                }
                style={styles.playButtonIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ) : (
            <PlayPauseButton />
          )
        }
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
  playButton: {
    backgroundColor: "#1DB954",
    padding: 20,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonIcon: {
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
