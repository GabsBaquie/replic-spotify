import {
  ActivityIndicator,
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
import { useLogout } from "@/hooks/useLogout";

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
  const logout = useLogout();

  useEffect(() => {
    AsyncStorage.getItem("user_is_creator")
      .then((value) => setIsCreator(value === "true"))
      .catch(() => {});
  }, []);

  const handleStartCreator = useCallback(() => {
    onClose();
    router.push("/creator");
  }, [router, onClose]);

  const handleGoToCreator = useCallback(() => {
    onClose();
    router.push("/creator/home");
  }, [router, onClose]);

  const handleLogout = useCallback(async () => {
    await logout();
    onClose();
  }, [logout, onClose]);

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
                onPress={isCreator ? handleGoToCreator : handleStartCreator}
                marginHorizontal="l"
                marginTop="s"
              />

              <RestyleButton
                title="Logout"
                onPress={handleLogout}
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
