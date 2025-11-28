import React from "react";
import { TouchableOpacity, Image, StyleSheet } from "react-native";
import { useLocalSearchParams, useSegments } from "expo-router";
import useSpotifyPlayer from "@/hooks/Spotify/useSpotifyPlayer";
import { startPlayback } from "@/query/player/startPlayback";

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
    // toggle play/pause for this URI
    if (isPlayingThisContext) {
      // currently playing this URI, so pause
      await togglePlayPause();
      return;
    }

    try {
      if (isLikedSongs && trackUris && trackUris.length > 0) {
        await startPlayback({ uris: trackUris });
      } else if (targetUri) {
        if (segments.includes("track")) {
          await startPlayback({ uris: [targetUri] });
        } else if (
          segments.includes("album") ||
          segments.includes("playlist")
        ) {
          await startPlayback({ contextUri: targetUri });
        } else {
          await startPlayback(
            trackUris && trackUris.length > 0
              ? { uris: trackUris }
              : { contextUri: targetUri }
          );
        }
      } else {
        console.warn("[PlayPauseButton] Aucun targetUri ou trackUris fourni.");
        return;
      }

      // Rafraîchir l'état après avoir lancé la lecture
      setTimeout(() => refresh(), 500);
    } catch (error) {
      console.error("[PlayPauseButton] startPlayback error:", error);
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
