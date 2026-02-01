import AsyncStorage from "@react-native-async-storage/async-storage";
import { stopSupabase } from "@/hooks/Player/playerCoordinator";
import { getLocalDeviceId } from "./getLocalDeviceId";

const API_BASE = "https://api.spotify.com/v1";

type StartPlaybackOptions = {
  contextUri?: string;
  uris?: string[];
  offsetUri?: string;
  offsetPosition?: number;
};

const activateDeviceIfNeeded = async (
  token: string,
  deviceId: string
): Promise<void> => {
  try {
    await fetch(`${API_BASE}/me/player/transfer`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ device_ids: [deviceId], play: false }),
    });
  } catch (error) {
    console.warn("[startPlayback] Impossible d'activer le device:", error);
  }
};

export const startPlayback = async (
  options: StartPlaybackOptions
): Promise<void> => {
  await stopSupabase();

  const token = await AsyncStorage.getItem("spotify_access_token");
  if (!token) throw new Error("Token Spotify manquant");

  const deviceId = await getLocalDeviceId();
  if (!deviceId) {
    throw new Error(
      "Aucun player Spotify local. Assure-toi que le Web Playback SDK est lancé."
    );
  }

  await activateDeviceIfNeeded(token, deviceId);

  let body: Record<string, any>;

  if (options.contextUri) {
    body = { context_uri: options.contextUri };
    if (options.offsetUri) {
      body.offset = { uri: options.offsetUri };
    } else if (typeof options.offsetPosition === "number") {
      body.offset = { position: options.offsetPosition };
    }
  } else if (options.uris && options.uris.length > 0) {
    body = { uris: options.uris };
  } else {
    throw new Error(
      "startPlayback nécessite un contextUri ou une liste d'URIs à jouer."
    );
  }

  const response = await fetch(
    `${API_BASE}/me/player/play?device_id=${deviceId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok && response.status !== 204) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(
      errorJson.error?.message ||
        `Impossible de lancer la lecture (${response.status})`
    );
  }
};
