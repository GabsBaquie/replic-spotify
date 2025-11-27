import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { Text } from "@/components/restyle";
import { RestyleButton } from "@/components/RestyleButton";
import { useCreatorTrackSubmission } from "@/hooks/ArtistCreator/useCreatorTrackSubmission";

export const CreatorUpload = () => {
  const {
    state: { title, coverUri, coCreators, coCreatorDraft, loading },
    actions: {
      setTitle,
      pickCover,
      setCoCreatorDraft,
      addCoCreator,
      removeCoCreator,
      submit,
    },
  } = useCreatorTrackSubmission();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Envoyer une musique</Text>
      <Text style={styles.subtitle}>
        Ajoute ton prochain morceau avec sa cover et tes co-creators.
      </Text>

      {coverUri ? (
        <Image source={{ uri: coverUri }} style={styles.cover} />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Text style={styles.placeholderText}>Aucune cover</Text>
        </View>
      )}

      <RestyleButton
        title={coverUri ? "Modifier la cover" : "Choisir une cover"}
        onPress={pickCover}
        fullWidth
        marginTop="m"
        variant="outline"
      />

      <TextInput
        style={styles.input}
        placeholder="Nom de la musique"
        placeholderTextColor="#6f6f6f"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.sectionLabel}>Co-creators</Text>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.coCreatorInput]}
          placeholder="@username, email..."
          placeholderTextColor="#6f6f6f"
          value={coCreatorDraft}
          onChangeText={setCoCreatorDraft}
        />
        <TouchableOpacity style={styles.addButton} onPress={addCoCreator}>
          <Text style={styles.addButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chipsRow}>
        {coCreators.map((creator, index) => (
          <TouchableOpacity
            key={`${creator}-${index}`}
            style={styles.chip}
            onPress={() => removeCoCreator(index)}
          >
            <Text style={styles.chipText}>{creator}</Text>
            <Text style={styles.chipRemove}>✕</Text>
          </TouchableOpacity>
        ))}
        {coCreators.length === 0 && (
          <Text style={styles.helperText}>Pas encore de co-creators.</Text>
        )}
      </View>

      <RestyleButton
        title={loading ? "Envoi en cours..." : "Envoyer la musique"}
        onPress={submit}
        disabled={loading}
        fullWidth
        marginTop="l"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 32,
  },
  content: {
    padding: 24,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    color: "#b3b3b3",
    marginTop: 8,
    marginBottom: 24,
  },
  cover: {
    width: "100%",
    height: 220,
    borderRadius: 20,
  },
  coverPlaceholder: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    backgroundColor: "#1f1f1f",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#6f6f6f",
  },
  input: {
    width: "100%",
    backgroundColor: "#1c1c1e",
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    color: "#fff",
  },
  sectionLabel: {
    color: "#fff",
    fontWeight: "600",
    marginTop: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  coCreatorInput: {
    flex: 1,
    marginTop: 0,
    marginRight: 12,
  },
  addButton: {
    backgroundColor: "#1DB954",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  addButtonText: {
    color: "#0b0b0b",
    fontWeight: "700",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f1f1f",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: {
    color: "#fff",
    marginRight: 8,
  },
  chipRemove: {
    color: "#ff6b6b",
    fontWeight: "700",
  },
  helperText: {
    color: "#6f6f6f",
  },
});

export default CreatorUpload;
