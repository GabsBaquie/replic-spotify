import { useCallback, useEffect, useMemo, useState } from "react";
import { getUserPlaylists } from "@/query/library/getUserPlaylists";
import { getSavedTracks } from "@/query/library/getSavedTracks";
import { getSavedAlbums } from "@/query/library/getSavedAlbums";
import { getFollowedArtists } from "@/query/library/getFollowedArtists";
import { getSavedShows } from "@/query/library/getSavedShows";
import getRecentlyPlayed from "@/query/profile/recentlyPlayed";

export type LibraryFilter = "all" | "playlist" | "artist" | "album" | "podcast";

export type LibraryItem = {
  id: string;
  type: "playlist" | "artist" | "album" | "podcast";
  title: string;
  subtitle: string;
  image?: string;
  accentColor?: string;
  payload?: unknown;
  lastPlayedAt?: string;
  addedAt?: string;
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
        recentlyPlayedResult,
      ] = await Promise.allSettled([
        getUserPlaylists(),
        getSavedTracks(),
        getSavedAlbums(),
        getFollowedArtists(),
        getSavedShows(),
        getRecentlyPlayed(50), // Récupérer plus de tracks pour avoir plus de contexte
      ]);

      // Créer un mapping des items récemment écoutés
      const recentlyPlayedData =
        recentlyPlayedResult.status === "fulfilled"
          ? recentlyPlayedResult.value
          : [];

      // Extraire les IDs des albums, artists et playlists récemment écoutés
      const recentlyPlayedAlbums = new Set<string>();
      const recentlyPlayedArtists = new Set<string>();

      recentlyPlayedData.forEach((item: any) => {
        if (item.track?.album?.id) {
          recentlyPlayedAlbums.add(item.track.album.id);
        }
        if (item.track?.artists) {
          item.track.artists.forEach((artist: any) => {
            if (artist.id) {
              recentlyPlayedArtists.add(artist.id);
            }
          });
        }
      });

      const playlists =
        playlistsResult.status === "fulfilled"
          ? playlistsResult.value
              .filter((p: any) => p?.id)
              .map((p: any) => ({
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
          ? albumsResult.value
              .filter((a: any) => a?.album?.id)
              .map((a: any) => {
                const albumId = a.album.id;
                // Trouver la date de dernière écoute pour cet album
                const recentlyPlayedItem = recentlyPlayedData.find(
                  (item: any) => item.track?.album?.id === albumId
                );
                return {
                  id: albumId,
                  type: "album" as const,
                  title: a.album.name,
                  subtitle: a.album.artists
                    ?.map((artist: any) => artist.name)
                    .join(", "),
                  image: a.album.images?.[0]?.url,
                  payload: a.album,
                  lastPlayedAt: recentlyPlayedItem?.played_at,
                  addedAt: a.added_at, // Date d'ajout de l'album sauvegardé
                };
              })
          : [];

      const artists =
        artistsResult.status === "fulfilled"
          ? artistsResult.value
              .filter((a: any) => a?.id)
              .map((a: any) => {
                const artistId = a.id;
                // Trouver la date de dernière écoute pour cet artiste
                const recentlyPlayedItem = recentlyPlayedData.find(
                  (item: any) =>
                    item.track?.artists?.some(
                      (artist: any) => artist.id === artistId
                    )
                );
                return {
                  id: artistId,
                  type: "artist" as const,
                  title: a.name,
                  subtitle: "Artiste",
                  image: a.images?.[0]?.url,
                  payload: a,
                  lastPlayedAt: recentlyPlayedItem?.played_at,
                };
              })
          : [];

      const shows =
        showsResult.status === "fulfilled"
          ? showsResult.value
              .filter((s: any) => s?.show?.id)
              .map((s: any) => ({
                id: s.show.id,
                type: "podcast" as const,
                title: s.show.name,
                subtitle: s.show.publisher,
                image: s.show.images?.[0]?.url,
                payload: s.show,
              }))
          : [];

      // Combiner tous les items
      const allItems = [
        ...playlists,
        ...savedTracks,
        ...albums,
        ...artists,
        ...shows,
      ];

      // Trier par "récent écouté" :
      // 1. Items avec lastPlayedAt (récemment écoutés) en premier, triés par date décroissante
      // 2. Items avec addedAt (albums sauvegardés récemment) ensuite
      // 3. Autres items à la fin
      const sortedItems = allItems.sort((a, b) => {
        // Priorité 1: lastPlayedAt (récemment écouté)
        if (a.lastPlayedAt && !b.lastPlayedAt) return -1;
        if (!a.lastPlayedAt && b.lastPlayedAt) return 1;
        if (a.lastPlayedAt && b.lastPlayedAt) {
          return (
            new Date(b.lastPlayedAt).getTime() -
            new Date(a.lastPlayedAt).getTime()
          );
        }

        // Priorité 2: addedAt (albums sauvegardés récemment)
        if (a.addedAt && !b.addedAt) return -1;
        if (!a.addedAt && b.addedAt) return 1;
        if (a.addedAt && b.addedAt) {
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        }

        // Priorité 3: "Titres likés" en premier parmi les autres
        if (a.id === "saved-tracks") return -1;
        if (b.id === "saved-tracks") return 1;

        return 0;
      });

      setItems(sortedItems);
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
