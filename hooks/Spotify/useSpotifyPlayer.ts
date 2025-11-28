import { useCallback, useEffect, useState } from "react";
import { remote } from "react-native-spotify-remote";
import type RemotePlayerState from "react-native-spotify-remote/dist/PlayerState";
import { ensureSpotifyRemoteSession } from "@/lib/spotify/remoteSession";

export type TrackInfo = {
  name: string;
  artists: string[];
  artistIds: string[];
  albumArtUri: string | null;
  uri: string;
};

export type PlayerState = {
  playbackPosition: number;
  trackDuration: number;
  isPaused: boolean;
  track: TrackInfo;
  contextUri: string | null;
};

const mapRemoteState = (playerState: RemotePlayerState): PlayerState => ({
  playbackPosition: playerState.position,
  trackDuration: playerState.duration,
  isPaused: playerState.isPaused,
  track: {
    name: playerState.track.name,
    artists: playerState.track.artist?.name
      ? [playerState.track.artist.name]
      : [],
    artistIds: playerState.track.artist?.uri
      ? [playerState.track.artist.uri]
      : [],
    albumArtUri: playerState.track.imageUri ?? null,
    uri: playerState.track.uri,
  },
  contextUri: playerState.contextUri ?? null,
});

export default function useSpotifyPlayer() {
  const [state, setState] = useState<PlayerState | null>(null);

  const refresh = useCallback(async () => {
    try {
      await ensureSpotifyRemoteSession();
      const remoteState = await remote.getPlayerState();
      setState(mapRemoteState(remoteState));
    } catch (error) {
      console.warn("[useSpotifyPlayer] refresh error:", error);
      setState(null);
    }
  }, []);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const connect = async () => {
      try {
        await ensureSpotifyRemoteSession();
        const currentState = await remote.getPlayerState();
        setState(mapRemoteState(currentState));

        subscription = remote.addListener("playerStateChanged", (player) => {
          setState(mapRemoteState(player));
        });
      } catch (error) {
        console.warn("[useSpotifyPlayer] connexion impossible:", error);
        setState(null);
      }
    };

    connect();
    return () => {
      subscription?.remove();
    };
  }, []);

  const play = useCallback(
    async (uri: string, position?: number) => {
      await ensureSpotifyRemoteSession();
      await remote.playUri(uri);
      if (typeof position === "number" && position > 0) {
        await remote.seek(position);
      }
      await refresh();
    },
    [refresh]
  );

  const pause = useCallback(async () => {
    await ensureSpotifyRemoteSession();
    await remote.pause();
    await refresh();
  }, [refresh]);

  const resume = useCallback(async () => {
    await ensureSpotifyRemoteSession();
    await remote.resume();
    await refresh();
  }, [refresh]);

  const togglePlayPause = useCallback(async () => {
    if (!state) return;
    if (state.isPaused) {
      await resume();
    } else {
      await pause();
    }
  }, [pause, resume, state]);

  return {
    state,
    play,
    pause,
    resume,
    togglePlayPause,
    refresh,
  };
}
