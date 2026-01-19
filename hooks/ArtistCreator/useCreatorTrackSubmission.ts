import { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { createSong, getArtistBySpotifyUserId } from "@/lib/supabase";

export const useCreatorTrackSubmission = () => {
  const [title, setTitle] = useState("");
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [coCreators, setCoCreators] = useState<string[]>([]);
  const [coCreatorDraft, setCoCreatorDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const pickCover = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Accès requis",
        "Autorise l'accès à ta galerie pour choisir une cover."
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
      setCoverUri(result.assets[0].uri);
    }
  }, []);

  const pickAudio = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "audio/*",
          "audio/mpeg",
          "audio/mp3",
          "audio/mp4",
          "audio/wav",
          "audio/aac",
          "audio/ogg",
          "audio/flac",
        ],
        copyToCacheDirectory: true,
        multiple: false,
        // Sur iOS/Android, cela permet d'accéder à iCloud, Google Drive, etc.
        ...(Platform.OS !== "web" && {
          presentationStyle: "pageSheet",
        }),
      });

      if (!result.canceled && result.assets?.[0]) {
        setAudioUri(result.assets[0].uri);
        setAudioFileName(result.assets[0].name || "audio.mp3");
      }
    } catch (error: any) {
      console.error("[pickAudio] Erreur:", error);
      Alert.alert(
        "Erreur",
        error?.message || "Impossible de sélectionner le fichier audio. Assure-toi d'avoir accès aux fichiers sur ton appareil."
      );
    }
  }, []);

  const handleAudioFile = useCallback((file: File | { uri: string; name: string }) => {
    if (Platform.OS === "web" && file instanceof File) {
      // Sur web, créer une URL temporaire pour le fichier
      const url = URL.createObjectURL(file);
      setAudioUri(url);
      setAudioFileName(file.name || "audio.mp3");
    } else if ("uri" in file) {
      setAudioUri(file.uri);
      setAudioFileName(file.name || "audio.mp3");
    }
  }, []);

  const addCoCreator = useCallback(() => {
    const trimmed = coCreatorDraft.trim();
    if (!trimmed) return;
    setCoCreators((prev) => [...prev, trimmed]);
    setCoCreatorDraft("");
  }, [coCreatorDraft]);

  const removeCoCreator = useCallback((index: number) => {
    setCoCreators((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const submit = useCallback(async () => {
    if (!title.trim() || !coverUri || !audioUri) {
      Alert.alert(
        "Formulaire incomplet",
        "Ajoute un titre, une cover et un fichier audio."
      );
      return;
    }

    setLoading(true);
    try {
      // Récupérer le token Spotify
      const spotifyToken = await AsyncStorage.getItem("spotify_access_token");
      if (!spotifyToken) {
        Alert.alert(
          "Authentification requise",
          "Tu dois être connecté à Spotify pour envoyer une musique."
        );
        setLoading(false);
        return;
      }

      // Récupérer l'artiste actuel
      const artist = await getArtistBySpotifyUserId(spotifyToken);
      if (!artist) {
        Alert.alert(
          "Profil artiste requis",
          "Tu dois avoir un profil artiste validé pour envoyer une musique."
        );
        setLoading(false);
        return;
      }

      // Préparer les fichiers pour l'upload
      // Pour React Native, on utilise les URIs directement
      const artistIds = [artist.id];

      // Upload vers Supabase
      await createSong(
        title.trim(),
        coverUri, // URI de l'image
        audioUri, // URI du fichier audio
        artistIds,
        spotifyToken
      );

      Alert.alert(
        "Musique envoyée",
        "Ton morceau a bien été ajouté à la file de validation.",
        [
          {
            text: "Voir mon espace creator",
            onPress: () => router.replace("/creator/home"),
          },
        ]
      );

      // Réinitialiser le formulaire
      setTitle("");
      setCoverUri(null);
      setAudioUri(null);
      setAudioFileName(null);
      setCoCreators([]);
      setCoCreatorDraft("");
    } catch (error: any) {
      console.error("[useCreatorTrackSubmission] Erreur:", error);
      Alert.alert(
        "Échec",
        error?.message ?? "Impossible d'enregistrer ta musique."
      );
    } finally {
      setLoading(false);
    }
  }, [title, coverUri, audioUri, router]);

  return {
    state: {
      title,
      coverUri,
      audioUri,
      audioFileName,
      coCreators,
      coCreatorDraft,
      loading,
    },
    actions: {
      setTitle,
      setCoCreatorDraft,
      pickCover,
      pickAudio,
      handleAudioFile,
      addCoCreator,
      removeCoCreator,
      submit,
    },
  };
};

export type UseCreatorTrackSubmission = ReturnType<
  typeof useCreatorTrackSubmission
>;
