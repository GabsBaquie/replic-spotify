import { View, Text, StyleSheet } from "react-native";

const CreatorDashboard = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Espace Creator</Text>
      <Text style={styles.subtitle}>
        Ici tu pourras gérer tes contenus et suivre tes stats prochainement.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
  },
  subtitle: {
    color: "#b3b3b3",
    textAlign: "center",
  },
});

export default CreatorDashboard;
