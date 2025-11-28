// query/player/getLocalDeviceId.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "https://api.spotify.com/v1";

/**
 * Tente de renvoyer l'ID du device Spotify Connect local :
 * 1) Si un device_id était déjà stocké et qu'il est toujours présent, on le renvoie.
 * 2) Sinon, on recherche dans la liste : « MonAppRN » → actif → Smartphone → premier → null.
 * 3) On stocke en AsyncStorage le nouvel ID choisi, ou on retourne null si aucun device.
 *
 * @returns {Promise<string | null>} L'ID du device, ou null si aucun device n'est disponible.
 */
export async function getLocalDeviceId(): Promise<string | null> {
  // 1) Récupérer le token Spotify
  const token = await AsyncStorage.getItem("spotify_access_token");
  if (!token) {
    throw new Error("Aucun token Spotify trouvé dans AsyncStorage.");
  }

  // 2) Lire l'ID précédemment stocké (le cas échéant)
  const storedDeviceId = await AsyncStorage.getItem("spotify_device_id");

  // 3) Récupérer la liste des appareils via l'API Web
  const response = await fetch(`${API_BASE}/me/player/devices`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Impossible de récupérer les appareils : ${
        err.error?.message || response.status
      }`
    );
  }

  const json = await response.json();
  const devices: {
    id: string;
    is_active: boolean;
    type: string;
    name: string;
  }[] = Array.isArray(json.devices) ? json.devices : [];

  // 4) Chercher en priorité le device de la WebView
  const webPlayer = devices.find((d) => d.name === "MonAppRN");
  if (webPlayer) {
    await AsyncStorage.setItem("spotify_device_id", webPlayer.id);
    return webPlayer.id;
  }

  // 5) Si on avait un device stocké mais plus disponible, on le supprime
  if (storedDeviceId) {
    await AsyncStorage.removeItem("spotify_device_id");
  }

  // 6) Aucun player Web disponible -> on ne renvoie rien pour éviter de piloter d'autres devices
  return null;
}
