import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getArtistById, type Artist } from "@/lib/supabase";

const CREATOR_PROFILE_KEY = "creator_profile";
const CREATOR_ARTIST_ID_KEY = "creator_artist_id";

type StoredCreatorProfile = {
  stageName: string;
  bio: string;
  photoUri: string | null;
  status?: string;
  artistId?: string;
};

export const useCreatorProfile = () => {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer le token Spotify si disponible
        const spotifyToken = await AsyncStorage.getItem("spotify_access_token");

        // 1. Récupérer l'ID de l'artist depuis AsyncStorage
        const artistId = await AsyncStorage.getItem(CREATOR_ARTIST_ID_KEY);

        if (!artistId) {
          // Fallback: essayer de récupérer depuis l'ancien format
          const oldProfile = await AsyncStorage.getItem(CREATOR_PROFILE_KEY);
          if (oldProfile) {
            const parsed: StoredCreatorProfile = JSON.parse(oldProfile);
            if (parsed.artistId) {
              const artistData = await getArtistById(
                parsed.artistId,
                spotifyToken || undefined
              );
              if (artistData) {
                setArtist(artistData);
                return;
              }
            }
          }
          setArtist(null);
          return;
        }

        // 2. Récupérer l'artist depuis Supabase (avec token si disponible)
        const artistData = await getArtistById(
          artistId,
          spotifyToken || undefined
        );
        setArtist(artistData);
      } catch (err: any) {
        console.error("[useCreatorProfile] Erreur:", err);
        const errorMessage =
          err?.message || "Erreur lors du chargement du profil";
        setError(errorMessage);
        setArtist(null);

        // Si c'est une erreur RLS, afficher un message d'aide
        if (
          errorMessage.includes("RLS") ||
          errorMessage.includes("Invalid API key")
        ) {
          console.error(
            "\n⚠️  PROBLÈME RLS DÉTECTÉ\n" +
              "Pour résoudre ce problème, va dans Supabase Dashboard > Table Editor > artists > RLS Policies\n" +
              "et crée une policy qui permet la lecture publique:\n" +
              'CREATE POLICY "Allow public read on artists" ON artists FOR SELECT USING (true);\n'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return { artist, loading, error };
};
