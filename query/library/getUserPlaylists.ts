import AsyncStorage from "@react-native-async-storage/async-storage";

export const getUserPlaylists = async (limit = 50) => {
  const token = await AsyncStorage.getItem("spotify_access_token");
  if (!token) throw new Error("No Spotify access token found");

  const allPlaylists: any[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
  const response = await fetch(
      `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Failed to fetch playlists");
  }

    const items = data.items ?? [];
    allPlaylists.push(...items);

    // Vérifier s'il y a plus de playlists à récupérer
    hasMore = items.length === limit && data.next !== null;
    offset += limit;
  }

  return allPlaylists;
};
