import AsyncStorage from '@react-native-async-storage/async-storage';

export default async function getTopArtists(limit = 10) {
  const token = await AsyncStorage.getItem('spotify_access_token');
  if (!token) throw new Error('No access token');

  // 🔥 Appel API Top Artists
  const res = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || 'Failed to fetch top artists');
  }

  // ✅ Si des top artistes sont présents
  if (data.items?.length > 0) return { type: 'top', data: data.items };

  // Fallback: Get categories
  const catRes = await fetch(
    `https://api.spotify.com/v1/browse/categories?limit=${limit}&locale=fr_FR`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const catRaw = await catRes.json();

  console.log(catRaw.categories.items)

  if (!catRes.ok) {
    throw new Error(catRaw?.error?.message || 'Failed to fetch categories');
  }

  const categoriesWithImages = catRaw.categories.items.map((cat: any) => ({
    ...cat,
    images: cat.icons,
  }));

  return { type: 'categories', data: categoriesWithImages };
}