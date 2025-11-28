import { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Box, Text } from "@/components/restyle";
import { getSavedTracks } from "@/query/library/getSavedTracks";
import { playSpotifyTrack } from "@/query/player/playSpotifyTrack";
import { getLocalDeviceId } from "@/query/player/getLocalDeviceId";
import { LibraryHero } from "@/components/ui/LibraryHero";
import { LibraryTrackRow } from "@/components/ui/LibraryTrackRow";
import useSpotifyPlayer from "@/hooks/Spotify/useSpotifyPlayer";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "https://api.spotify.com/v1";

type SavedTrack = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images?: { url: string }[] };
};

export const LikedSongs = () => {
  const [tracks, setTracks] = useState<SavedTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [downloadImage, setDownloadImage] = useState(
    require("@/assets/images/icons/download_off.png")
  );
  const [likeImage, setLikeImage] = useState(
    require("@/assets/images/icons/like_on.png")
  );
  const { state, togglePlayPause, refresh } = useSpotifyPlayer();
  const [isPlayingLikedSongs, setIsPlayingLikedSongs] = useState(false);

  useEffect(() => {
    const fetchLikedTracks = async () => {
      setIsLoading(true);
      try {
        const response = await getSavedTracks(50);
        setTracks(response.items ?? []);
      } catch (error) {
        console.error("Failed to load liked songs", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedTracks();
  }, []);

  // Surveiller l'état du player pour mettre à jour isPlayingLikedSongs
  useEffect(() => {
    if (!state || !tracks.length) return;

    const currentTrackUri = state.track?.uri;
    if (!currentTrackUri) {
      setIsPlayingLikedSongs(false);
      return;
    }

    const currentTrackId = currentTrackUri.replace("spotify:track:", "");
    const isPlaying =
      !state.isPaused && tracks.some((track) => track.id === currentTrackId);

    setIsPlayingLikedSongs(isPlaying);
  }, [state, tracks]);

  const handlePlayTrack = async (trackId: string) => {
    try {
      setPlayingId(trackId);
      const deviceId = await getLocalDeviceId();
      await playSpotifyTrack(trackId, deviceId ?? undefined);
    } catch (error: any) {
      Alert.alert(
        "Lecture impossible",
        error?.message ?? "Réessaie plus tard."
      );
    } finally {
      setPlayingId(null);
    }
  };

  const handlePlayPlaylist = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("spotify_access_token");
      if (!token) {
        Alert.alert("Erreur", "Token d'accès manquant");
        return;
      }

      const deviceId = await getLocalDeviceId();
      if (!deviceId) {
        Alert.alert("Erreur", "Aucun appareil disponible");
        return;
      }

      // Vérifier si on joue déjà un track de cette liste
      if (isPlayingLikedSongs) {
        // Si on joue déjà un track de la liste, toggle play/pause
        await togglePlayPause();
        return;
      }

      // Lancer toute la playlist "liked songs"
      // On utilise les URIs des tracks sauvegardés
      const trackUris = tracks.map((track) => `spotify:track:${track.id}`);

      if (trackUris.length === 0) {
        Alert.alert("Erreur", "Aucun titre liké à lire");
        return;
      }

      // Lancer la lecture avec tous les tracks
      const response = await fetch(
        `${API_BASE}/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: trackUris,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || "Impossible de lancer la lecture"
        );
      }

      // Rafraîchir l'état après avoir lancé la lecture
      setTimeout(() => refresh(), 500);
    } catch (error: any) {
      Alert.alert(
        "Lecture impossible",
        error?.message ?? "Réessaie plus tard."
      );
    }
  }, [tracks, isPlayingLikedSongs, togglePlayPause, refresh]);

  if (isLoading) {
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
          <Box style={styles.cover}>
            <Text style={styles.coverIcon}>♥</Text>
          </Box>
        }
        title="Liked Songs"
        subtitle={`${tracks.length} titres aimés`}
        actions={
          <>
            <TouchableOpacity
              onPress={() => {
                setLikeImage(
                  (prev: import("react-native").ImageSourcePropType) => {
                    return prev === require("@/assets/images/icons/like_on.png")
                      ? require("@/assets/images/icons/like_off.png")
                      : require("@/assets/images/icons/like_on.png");
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
        rightSlot={
          <TouchableOpacity
            style={styles.play_button}
            onPress={handlePlayPlaylist}
          >
            <Image
              source={
                isPlayingLikedSongs
                  ? require("@/assets/images/icons/pause.png")
                  : require("@/assets/images/icons/play.png")
              }
              style={styles.actionIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={tracks}
        keyExtractor={(track) => track.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <LibraryTrackRow
            title={item.name}
            subtitle={item.artists?.map((artist) => artist.name).join(", ")}
            imageUri={item.album?.images?.[0]?.url}
            fallbackColor="#4d2f9b"
            onPress={() => handlePlayTrack(item.id)}
            isActive={playingId === item.id}
            rightElement={
              <Image
                source={
                  playingId === item.id
                    ? require("@/assets/images/icons/play.png")
                    : require("@/assets/images/icons/more.png")
                }
                style={styles.rowIcon}
                resizeMode="contain"
              />
            }
          />
        )}
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  cover: {
    width: 225,
    height: 225,
    borderRadius: 32,
    backgroundColor: "#4d2f9b",
    justifyContent: "center",
    alignItems: "center",
  },
  coverIcon: {
    color: "#fff",
    fontSize: 72,
  },
  list: {
    paddingBottom: 150,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  play_button: {
    backgroundColor: "#1DB954",
    padding: 20,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
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
