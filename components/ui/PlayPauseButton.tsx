import React from "react";
import { TouchableOpacity, Image, StyleSheet } from "react-native";
import { useLocalSearchParams, useSegments } from "expo-router";
import useSpotifyPlayer from "@/hooks/Spotify/useSpotifyPlayer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocalDeviceId } from "@/query/player/getLocalDeviceId";

const API_BASE = "https://api.spotify.com/v1";

export default function PlayPauseButton() {
  // read optional track or artist context from route params
  const { item, id } = useLocalSearchParams<{ item?: string; id?: string }>();
  let data: any = null;
  if (item) {
    try {
      data = JSON.parse(item as string);
    } catch {}
  }
  const segments = useSegments() as string[];
  // determine the desired playback URI (track or context)
  let targetUri: string | null = null;
  if (segments.includes("track") && data?.uri) {
    targetUri = data.uri;
  } else if (segments.includes("album") && data?.id) {
    targetUri = `spotify:album:${data.id}`;
  } else if (segments.includes("artist") && id) {
    targetUri = `spotify:artist:${id}`;
  } else if (segments.includes("playlist") && id) {
    targetUri = `spotify:playlist:${id}`;
  }
  const { state, togglePlayPause, refresh } = useSpotifyPlayer();
  // check if current playback matches this URI and is playing
  const isPlayingThisContext =
    !!state &&
    !state.isPaused &&
    ((segments.includes("track") && state.track.uri === targetUri) ||
      (!segments.includes("track") && state.contextUri === targetUri));

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
      // start playback for this URI
      if (!targetUri) return;

      // build request body: track URIs for single track, else context playback with offset for albums
      let body: any;
      if (segments.includes("track")) {
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
