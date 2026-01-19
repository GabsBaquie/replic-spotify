import {
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  View,
  Text as RNText,
} from "react-native";
import { Box, Text } from "@/components/restyle";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import useSupabasePlayer from "@/hooks/Player/useSupabasePlayer";
import { getSignedUrl } from "@/lib/supabase/storage";
import { getStoragePath } from "@/lib/supabase/utils";

export type TrackInfo = {
  name: string;
  artists: string[];
  artistIds: string[];
  albumArtUri: string | null;
  uri: string;
};

interface DetailPlayProps {
  visible: boolean;
  onClose: () => void;
  track: TrackInfo;
}

export default function DetailPlay({
  visible,
  onClose,
  track,
}: DetailPlayProps) {
  const { name, artists, artistIds, albumArtUri, uri: initialUri } = track;
  const router = useRouter();
  const supabasePlayer = useSupabasePlayer();
  const [finalUri, setFinalUri] = useState<string | null>(initialUri);

  // Générer l'URL signée si l'URI est un path Supabase (pas Spotify)
  useEffect(() => {
    if (!initialUri) {
      setFinalUri(null);
      return;
    }

    // Si c'est déjà une URL complète, l'utiliser directement
    if (initialUri.startsWith("http://") || initialUri.startsWith("https://")) {
      setFinalUri(initialUri);
      return;
    }

    // Si c'est un URI Spotify, ne pas essayer de générer une URL signée
    if (initialUri.startsWith("spotify:")) {
      setFinalUri(initialUri);
      return;
    }

    // Sinon, c'est probablement un path Supabase, essayer de générer l'URL signée
    const generateSignedUrl = async () => {
      try {
        const storagePath = getStoragePath(initialUri);
        if (!storagePath) {
          setFinalUri(null);
          return;
        }
        
        const signedUrl = await getSignedUrl("tracks", storagePath, 3600);
        setFinalUri(signedUrl);
      } catch {
        // Erreur silencieuse : le fichier n'existe peut-être pas ou n'est pas accessible
        setFinalUri(null);
      }
    };

    generateSignedUrl();
  }, [initialUri]);

  // Démarrer la lecture automatiquement quand la popup s'ouvre (uniquement pour les tracks Supabase)
  useEffect(() => {
    if (!visible || !finalUri) return;
    
    // Ne lancer la lecture automatique que pour les URLs Supabase (http/https)
    // Pas pour les URIs Spotify (spotify:track:xxx)
    const isSupabaseUrl = finalUri.startsWith("http://") || finalUri.startsWith("https://");
    if (!isSupabaseUrl) return;
    
    const currentTrack = supabasePlayer.state?.track;
    const isAlreadyPlaying = currentTrack?.uri === finalUri && !supabasePlayer.state?.isPaused;
    if (isAlreadyPlaying) return;
    
    const playTrack = async () => {
      try {
        const trackWithFinalUri: TrackInfo = { ...track, uri: finalUri };
        await supabasePlayer.play(trackWithFinalUri);
      } catch {
        // Erreur silencieuse, l'utilisateur peut utiliser le bouton Play manuel
      }
    };
    
    playTrack();
  }, [visible, finalUri, track, supabasePlayer]);

  const actions = [
    {
      label: "Add to playlist",
      icon: require("@/assets/images/icons/add_playlist.png"),
      onPress: () => {},
    },
    {
      label: "Share",
      icon: require("@/assets/images/icons/share.png"),
      onPress: () => {},
    },
    {
      label: "View artist",
      icon: require("@/assets/images/icons/artist.png"),
      onPress: () => {
        router.push({
          pathname: "/home/artist/[id]",
          params: { id: artistIds[0] },
        });
        onClose();
      },
    },
  ];

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Box style={styles.modal}>
          <Image
            source={{ uri: albumArtUri || undefined }}
            style={styles.cover}
          />

          <Box style={styles.header}>
            <Box>
              <Text style={styles.title}>{name}</Text>
              <Text variant="caption" color="text" style={{ opacity: 0.5 }}>
                {artists[0]}
              </Text>
            </Box>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {/* Bouton Play/Pause */}
              <TouchableOpacity
                onPress={() => {
                  // Ne gérer que les tracks Supabase (http/https), pas les tracks Spotify
                  if (!finalUri || !finalUri.startsWith("http")) return;
                  
                  const trackWithFinalUri: TrackInfo = { ...track, uri: finalUri };
                  if (supabasePlayer.state?.isPaused || !supabasePlayer.state) {
                    supabasePlayer.play(trackWithFinalUri).catch(() => {});
                  } else {
                    supabasePlayer.pause().catch(() => {});
                  }
                }}
                style={styles.playButton}
              >
                <Text style={styles.playButtonText}>
                  {supabasePlayer.state?.isPaused || !supabasePlayer.state ? "▶" : "⏸"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Image
                  source={require("@/assets/images/icons/like_off.png")}
                  style={styles.icon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </Box>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {!finalUri || (!finalUri.startsWith("http") && !finalUri.startsWith("spotify:")) ? (
              <View style={styles.errorContainer}>
                <RNText style={styles.errorText}>
                  ⚠️ Fichier audio non disponible
                </RNText>
                <RNText style={styles.errorSubtext}>
                  Le fichier audio n&apos;a pas pu être chargé. {track.uri ? `Path: ${track.uri}` : "Aucun fichier trouvé."}
                </RNText>
              </View>
            ) : null}
            
            {actions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.action}
                onPress={action.onPress}
              >
                <Image
                  source={action.icon}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Text variant="caption" color="text">
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </Box>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "100%",
    height: "100%",
    paddingVertical: 75,
    backgroundColor: "#121212",
    borderRadius: 10,
    alignItems: "center",
  },
  cover: { width: 250, height: 225 },
  header: {
    width: "80%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
  },
  title: { fontSize: 20, fontWeight: "600", color: "#fff" },
  scroll: { width: "80%" },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 15, gap: 20 },
  action: { flexDirection: "row", gap: 10, alignItems: "center" },
  icon: { width: 20, height: 20 },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1DB954",
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 5,
    width: "100%",
    marginTop: 20,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  errorSubtext: {
    color: "#a0a0a0",
    fontSize: 12,
    textAlign: "center",
  },
});
