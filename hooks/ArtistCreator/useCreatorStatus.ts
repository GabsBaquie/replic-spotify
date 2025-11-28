import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getArtistBySpotifyUserId } from "@/lib/supabase";

export const useCreatorStatus = () => {
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [artistId, setArtistId] = useState<string | null>(null);

  const checkCreatorStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      // Récupérer le token Spotify
      const spotifyToken = await AsyncStorage.getItem("spotify_access_token");

      if (!spotifyToken) {
        // Pas de token, nettoyer et retourner
        await AsyncStorage.multiRemove([
          "user_is_creator",
          "creator_artist_id",
          "creator_profile",
        ]);
        setIsCreator(false);
        setArtistId(null);
        setIsLoading(false);
        return;
      }

      // Vérifier directement dans Supabase si un artiste existe avec ce compte Spotify
      const artist = await getArtistBySpotifyUserId(spotifyToken);

      if (artist) {
        // L'artiste existe dans la DB, mettre à jour AsyncStorage
        await AsyncStorage.multiSet([
          ["user_is_creator", "true"],
          ["creator_artist_id", artist.id],
          [
            "creator_profile",
            JSON.stringify({
              stageName: artist.name,
              bio: artist.bio,
              photoUri: artist.image_url,
              status: artist.status,
              artistId: artist.id,
            }),
          ],
        ]);
        setIsCreator(true);
        setArtistId(artist.id);
        setIsLoading(false);
        return;
      }

      // Aucun artiste trouvé dans la DB, nettoyer AsyncStorage
      await AsyncStorage.multiRemove([
        "user_is_creator",
        "creator_artist_id",
        "creator_profile",
      ]);
      setIsCreator(false);
      setArtistId(null);
      setIsLoading(false);
    } catch (error) {
      console.error("[useCreatorStatus] Erreur:", error);
      // En cas d'erreur, nettoyer pour être sûr
      await AsyncStorage.multiRemove([
        "user_is_creator",
        "creator_artist_id",
        "creator_profile",
      ]).catch(() => {
        // Ignorer les erreurs de nettoyage
      });
      setIsCreator(false);
      setArtistId(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkCreatorStatus();
  }, [checkCreatorStatus]);

  return {
    isCreator,
    isLoading,
    artistId,
    refresh: checkCreatorStatus,
  };
};
