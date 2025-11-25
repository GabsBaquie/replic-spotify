import { useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

const AUTH_STORAGE_KEYS = [
  "spotify_access_token",
  "spotify_refresh_token",
  "user_is_creator", // Clean le local storage pour laisser le creator flow
];

export const useLogout = () => {
  const router = useRouter();

  return useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(AUTH_STORAGE_KEYS);
      router.replace("/");
    } catch (error: any) {
      Alert.alert(
        "Impossible de se déconnecter",
        error?.message ?? "Réessaie plus tard."
      );
    }
  }, [router]);
};

export default useLogout;
