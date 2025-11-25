import AsyncStorage from "@react-native-async-storage/async-storage";

export const getSavedAlbums = async (limit = 20) => {
  const token = await AsyncStorage.getItem("spotify_access_token");
  if (!token) throw new Error("No Spotify access token found");

  const response = await fetch(
    `https://api.spotify.com/v1/me/albums?limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Failed to fetch albums");
  }

  return Array.isArray(data.items)
    ? data.items.map((entry: any) => entry.album)
    : [];
};
