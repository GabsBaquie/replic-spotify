import AsyncStorage from "@react-native-async-storage/async-storage";

export const getSavedTracks = async (limit = 50) => {
  const token = await AsyncStorage.getItem("spotify_access_token");
  if (!token) throw new Error("No Spotify access token found");

  const response = await fetch(
    `https://api.spotify.com/v1/me/tracks?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Failed to fetch saved tracks");
  }

  return {
    total: data.total ?? data.items?.length ?? 0,
    items: Array.isArray(data.items)
      ? data.items.map((entry: any) => entry.track)
      : [],
  };
};
