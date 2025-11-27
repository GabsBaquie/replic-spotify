import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { useCreatorApplication } from "@/hooks/ArtistCreator/useCreatorApplication";

const CreatorOnboarding = () => {
  const {
    state: { stageName, photoUri, bio, loading },
    actions: { setStageName, pickImage, setBio, submit },
  } = useCreatorApplication();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Devenir Creator</Text>
      <Text style={styles.subtitle}>
        Renseigne ton nom de scène, une photo de profil et une bio pour lancer
        ton espace artiste.
      </Text>

      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.imagePreview} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>
            Prévisualisation photo
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
        <Text style={styles.photoButtonText}>
          {photoUri ? "Changer la photo" : "Choisir une photo"}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Nom de scène"
        placeholderTextColor="#7a7a7a"
        value={stageName}
        onChangeText={setStageName}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Bio, univers, inspirations..."
        placeholderTextColor="#7a7a7a"
        multiline
        value={bio}
        onChangeText={setBio}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={submit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Envoi..." : "Envoyer ma candidature"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    color: "#b3b3b3",
    marginBottom: 24,
  },
  imagePreview: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    backgroundColor: "#1f1f1f",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  imagePlaceholderText: { color: "#7a7a7a" },
  input: {
    width: "100%",
    backgroundColor: "#1f1f1f",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    marginBottom: 14,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 12,
    backgroundColor: "#1DB954",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#0b0b0b",
    fontWeight: "700",
  },
  photoButton: {
    backgroundColor: "#242424",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  photoButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default CreatorOnboarding;
