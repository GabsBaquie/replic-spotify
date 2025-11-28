import { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { createArtist, getArtistBySpotifyUserId } from "@/lib/supabase";

const CREATOR_FLAG_KEY = "user_is_creator";
const CREATOR_PROFILE_KEY = "creator_profile";
const CREATOR_ARTIST_ID_KEY = "creator_artist_id";

export const useCreatorApplication = () => {
  const [stageName, setStageName] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const pickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Autorisation refusée",
        "Active l’accès à tes photos pour continuer."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  }, []);

  const reset = useCallback(() => {
    setStageName("");
    setPhotoUri(null);
    setBio("");
  }, []);

  const submit = useCallback(async () => {
    if (!stageName.trim() || !bio.trim() || !photoUri) {
      Alert.alert(
        "Formulaire incomplet",
        "Ajoute une photo, un nom de scène et une bio."
      );
      return;
    }
    setLoading(true);
    try {
      const spotifyToken = await AsyncStorage.getItem("spotify_access_token");
      if (!spotifyToken) {
        setLoading(false);
        Alert.alert(
          "Authentification requise",
          "Tu dois être connecté à Spotify pour devenir creator."
        );
        return;
      }

      // Vérifier si un artiste existe déjà avec ce compte Spotify
      const existingArtist = await getArtistBySpotifyUserId(spotifyToken);

      if (existingArtist) {
        // Si l'artiste existe déjà, stocker ses infos et rediriger vers l'espace creator
        await AsyncStorage.multiSet([
          [CREATOR_FLAG_KEY, "true"],
          [CREATOR_ARTIST_ID_KEY, existingArtist.id],
          [
            CREATOR_PROFILE_KEY,
            JSON.stringify({
              stageName: existingArtist.name,
              bio: existingArtist.bio,
              photoUri: existingArtist.image_url,
              status: existingArtist.status,
              artistId: existingArtist.id,
            }),
          ],
        ]);
        router.replace("/creator/home");
        reset();
        return;
      }

      // Si l'artiste n'existe pas, créer un nouvel artiste
      const artist = await createArtist(
        stageName.trim(),
        bio.trim(),
        photoUri,
        spotifyToken
      );

      await AsyncStorage.multiSet([
        [CREATOR_FLAG_KEY, "true"],
        [CREATOR_ARTIST_ID_KEY, artist.id],
        [
          CREATOR_PROFILE_KEY,
          JSON.stringify({
            stageName: artist.name,
            bio: artist.bio,
            photoUri,
            status: artist.status,
            artistId: artist.id,
          }),
        ],
      ]);
      Alert.alert(
        "Créateur enregistré",
        "Ton dossier artiste a bien été envoyé."
      );
      router.replace("/creator/home");
      reset();
    } catch (error: any) {
      Alert.alert(
        "Échec",
        error?.message ?? "Impossible d’enregistrer tes infos pour le moment."
      );
    } finally {
      setLoading(false);
    }
  }, [stageName, photoUri, bio, router, reset]);

  return {
    state: {
      stageName,
      photoUri,
      bio,
      loading,
    },
    actions: {
      setStageName,
      pickImage,
      setBio,
      submit,
    },
  };
};

export default useCreatorApplication;
