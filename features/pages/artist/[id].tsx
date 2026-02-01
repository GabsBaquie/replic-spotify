import React, { useCallback, useEffect, useState } from "react";
import useArtist from "@/hooks/Spotify/useArtist";
import { Box } from "@/components/restyle";
import {
  View,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import PlayPauseButton from "@/components/ui/PlayPauseButton";
import { LibraryHero } from "@/components/ui/LibraryHero";
import { LibraryTrackRow } from "@/components/ui/LibraryTrackRow";
import { startPlayback } from "@/query/player/startPlayback";
import { getSongsByArtistId } from "@/lib/supabase";
import type { Artist } from "@/lib/supabase";
import type { SongWithArtists } from "@/lib/supabase";

export default function ArtistScreen() {
  const { id, source, item: itemParam } = useLocalSearchParams<{
    id: string;
    source?: string;
    item?: string;
  }>();
  const router = useRouter();
  const spotify = useArtist(source === "supabase" ? undefined : id);

  const [supabaseArtist, setSupabaseArtist] = useState<Artist | null>(null);
  const [supabaseTracks, setSupabaseTracks] = useState<SongWithArtists[]>([]);
  const [supabaseLoading, setSupabaseLoading] = useState(false);

  useEffect(() => {
    if (source !== "supabase" || !itemParam) return;
    try {
      const artist = JSON.parse(itemParam) as Artist;
      setSupabaseArtist(artist);
      setSupabaseLoading(true);
      getSongsByArtistId(artist.id)
        .then(setSupabaseTracks)
        .catch((err) => {
          console.warn("[ArtistScreen] getSongsByArtistId failed:", err?.message);
          setSupabaseTracks([]);
        })
        .finally(() => setSupabaseLoading(false));
    } catch {
      setSupabaseArtist(null);
      setSupabaseTracks([]);
    }
  }, [source, itemParam]);

  const isSupabase = source === "supabase" && supabaseArtist;
  const artistDetails = isSupabase
    ? {
        name: supabaseArtist.name,
        images: supabaseArtist.image_url ? [{ url: supabaseArtist.image_url }] : [],
      }
    : spotify.artist;
  const tracks = isSupabase ? supabaseTracks : spotify.tracks;
  const loading = isSupabase ? supabaseLoading : spotify.loading;

  const handlePlaySpotify = useCallback(async (trackId: string) => {
    try {
      await startPlayback({ uris: [`spotify:track:${trackId}`] });
    } catch (error: any) {
      Alert.alert("Lecture impossible", error?.message ?? "Réessaie plus tard.");
    }
  }, []);

  const handlePlaySupabaseTrack = useCallback(
    (song: SongWithArtists) => {
      router.push({
        pathname: "/(tabs)/library/track/[id]",
        params: { id: song.id, source: "supabase", item: JSON.stringify(song) },
      });
    },
    [router]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!artistDetails) {
    return (
      <View style={styles.centered}>
        <Image
          source={require("@/assets/images/icons/artist.png")}
          style={styles.placeholderIcon}
        />
      </View>
    );
  }

  return (
    <Box style={styles.container}>
      <LibraryHero
        cover={
          <Image
            source={{
              uri:
                (artistDetails as any).images?.[0]?.url ??
                (artistDetails as any).image_url ??
                "https://via.placeholder.com/300",
            }}
            style={styles.heroCover}
          />
        }
        title={artistDetails.name}
        subtitle={
          isSupabase ? "Créateur" : (artistDetails as any).followers
            ? `${(artistDetails as any).followers.total.toLocaleString()} followers`
            : undefined
        }
        metadata={isSupabase ? undefined : (artistDetails as any).genres?.slice(0, 2)}
        actions={
          <>
            <TouchableOpacity>
              <Image
                source={require("@/assets/images/icons/like_off.png")}
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

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (isSupabase) {
            const song = item as SongWithArtists;
            return (
              <LibraryTrackRow
                title={song.title}
                subtitle={song.artists?.[0]?.name ?? ""}
                imageUri={song.image_url ?? undefined}
                onPress={() => handlePlaySupabaseTrack(song)}
                rightElement={
                  <Image
                    source={require("@/assets/images/icons/more.png")}
                    style={styles.rowIcon}
                    resizeMode="contain"
                  />
                }
              />
            );
          }
          const spotifyTrack = item as { id: string; name: string; album?: { name?: string; images?: { url: string }[] } };
          return (
            <LibraryTrackRow
              title={spotifyTrack.name}
              subtitle={spotifyTrack.album?.name}
              imageUri={spotifyTrack.album?.images?.[0]?.url}
              onPress={() => handlePlaySpotify(spotifyTrack.id)}
              rightElement={
                <Image
                  source={require("@/assets/images/icons/more.png")}
                  style={styles.rowIcon}
                  resizeMode="contain"
                />
              }
            />
          );
        }}
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
    paddingBottom: 150,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    width: 48,
    height: 48,
    tintColor: "#555",
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
  separator: {
    height: 8,
  },
});
