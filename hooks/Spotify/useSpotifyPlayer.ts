import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerSpotifyPause } from "@/hooks/Player/playerCoordinator";
import { getLocalDeviceId } from "@/query/player/getLocalDeviceId";

const API_BASE = "https://api.spotify.com/v1";

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

/**
 * Hook pour piloter et récupérer l'état du playback Spotify.
 */
export default function useSpotifyPlayer() {
  const [state, setState] = useState<PlayerState | null>(null);

  const fetchState = async () => {
    try {
      const token = await AsyncStorage.getItem("spotify_access_token");
      if (!token) throw new Error("Token Spotify manquant");

      const res = await fetch(`${API_BASE}/me/player`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 204 || res.status === 404) {
          setState(null);
          return;
        }
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Erreur ${res.status}`);
      }

      if (res.status === 204) {
        setState(null);
        return;
      }

      const data = await res.json();

      if (!data.item) {
        setState(null);
        return;
      }

      const track: TrackInfo = {
        name: data.item.name,
        artists: data.item.artists.map((a: any) => a.name),
        artistIds: data.item.artists.map((a: any) => a.id),
        albumArtUri:
          data.item.album?.images?.[0]?.url ||
          data.item.album?.images?.[1]?.url ||
          null,
        uri: data.item.uri,
      };

      setState({
        playbackPosition: data.progress_ms || 0,
        trackDuration: data.item.duration_ms || 0,
        isPaused: data.is_playing === false,
        track,
        contextUri: data.context?.uri || null,
      });
    } catch (error: any) {
      console.error("[useSpotifyPlayer] fetchState error:", error);
      setState(null);
    }
  };

  const play = async (uri: string, position?: number) => {
    try {
      const token = await AsyncStorage.getItem("spotify_access_token");
      if (!token) throw new Error("Token Spotify manquant");

      const deviceId = await getLocalDeviceId();

      await fetch(`${API_BASE}/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [uri],
          position_ms: position || 0,
        }),
      });

      await fetchState();
    } catch (error: any) {
      console.error("[useSpotifyPlayer] play error:", error);
      throw error;
    }
  };

  const pause = async () => {
    try {
      const token = await AsyncStorage.getItem("spotify_access_token");
      if (!token) throw new Error("Token Spotify manquant");

      const deviceId = await getLocalDeviceId();

      await fetch(`${API_BASE}/me/player/pause?device_id=${deviceId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchState();
    } catch (error: any) {
      console.error("[useSpotifyPlayer] pause error:", error);
      throw error;
    }
  };

  const resume = async () => {
    try {
      const token = await AsyncStorage.getItem("spotify_access_token");
      if (!token) throw new Error("Token Spotify manquant");

      const deviceId = await getLocalDeviceId();

      await fetch(`${API_BASE}/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchState();
    } catch (error: any) {
      console.error("[useSpotifyPlayer] resume error:", error);
      throw error;
    }
  };

  const togglePlayPause = async () => {
    if (!state) return;

    if (state.isPaused) {
      await resume();
    } else {
      await pause();
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    registerSpotifyPause(pause);
    return () => registerSpotifyPause(null);
  }, [pause]);

  return {
    state,
    play,
    pause,
    resume,
    togglePlayPause,
    refresh: fetchState,
  };
}
