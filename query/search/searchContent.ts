import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchArtistsByName } from '@/lib/supabase/artists';
import { searchValidatedSongsByArtistName } from '@/lib/supabase/songs';
import type { Artist, SongWithArtists } from '@/lib/supabase';

export type SearchMixedResult = {
  spotify: {
    tracks?: { items: any[] };
    artists?: { items: any[] };
    albums?: { items: any[] };
    playlists?: { items: any[] };
  };
  supabase: {
    artists: Artist[];
    tracks: SongWithArtists[];
  };
};

export type SearchResultItem = {
  id: string;
  name: string;
  type: 'track' | 'artist' | 'album' | 'playlist';
  source: 'spotify' | 'supabase';
  imageUri: string | null;
  subtitle: string | null;
  raw: any;
};

export default async function searchContent(
  query: string,
  type = 'artist,album,track,playlist',
  limit = 10,
  offset = 5
) {
  const token = await AsyncStorage.getItem('spotify_access_token');
  if (!token) throw new Error('No access token');

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || 'Failed to fetch search results');
  }
  return data;
}

/**
 * Recherche mixte Spotify + Supabase : quand tu tapes le nom d'un artiste,
 * tu obtiens les résultats Spotify (artistes, albums, titres, playlists) et
 * les artistes / titres de la base Supabase (créateurs validés).
 */
export async function searchContentMixed(query: string): Promise<SearchMixedResult> {
  const trimmed = query.trim();
  const [spotifyResult, supabaseArtists, supabaseTracks] = await Promise.all([
    trimmed
      ? searchContent(trimmed, 'artist,album,track,playlist', 10, 0).catch((err) => {
          console.warn('[searchContentMixed] Spotify search failed:', err?.message);
          return { tracks: { items: [] }, artists: { items: [] }, albums: { items: [] }, playlists: { items: [] } };
        })
      : Promise.resolve({ tracks: { items: [] }, artists: { items: [] }, albums: { items: [] }, playlists: { items: [] } }),
    trimmed
      ? searchArtistsByName(trimmed).catch((err) => {
          console.warn('[searchContentMixed] Supabase artists search failed:', err?.message);
          return [] as Artist[];
        })
      : Promise.resolve([] as Artist[]),
    trimmed
      ? searchValidatedSongsByArtistName(trimmed).catch((err) => {
          console.warn('[searchContentMixed] Supabase songs search failed:', err?.message);
          return [] as SongWithArtists[];
        })
      : Promise.resolve([] as SongWithArtists[]),
  ]);

  return {
    spotify: {
      tracks: spotifyResult.tracks,
      artists: spotifyResult.artists,
      albums: spotifyResult.albums,
      playlists: spotifyResult.playlists,
    },
    supabase: {
      artists: supabaseArtists,
      tracks: supabaseTracks,
    },
  };
}

/**
 * Score de pertinence pour le tri (plus petit = meilleur match).
 * 0 = nom exact, 1 = nom commence par la requête, 2 = nom contient, 3 = sous-titre contient, 4 = autre.
 */
function relevanceScore(item: SearchResultItem, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 4;
  const name = (item.name ?? '').toLowerCase();
  const subtitle = (item.subtitle ?? '').toLowerCase();
  if (name === q) return 0;
  if (name.startsWith(q)) return 1;
  if (name.includes(q)) return 2;
  if (subtitle.includes(q)) return 3;
  return 4;
}

/**
 * Transforme le résultat mixte en une liste unifiée, triée par pertinence (meilleurs matchs en premier).
 * Ignore les entrées null/undefined (Spotify peut en renvoyer pour des titres indisponibles).
 */
export function flattenMixedSearchToItems(
  result: SearchMixedResult,
  query: string = ''
): SearchResultItem[] {
  const items: SearchResultItem[] = [];
  const spotify = result.spotify;
  const supabase = result.supabase;

  (spotify.tracks?.items ?? []).forEach((item) => {
    if (!item?.id) return;
    items.push({
      id: item.id,
      name: item.name ?? '',
      type: 'track',
      source: 'spotify',
      imageUri: item.album?.images?.[0]?.url ?? null,
      subtitle: item.artists?.[0]?.name ?? null,
      raw: item,
    });
  });
  (spotify.albums?.items ?? []).forEach((item) => {
    if (!item?.id) return;
    items.push({
      id: item.id,
      name: item.name ?? '',
      type: 'album',
      source: 'spotify',
      imageUri: item.images?.[0]?.url ?? null,
      subtitle: item.artists?.[0]?.name ?? null,
      raw: item,
    });
  });
  (spotify.artists?.items ?? []).forEach((item) => {
    if (!item?.id) return;
    items.push({
      id: item.id,
      name: item.name ?? '',
      type: 'artist',
      source: 'spotify',
      imageUri: item.images?.[0]?.url ?? null,
      subtitle: 'Artist',
      raw: item,
    });
  });
  (spotify.playlists?.items ?? []).forEach((item) => {
    if (!item?.id) return;
    items.push({
      id: item.id,
      name: item.name ?? '',
      type: 'playlist',
      source: 'spotify',
      imageUri: item.images?.[0]?.url ?? null,
      subtitle: item.owner?.display_name ?? null,
      raw: item,
    });
  });
  (supabase.artists ?? []).forEach((artist) => {
    if (!artist?.id) return;
    items.push({
      id: artist.id,
      name: artist.name ?? '',
      type: 'artist',
      source: 'supabase',
      imageUri: artist.image_url ?? null,
      subtitle: 'Créateur',
      raw: artist,
    });
  });
  (supabase.tracks ?? []).forEach((song) => {
    if (!song?.id) return;
    const artistName = song.artists?.[0]?.name ?? 'Artiste';
    items.push({
      id: song.id,
      name: song.title ?? '',
      type: 'track',
      source: 'supabase',
      imageUri: song.image_url ?? null,
      subtitle: artistName,
      raw: song,
    });
  });

  const q = query.trim();
  if (q) {
    items.sort((a, b) => {
      const scoreA = relevanceScore(a, q);
      const scoreB = relevanceScore(b, q);
      if (scoreA !== scoreB) return scoreA - scoreB;
      return 0;
    });
  }

  return items;
}