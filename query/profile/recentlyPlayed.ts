import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Récupère les pistes récemment écoutées par l'utilisateur.
 * @param limit Nombre maximum d'éléments à récupérer
 */
export default async function getRecentlyPlayed(limit = 10) {
  const token = await AsyncStorage.getItem("spotify_access_token");
  if (!token) throw new Error("No Spotify access token found");

  const res = await fetch(
    `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error?.message || `Failed to fetch recently played (${res.status})`
    );
  }

  // Retourne les items avec played_at pour le tri
  return Array.isArray(data.items)
    ? data.items.map((item: any) => ({
        track: item.track,
        played_at: item.played_at,
      }))
    : [];
}
