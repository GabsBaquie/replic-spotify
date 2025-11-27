import { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

const CREATOR_FLAG_KEY = "user_is_creator";
const CREATOR_PROFILE_KEY = "creator_profile";

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
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await AsyncStorage.multiSet([
        [CREATOR_FLAG_KEY, "true"],
        [CREATOR_PROFILE_KEY, JSON.stringify({ stageName, bio, photoUri })],
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
