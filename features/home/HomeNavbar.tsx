import { Image, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Box, Text } from "@/components/restyle";
import type { Profile } from "@/hooks/Spotify";

type HomeNavbarProps = {
  profile: Profile | null;
  isLoading: boolean;
  onProfilePress: () => void;
};

export const HomeNavbar = ({
  profile,
  isLoading,
  onProfilePress,
}: HomeNavbarProps) => {
  const avatarUri = profile?.images?.[0]?.url;

  return (
    <Box style={styles.container}>
      <Box>
        <Text style={styles.subtitle}>Bienvenue</Text>
        <Text style={styles.title}>{profile?.display_name ?? "Spotify"}</Text>
      </Box>
      <TouchableOpacity
        accessibilityLabel="Ouvrir le profil utilisateur"
        accessibilityRole="button"
        disabled={isLoading}
        onPress={onProfilePress}
        style={styles.avatarButton}
      >
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <Ionicons name="person-circle-outline" size={44} color="#fff" />
        )}
      </TouchableOpacity>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 8,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#a0a0a0",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  avatarButton: {
    borderRadius: 999,
    overflow: "hidden",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
});
