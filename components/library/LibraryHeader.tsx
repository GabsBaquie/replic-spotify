import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Box, Text } from "@/components/restyle";
import type { Profile } from "@/hooks/useProfile";

type LibraryHeaderProps = {
  profile: Profile | null;
};

export const LibraryHeader = ({ profile }: LibraryHeaderProps) => {
  const avatarUri = profile?.images?.[0]?.url;

  return (
    <Box style={styles.container}>
      <View style={styles.titleRow}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <Box style={styles.avatarFallback}>
            <Ionicons name="person" size={18} color="#fff" />
          </Box>
        )}
        <Text style={styles.title}>Your Library</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity accessibilityLabel="Recherche dans la bibliothèque">
          <Ionicons name="search" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel="Créer une nouvelle playlist"
          style={styles.addButton}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  addButton: {
    paddingLeft: 8,
  },
});
