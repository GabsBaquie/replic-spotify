import { StyleSheet, View, Image, ActivityIndicator } from "react-native";
import { Box, Text } from "@/components/restyle";
import { useProfile } from "@/hooks/Spotify";
import { useCreatorStatus } from "@/hooks/ArtistCreator";
import { useRouter } from "expo-router";
import { RestyleButton } from "@/components/RestyleButton";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Profile() {
  const { profile, isLoading, error } = useProfile();
  const { isCreator, isLoading: isCreatorLoading } = useCreatorStatus();
  const router = useRouter();

  const handleGoToCreator = () => {
    router.push("/creator/home");
  };

  if (isLoading || isCreatorLoading) {
    return (
      <Box style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </Box>
    );
  }

  if (error) {
    return (
      <Box style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>Erreur</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Aucune information disponible</Text>
        </View>
      </Box>
    );
  }

  const avatarUri = profile.images?.[0]?.url;

  return (
    <Box style={styles.container}>
      <View style={styles.content}>
        {avatarUri && (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        )}
        <Text style={styles.name}>{profile.display_name}</Text>
        <Text style={styles.email}>{profile.email}</Text>

        {typeof profile.followers?.total === "number" && (
          <Text style={styles.followers}>
            {profile.followers.total} abonnés
          </Text>
        )}

        {profile.country && (
          <Text style={styles.country}>Pays : {profile.country}</Text>
        )}

        {isCreator && (
          <>
            <View style={styles.creatorBadge}>
              <Ionicons name="musical-notes" size={16} color="#1DB954" />
              <Text style={styles.creatorTag}>Creator</Text>
            </View>
            <RestyleButton
              title="Aller à l'espace creator"
              onPress={handleGoToCreator}
              marginTop="m"
            />
          </>
        )}
      </View>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  email: {
    color: "#a0a0a0",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  followers: {
    color: "#d0d0d0",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  country: {
    color: "#d0d0d0",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  creatorBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(29, 185, 84, 0.1)",
    borderRadius: 20,
    gap: 6,
  },
  creatorTag: {
    color: "#1DB954",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  errorMessage: {
    color: "#a0a0a0",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});
