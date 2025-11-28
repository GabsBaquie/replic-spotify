import React, { useMemo } from "react";
import { TouchableOpacity, Image, StyleSheet } from "react-native";
import { useLocalSearchParams, useSegments } from "expo-router";
import useSpotifyPlayer from "@/hooks/Spotify/useSpotifyPlayer";
import { startPlayback } from "@/query/player/startPlayback";

type PlayPauseButtonProps = {
  contextUri?: string;
  uris?: string[];
};

export default function PlayPauseButton({
  contextUri,
  uris,
}: PlayPauseButtonProps = {}) {
  const { item, id } = useLocalSearchParams<{ item?: string; id?: string }>();
  let data: any = null;
  if (item) {
    try {
      data = JSON.parse(item as string);
    } catch {}
  }
  const segments = useSegments() as string[];
  const isLikedSongs = segments.includes("liked-songs");

  const resolvedContextUri = useMemo(() => {
    if (contextUri) return contextUri;
    if (segments.includes("album") && data?.id) {
      return `spotify:album:${data.id}`;
    }
    if (segments.includes("artist") && id) {
      return `spotify:artist:${id}`;
    }
    if (segments.includes("playlist")) {
      const playlistId = id || data?.id;
      return playlistId ? `spotify:playlist:${playlistId}` : undefined;
    }
    if (isLikedSongs) {
      return "spotify:collection:tracks";
    }
    return undefined;
  }, [contextUri, data, id, isLikedSongs, segments]);

  const resolvedUris = useMemo(() => {
    if (uris?.length) {
      return uris;
    }
    if (segments.includes("track") && data?.uri) {
      return [data.uri];
    }
    if (segments.includes("track") && data?.id) {
      return [`spotify:track:${data.id}`];
    }
    return undefined;
  }, [data, segments, uris]);

  const { state, togglePlayPause, refresh } = useSpotifyPlayer();

  const isPlayingThisContext =
    !!state &&
    !state.isPaused &&
    ((resolvedContextUri && state.contextUri === resolvedContextUri) ||
      (resolvedUris && resolvedUris.includes(state.track.uri)) ||
      (isLikedSongs &&
        resolvedContextUri === "spotify:collection:tracks" &&
        state.contextUri === "spotify:collection:tracks"));

  const handlePress = async () => {
    if (isPlayingThisContext) {
      await togglePlayPause();
      return;
    }

    try {
      await startPlayback({
        contextUri: resolvedContextUri,
        uris: resolvedUris,
      });
      setTimeout(() => refresh(), 500);
    } catch (error) {
      console.warn("[PlayPauseButton] startPlayback error:", error);
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

