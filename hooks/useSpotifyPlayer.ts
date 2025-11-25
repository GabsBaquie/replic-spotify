import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

      const json = await res.json();
      if (!json.item) {
        setState(null);
        return;
      }
      const item = json.item as any;
      setState({
        playbackPosition: json.progress_ms as number,
        trackDuration: item.duration_ms as number,
        isPaused: !json.is_playing,
        track: {
          name: item.name,
          artists: Array.isArray(item.artists)
            ? item.artists.map((a: any) => a.name)
            : [],
          artistIds: Array.isArray(item.artists)
            ? item.artists.map((a: any) => a.id)
            : [],
          albumArtUri: item.album?.images?.[0]?.url || null,
          uri: item.uri,
        },
        contextUri: json.context?.uri || null,
      });
    } catch (e) {
      console.error("useSpotifyPlayer fetchState error:", e);
      setState(null);
    }
  };

  useEffect(() => {
    fetchState();
    const id = setInterval(fetchState, 500);
    return () => clearInterval(id);
  }, []);

  const togglePlayPause = async () => {
    if (!state) return;
    try {
      const token = await AsyncStorage.getItem("spotify_access_token");
      if (!token) throw new Error("Token Spotify manquant");
      const deviceId = await getLocalDeviceId();
      if (!deviceId) throw new Error("Aucun appareil Spotify trouvé");

      if (state.isPaused) {
        // ▶︎ Reprendre la lecture à la position courante
        const resumeUrl = `${API_BASE}/me/player/play?device_id=${deviceId}`;
        const resumeRes = await fetch(resumeUrl, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (![204, 202].includes(resumeRes.status)) {
          const errJson = await resumeRes.json().catch(() => ({}));
          throw new Error(
            errJson.error?.message || `Erreur ${resumeRes.status}`
          );
        }
      } else {
        // ⏸︎ Mettre en pause en transférant avec play: false
        const transferUrl = `${API_BASE}/me/player`;
        const res = await fetch(transferUrl, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            device_ids: [deviceId],
            play: false,
          }),
        });
        if (![204, 202].includes(res.status)) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error?.message || `Erreur ${res.status}`);
        }
      }
    } finally {
      await fetchState();
    }
  };

  return { state, togglePlayPause };
}
