import { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { getSongsByArtistId, type SongWithArtists } from "@/lib/supabase";

type CreatorTrack = {
  id: string;
  title: string;
  coverUri: string;
  coCreators: string[];
  status: "pending" | "validated" | "refused";
  createdAt: string;
};

const CREATOR_ARTIST_ID_KEY = "creator_artist_id";

// Convertit SongWithArtists en CreatorTrack
const convertSongToTrack = (song: SongWithArtists): CreatorTrack => {
  // Récupérer les noms des co-créateurs (tous les artistes sauf le premier)
  const coCreators = song.artists.slice(1).map((artist) => artist.name);
  
  return {
    id: song.id,
    title: song.title,
    coverUri: song.image_url || "",
    coCreators,
    status: song.status,
    createdAt: song.created_at,
  };
};

export const useCreatorTracks = () => {
  const [tracks, setTracks] = useState<CreatorTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTracks = useCallback(async () => {
    setLoading(true);
    try {
      // Récupérer l'ID de l'artiste depuis AsyncStorage
      const artistId = await AsyncStorage.getItem(CREATOR_ARTIST_ID_KEY);
      
      if (!artistId) {
        console.warn("[useCreatorTracks] Aucun artistId trouvé");
        setTracks([]);
        return;
      }

      // Récupérer toutes les chansons de l'artiste depuis Supabase
      const songs = await getSongsByArtistId(artistId);
      
      // Convertir en CreatorTrack
      const convertedTracks = songs.map(convertSongToTrack);
      setTracks(convertedTracks);
    } catch (error: any) {
      console.error("[useCreatorTracks] Erreur lors du chargement:", error);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTracks();
    }, [loadTracks])
  );

  const validatedTracks = tracks.filter(
    (track) => track.status === "validated"
  );
  const pendingTracks = tracks.filter((track) => track.status === "pending");
  const rejectedTracks = tracks.filter((track) => track.status === "refused");

  return {
    loading,
    tracks,
    validatedTracks,
    pendingTracks,
    rejectedTracks,
    refresh: loadTracks,
  };
};

export type { CreatorTrack };
