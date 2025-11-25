import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Box, Text } from "@/components/restyle";

const CREATOR_PROFILE_KEY = "creator_profile";

type CreatorProfile = {
  stageName: string;
  bio: string;
  photoUri: string | null;
};

const CreatorHome = () => {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(CREATOR_PROFILE_KEY)
      .then((value) => {
        if (value) {
          setProfile(JSON.parse(value));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1DB954" />
        <Text>Chargement de ton espace creator...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text>Aucune information creator. Reviens au formulaire.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {profile.photoUri && (
        <Image source={{ uri: profile.photoUri }} style={styles.cover} />
      )}
      <Text style={styles.title}>{profile.stageName}</Text>
      <Text style={styles.badge}>Creator confirmé</Text>
      <Box marginTop="l">
        <Text style={styles.sectionTitle}>Bio</Text>
        <Text style={styles.sectionContent}>{profile.bio}</Text>
      </Box>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  content: {
    padding: 24,
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#121212",
  },
  cover: {
    width: 220,
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  badge: {
    color: "#1DB954",
    marginTop: 6,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionContent: {
    color: "#d0d0d0",
    lineHeight: 22,
  },
});

export default CreatorHome;
