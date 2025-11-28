import { useCallback, useEffect, useMemo, useState } from "react";
import { getUserPlaylists } from "@/query/library/getUserPlaylists";
import { getSavedTracks } from "@/query/library/getSavedTracks";
import { getSavedAlbums } from "@/query/library/getSavedAlbums";
import { getFollowedArtists } from "@/query/library/getFollowedArtists";
import { getSavedShows } from "@/query/library/getSavedShows";

export type LibraryFilter = "all" | "playlist" | "artist" | "album" | "podcast";

export type LibraryItem = {
  id: string;
  type: "playlist" | "artist" | "album" | "podcast";
  title: string;
  subtitle: string;
  image?: string;
  accentColor?: string;
  payload?: unknown;
};

type UseLibraryCollectionsState = {
  items: LibraryItem[];
  isLoading: boolean;
  error?: string;
  refetch: () => void;
  getFilteredItems: (filter: LibraryFilter) => LibraryItem[];
};

export const useLibraryCollections = (): UseLibraryCollectionsState => {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  const fetchCollections = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        playlistsResult,
        savedTracksResult,
        albumsResult,
        artistsResult,
        showsResult,
      ] = await Promise.allSettled([
        getUserPlaylists(),
        getSavedTracks(),
        getSavedAlbums(),
        getFollowedArtists(),
        getSavedShows(),
      ]);

      const playlists =
        playlistsResult.status === "fulfilled"
          ? playlistsResult.value.map((p: any) => ({
              id: p.id,
              type: "playlist" as const,
              title: p.name,
              subtitle: `${p.tracks?.total || 0} titres`,
              image: p.images?.[0]?.url,
              payload: p,
            }))
          : [];

      const savedTracksValue =
        savedTracksResult.status === "fulfilled"
          ? savedTracksResult.value
          : null;
      const savedTracksCount =
        (savedTracksValue as any)?.items?.length ||
        (Array.isArray(savedTracksValue) ? savedTracksValue.length : 0) ||
        0;

      const savedTracks =
        savedTracksResult.status === "fulfilled"
          ? [
              {
                id: "saved-tracks",
                type: "playlist" as const,
                title: "Titres likés",
                subtitle: `${savedTracksCount} titres`,
                image: undefined,
                payload: savedTracksValue,
              },
            ]
          : [];

      const albums =
        albumsResult.status === "fulfilled"
          ? albumsResult.value.map((a: any) => ({
              id: a.album.id,
              type: "album" as const,
              title: a.album.name,
              subtitle: a.album.artists
                ?.map((artist: any) => artist.name)
                .join(", "),
              image: a.album.images?.[0]?.url,
              payload: a.album,
            }))
          : [];

      const artists =
        artistsResult.status === "fulfilled"
          ? artistsResult.value.map((a: any) => ({
              id: a.id,
              type: "artist" as const,
              title: a.name,
              subtitle: "Artiste",
              image: a.images?.[0]?.url,
              payload: a,
            }))
          : [];

      const shows =
        showsResult.status === "fulfilled"
          ? showsResult.value.map((s: any) => ({
              id: s.show.id,
              type: "podcast" as const,
              title: s.show.name,
              subtitle: s.show.publisher,
              image: s.show.images?.[0]?.url,
              payload: s.show,
            }))
          : [];

      setItems([...playlists, ...savedTracks, ...albums, ...artists, ...shows]);
      setError(undefined);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const getFilteredItems = useMemo(
    () => (filter: LibraryFilter) => {
      if (filter === "all") return items;
      return items.filter((item) => item.type === filter);
    },
    [items]
  );

  return {
    items,
    isLoading,
    error,
    refetch: fetchCollections,
    getFilteredItems,
  };
};
