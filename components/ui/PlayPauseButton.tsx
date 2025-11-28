import React from "react";
import { TouchableOpacity, Image, StyleSheet } from "react-native";
import { useLocalSearchParams, useSegments } from "expo-router";
import useSpotifyPlayer from "@/hooks/Spotify/useSpotifyPlayer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocalDeviceId } from "@/query/player/getLocalDeviceId";

const API_BASE = "https://api.spotify.com/v1";

type PlayPauseButtonProps = {
  trackUris?: string[]; // Pour liked songs: liste des URIs des tracks
};

export default function PlayPauseButton({
  trackUris,
}: PlayPauseButtonProps = {}) {
  // read optional track or artist context from route params
  const { item, id } = useLocalSearchParams<{ item?: string; id?: string }>();
  let data: any = null;
  if (item) {
    try {
      data = JSON.parse(item as string);
    } catch {}
  }
  const segments = useSegments() as string[];
  const isLikedSongs = segments.includes("liked-songs");

  // determine the desired playback URI (track or context)
  let targetUri: string | null = null;
  if (segments.includes("track") && data?.uri) {
    targetUri = data.uri;
  } else if (segments.includes("album") && data?.id) {
    targetUri = `spotify:album:${data.id}`;
  } else if (segments.includes("artist") && id) {
    targetUri = `spotify:artist:${id}`;
  } else if (segments.includes("playlist")) {
    // Pour les playlists, utiliser id depuis les params ou depuis data
    const playlistId = id || data?.id;
    if (playlistId) {
      targetUri = `spotify:playlist:${playlistId}`;
    }
  }
  const { state, togglePlayPause, refresh } = useSpotifyPlayer();

  // Pour liked songs, vérifier si un track de la liste est en cours de lecture
  const isPlayingLikedSongs =
    isLikedSongs &&
    trackUris &&
    state &&
    !state.isPaused &&
    state.track?.uri &&
    trackUris.includes(state.track.uri);

  // check if current playback matches this URI and is playing
  const isPlayingThisContext =
    !!state &&
    !state.isPaused &&
    (isPlayingLikedSongs ||
      (segments.includes("track") && state.track.uri === targetUri) ||
      (!segments.includes("track") &&
        !isLikedSongs &&
        state.contextUri === targetUri));

  const handlePress = async () => {
    const token = await AsyncStorage.getItem("spotify_access_token");
    if (!token) return;
    const deviceId = await getLocalDeviceId();
    if (!deviceId) return;

    // toggle play/pause for this URI
    if (isPlayingThisContext) {
      // currently playing this URI, so pause
      await togglePlayPause();
    } else {
      // build request body: track URIs for single track, else context playback with offset for albums
      let body: any;
      if (isLikedSongs && trackUris && trackUris.length > 0) {
        // Pour liked songs, utiliser les URIs des tracks
        body = { uris: trackUris };
      } else if (!targetUri) {
        // Si pas de targetUri et pas de trackUris, on ne peut pas lancer
        return;
      } else if (segments.includes("track")) {
        // for track pages, play the individual track URI
        body = { uris: [targetUri] };
      } else if (segments.includes("album")) {
        // for album pages, play entire album starting at first track
        body = { context_uri: targetUri, offset: { position: 0 } };
      } else {
        // for other contexts (artist, playlist), play context at default
        body = { context_uri: targetUri };
      }

      await fetch(`${API_BASE}/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      // Rafraîchir l'état après avoir lancé la lecture
      setTimeout(() => refresh(), 500);
    }
  };

  return (
    <TouchableOpacity style={styles.play_button} onPress={handlePress}>
      <Image
        source={
          isPlayingThisContext
            ? require("@/assets/images/icons/pause.png")
            : require("@/assets/images/icons/play.png")
        }
        style={styles.icon}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  play_button: {
    backgroundColor: "#1DB954",
    padding: 20,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 20,
    height: 20,
  },
});
