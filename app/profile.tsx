import { useEffect, useState } from "react";
import { Image, StyleSheet, View, Text, ActivityIndicator } from "react-native";
import getProfile from "@/query/profile/getProfile";

export default function Home() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    getProfile()
      .then((data) => setProfile(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading profile...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {profile.images?.[0]?.url && (
          <Image
            source={{ uri: profile.images[0].url }}
            style={styles.avatar}
          />
        )}
        <Text style={styles.name}>{profile.display_name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#121212",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  email: {
    color: "gray",
    fontSize: 16,
    marginTop: 8,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
