import { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

const CREATOR_TRACKS_KEY = "creator_tracks";

type TrackPayload = {
  id: string;
  title: string;
  coverUri: string;
  coCreators: string[];
  status: "pending" | "validated" | "rejected";
  createdAt: number;
};

export const useCreatorTrackSubmission = () => {
  const [title, setTitle] = useState("");
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [coCreators, setCoCreators] = useState<string[]>([]);
  const [coCreatorDraft, setCoCreatorDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const pickCover = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Accès requis",
        "Autorise l’accès à ta galerie pour choisir une cover."
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
    if (!title.trim() || !coverUri) {
      Alert.alert(
        "Formulaire incomplet",
        "Ajoute un visuel et le nom de ta musique."
      );
      return;
    }

    setLoading(true);
    try {
      const payload: TrackPayload = {
        id: Date.now().toString(),
        title: title.trim(),
        coverUri,
        coCreators,
        status: "pending",
        createdAt: Date.now(),
      };

      const existingRaw = await AsyncStorage.getItem(CREATOR_TRACKS_KEY);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      await AsyncStorage.setItem(
        CREATOR_TRACKS_KEY,
        JSON.stringify([payload, ...existing])
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

      setTitle("");
      setCoverUri(null);
      setCoCreators([]);
      setCoCreatorDraft("");
    } catch (error: any) {
      Alert.alert(
        "Échec",
        error?.message ?? "Impossible d’enregistrer ta musique."
      );
    } finally {
      setLoading(false);
    }
  }, [title, coverUri, coCreators, router]);

  return {
    state: {
      title,
      coverUri,
      coCreators,
      coCreatorDraft,
      loading,
    },
    actions: {
      setTitle,
      setCoCreatorDraft,
      pickCover,
      addCoCreator,
      removeCoCreator,
      submit,
    },
  };
};

export type UseCreatorTrackSubmission = ReturnType<
  typeof useCreatorTrackSubmission
>;
