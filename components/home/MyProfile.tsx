import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Box, Text } from "@/components/restyle";
import type { Profile } from "@/hooks/useProfile";
import { RestyleButton } from "@/components/RestyleButton";

type MyProfileProps = {
  isVisible: boolean;
  profile: Profile | null;
  isLoading: boolean;
  error?: string;
  onClose: () => void;
};

export const MyProfile = ({
  isVisible,
  profile,
  isLoading,
  error,
  onClose,
}: MyProfileProps) => {
  const avatarUri = profile?.images?.[0]?.url;
  const router = useRouter();
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("user_is_creator")
      .then((value) => setIsCreator(value === "true"))
      .catch(() => {});
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        "spotify_access_token",
        "spotify_refresh_token",
      ]);
      router.replace("/");
    } catch (err: any) {
      Alert.alert("Impossible de se déconnecter", err?.message ?? "");
    }
  }, [router]);

  const linkArtist = useCallback(async () => {
    try {
      await AsyncStorage.setItem("user_is_creator", "true");
      setIsCreator(true);
      router.push("/creator");
    } catch (err: any) {
      Alert.alert("Impossible de mettre à jour le statut", err?.message ?? "");
    }
  }, [router]);

  const goToCreator = useCallback(() => {
    router.push("/creator");
  }, [router]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Box style={styles.card}>
          <TouchableOpacity
            accessibilityLabel="Fermer le panneau profil"
            accessibilityRole="button"
            onPress={onClose}
            style={styles.closeButton}
          >
            <Ionicons name="close" color="#fff" size={20} />
          </TouchableOpacity>

          {isLoading && (
            <View style={styles.center}>
              <ActivityIndicator color="#fff" style={styles.activityMargin} />
              <Text style={styles.helperTextWithMargin}>
                Chargement du profil...
              </Text>
            </View>
          )}

          {!isLoading && error && (
            <View style={styles.center}>
              <Text style={styles.helperTextWithMargin}>
                Impossible de récupérer le profil.
              </Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!isLoading && !error && profile && (
            <>
              {avatarUri && (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              )}
              <Text style={styles.name}>{profile.display_name}</Text>
              <Text style={styles.email}>{profile.email}</Text>
              {typeof profile.followers?.total === "number" && (
                <Text style={styles.helperTextWithMargin}>
                  {profile.followers.total} abonnés
                </Text>
              )}
              {profile.country && (
                <Text style={styles.helperTextWithMargin}>
                  Pays : {profile.country}
                </Text>
              )}

              {isCreator && <Text style={styles.creatorTag}>Creator</Text>}

              <RestyleButton
                title={
                  isCreator ? "Aller à l’espace creator" : "Devenir creator"
                }
                onPress={isCreator ? goToCreator : linkArtist}
                marginHorizontal="l"
                marginTop="s"
              />

              <RestyleButton
                title="Logout"
                onPress={logout}
                marginHorizontal="l"
                marginTop="m"
                variant="outline"
              />
            </>
          )}

          {!isLoading && !error && !profile && (
            <View style={styles.center}>
              <Text style={styles.helperTextWithMargin}>
                Aucune information disponible.
              </Text>
            </View>
          )}
        </Box>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    padding: 24,
    backgroundColor: "#1c1c1e",
    borderRadius: 24,
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  center: {
    alignItems: "center",
  },
  activityMargin: {
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  email: {
    fontSize: 16,
    color: "#a0a0a0",
    textAlign: "center",
    marginBottom: 8,
  },
  helperTextWithMargin: {
    color: "#d0d0d0",
    textAlign: "center",
    marginTop: 8,
  },
  errorText: {
    color: "#ff6b6b",
    textAlign: "center",
    marginTop: 8,
  },
  creatorTag: {
    marginTop: 8,
    alignSelf: "center",
    color: "#1DB954",
    fontWeight: "600",
  },
});
