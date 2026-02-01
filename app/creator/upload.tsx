import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Platform,
  Alert,
} from "react-native";
import { Text } from "@/components/restyle";
import { RestyleButton } from "@/components/RestyleButton";
import { useCreatorTrackSubmission } from "@/hooks/ArtistCreator/useCreatorTrackSubmission";

export const CreatorUpload = () => {
  const {
    state: { title, coverUri, audioUri, audioFileName, coCreators, coCreatorDraft, loading },
    actions: {
      setTitle,
      pickCover,
      pickAudio,
      handleAudioFile,
      setCoCreatorDraft,
      addCoCreator,
      removeCoCreator,
      submit,
    },
  } = useCreatorTrackSubmission();

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<any>(null);
  
  // Détecter iOS (Safari sur iOS ne supporte pas bien le drag & drop depuis l'app Fichiers)
  const [isIOS, setIsIOS] = useState(false);
  
  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const userAgent = navigator.userAgent;
      const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) || 
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      setIsIOS(isIOSDevice);
    }
  }, []);

  // Gestion du drag & drop sur web (désactivé sur iOS car ne fonctionne pas bien)
  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (Platform.OS === "web" && !isIOS) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    }
  }, [isIOS]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    if (Platform.OS === "web" && !isIOS) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    }
  }, [isIOS]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (Platform.OS === "web" && !isIOS) {
      e.preventDefault();
      e.stopPropagation();
      // Ne pas désactiver le drag si on est toujours dans la zone
      const target = e.currentTarget as HTMLElement;
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (!target.contains(relatedTarget)) {
        setIsDragging(false);
      }
    }
  }, [isIOS]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (Platform.OS === "web" && !isIOS) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const audioFile = files.find(
          (file) =>
            file.type.startsWith("audio/") ||
            file.name.endsWith(".mp3") ||
            file.name.endsWith(".m4a") ||
            file.name.endsWith(".wav") ||
            file.name.endsWith(".aac") ||
            file.name.endsWith(".ogg") ||
            file.name.endsWith(".flac")
        );

        if (audioFile) {
          handleAudioFile(audioFile);
        } else if (files.length > 0) {
          Alert.alert(
            "Format non supporté",
            "Veuillez sélectionner un fichier audio (MP3, M4A, WAV, AAC, etc.)"
          );
        }
      }
    },
    [handleAudioFile, isIOS]
  );

  // Empêcher le comportement par défaut du navigateur sur toute la page
  const handlePageDragOver = useCallback((e: React.DragEvent) => {
    if (Platform.OS === "web") {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handlePageDrop = useCallback((e: React.DragEvent) => {
    if (Platform.OS === "web") {
      e.preventDefault();
      e.stopPropagation();
      // Si le drop n'est pas dans la zone prévue, on l'ignore
      setIsDragging(false);
    }
  }, []);

  // Gestion du input file sur web
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (Platform.OS === "web" && e.target.files && e.target.files[0]) {
        handleAudioFile(e.target.files[0]);
      }
    },
    [handleAudioFile]
  );

  // Empêcher le comportement par défaut du navigateur sur toute la page (sauf iOS)
  useEffect(() => {
    if (Platform.OS === "web" && !isIOS) {
      const preventDefault = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      };

      // Empêcher le drop par défaut sur le document
      document.addEventListener("dragover", preventDefault, false);
      document.addEventListener("drop", preventDefault, false);

      return () => {
        document.removeEventListener("dragover", preventDefault, false);
        document.removeEventListener("drop", preventDefault, false);
      };
    }
  }, [isIOS]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      {...(Platform.OS === "web" && {
        onDragOver: handlePageDragOver,
        onDrop: handlePageDrop,
      })}
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

      {Platform.OS === "web" ? (
        <>
          <div
            style={{
              marginTop: 16,
              cursor: "pointer",
              transition: "all 0.2s ease",
              ...(isDragging && !isIOS && {
                backgroundColor: "#1c1c1e",
                borderWidth: 2,
                borderColor: "#1DB954",
                borderStyle: "dashed",
                borderRadius: 14,
                padding: 14,
              }),
            }}
            {...(!isIOS && {
              onDragEnter: handleDragEnter,
              onDragOver: handleDragOver,
              onDragLeave: handleDragLeave,
              onDrop: handleDrop,
            })}
            onClick={() => fileInputRef.current?.click()}
          >
            {audioFileName ? (
              <View style={styles.audioSelected}>
                <Text style={styles.audioFileName}>🎵 {audioFileName}</Text>
              </View>
            ) : (
              <View style={styles.audioPlaceholder}>
                <Text style={styles.placeholderText}>
                  {isIOS
                    ? "Sur iOS, utilise le bouton ci-dessous pour sélectionner un fichier audio"
                    : "Glisse-dépose un fichier MP3 ici ou clique pour sélectionner"}
                </Text>
              </View>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.m4a,.wav,.aac"
            style={{ display: "none" }}
            onChange={handleFileInputChange}
          />
        </>
      ) : (
        <View style={styles.audioSection}>
          {audioFileName ? (
            <View style={styles.audioSelected}>
              <Text style={styles.audioFileName}>🎵 {audioFileName}</Text>
            </View>
          ) : (
            <View style={styles.audioPlaceholder}>
              <Text style={styles.placeholderText}>Aucun fichier audio</Text>
            </View>
          )}
        </View>
      )}

      <RestyleButton
        title={audioUri ? "Modifier le fichier audio" : "Choisir un fichier audio"}
        onPress={() => {
          if (Platform.OS === "web" && fileInputRef.current) {
            fileInputRef.current.click();
          } else {
            pickAudio();
          }
        }}
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
  audioSection: {
    marginTop: 16,
    ...(Platform.OS === "web" && {
      cursor: "pointer",
      transition: "all 0.2s ease",
    }),
  },
  audioSectionDragging: {
    ...(Platform.OS === "web" && {
      backgroundColor: "#1c1c1e",
      borderWidth: 2,
      borderColor: "#1DB954",
      borderStyle: "dashed",
    }),
  },
  audioSelected: {
    backgroundColor: "#1c1c1e",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1DB954",
  },
  audioFileName: {
    color: "#1DB954",
    fontWeight: "600",
  },
  audioPlaceholder: {
    backgroundColor: "#1f1f1f",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
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
