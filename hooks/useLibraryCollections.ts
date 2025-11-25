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
        playlistsResult.status === "fulfilled" ? playlistsResult.value : [];
      const savedTracks =
        savedTracksResult.status === "fulfilled"
          ? savedTracksResult.value
          : { total: 0, items: [] };
      const albums =
        albumsResult.status === "fulfilled" ? albumsResult.value : [];
      const artists =
        artistsResult.status === "fulfilled" ? artistsResult.value : [];
      const shows = showsResult.status === "fulfilled" ? showsResult.value : [];

      const likedSongs: LibraryItem = {
        id: "liked-songs",
        type: "playlist",
        title: "Liked Songs",
        subtitle: `Playlist · ${savedTracks.total} titres`,
        accentColor: "#4d2f9b",
      };

      const playlistItems: LibraryItem[] = playlists.map((playlist: any) => ({
        id: playlist.id,
        type: "playlist",
        title: playlist.name,
        subtitle: `Playlist · ${playlist.tracks?.total ?? 0} titres`,
        image: playlist.images?.[0]?.url,
      }));

      const artistItems: LibraryItem[] = artists.map((artist: any) => ({
        id: artist.id,
        type: "artist",
        title: artist.name,
        subtitle: "Artist",
        image: artist.images?.[0]?.url,
      }));

      const albumItems: LibraryItem[] = albums.map((album: any) => ({
        id: album.id,
        type: "album",
        title: album.name,
        subtitle: `${album.artists?.[0]?.name ?? "Album"}`,
        image: album.images?.[0]?.url,
      }));

      const podcastItems: LibraryItem[] = shows.map((show: any) => ({
        id: show.id,
        type: "podcast",
        title: show.name,
        subtitle: `${show.publisher}`,
        image: show.images?.[0]?.url,
      }));

      setItems([
        likedSongs,
        ...playlistItems,
        ...artistItems,
        ...albumItems,
        ...podcastItems,
      ]);

      const rejectedMessages = [
        playlistsResult,
        savedTracksResult,
        albumsResult,
        artistsResult,
        showsResult,
      ]
        .filter(
          (result): result is PromiseRejectedResult =>
            result.status === "rejected"
        )
        .map((result) => result.reason?.message ?? "Erreur inconnue");

      setError(
        rejectedMessages.length
          ? `Certains contenus sont indisponibles (${rejectedMessages[0]})`
          : undefined
      );
    } catch (err: any) {
      setError(err.message ?? "Impossible de charger la bibliothèque");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const getFilteredItems = useCallback(
    (filter: LibraryFilter) => {
      if (filter === "all") {
        return items;
      }
      return items.filter((item) => item.type === filter);
    },
    [items]
  );

  return {
    items: useMemo(() => items, [items]),
    isLoading,
    error,
    refetch: fetchCollections,
    getFilteredItems,
  };
};
