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
import { useEffect, useState, useRef } from "react";
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [, forceUpdate] = useState(0);
  const autoPlayTriggeredRef = useRef(false); // Pour éviter que le lancement automatique se déclenche plusieurs fois

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

  // Réinitialiser le flag quand la popup se ferme
  useEffect(() => {
    if (!visible) {
      autoPlayTriggeredRef.current = false;
    }
  }, [visible]);

  // Démarrer la lecture automatiquement quand la popup s'ouvre (uniquement pour les tracks Supabase)
  useEffect(() => {
    if (!visible || !finalUri) return;
    
    // Ne lancer la lecture automatique que pour les URLs Supabase (http/https)
    // Pas pour les URIs Spotify (spotify:track:xxx)
    const isSupabaseUrl = finalUri.startsWith("http://") || finalUri.startsWith("https://");
    if (!isSupabaseUrl) return;
    
    // Éviter de lancer plusieurs fois
    if (autoPlayTriggeredRef.current) return;
    
    const currentTrack = supabasePlayer.state?.track;
    const isAlreadyPlaying = currentTrack?.uri === finalUri && !supabasePlayer.state?.isPaused;
    if (isAlreadyPlaying) {
      autoPlayTriggeredRef.current = true;
      return;
    }
    
    const playTrack = async () => {
      try {
        autoPlayTriggeredRef.current = true; // Marquer comme déclenché AVANT le play
        const trackWithFinalUri: TrackInfo = { ...track, uri: finalUri };
        await supabasePlayer.play(trackWithFinalUri);
      } catch {
        // En cas d'erreur, réinitialiser le flag pour permettre un nouvel essai
        autoPlayTriggeredRef.current = false;
      }
    };
    
    playTrack();
  }, [visible, finalUri, track, supabasePlayer]);

  // Forcer la mise à jour de l'UI quand l'état du player change
  useEffect(() => {
    if (!visible) return;
    
    const interval = setInterval(() => {
      forceUpdate((prev) => prev + 1);
    }, 500); // Mise à jour toutes les 500ms pour l'icône
    
    return () => clearInterval(interval);
  }, [visible, supabasePlayer.state]);

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
            <Box style={styles.headerTextContainer}>
              <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                {name}
              </Text>
              <Text variant="caption" color="text" style={{ opacity: 0.5 }} numberOfLines={1} ellipsizeMode="tail">
                {artists[0]}
              </Text>
            </Box>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {/* Bouton Play/Pause */}
              <TouchableOpacity
                disabled={!finalUri || !finalUri.startsWith("http")}
                onPress={async () => {
                  // Ne gérer que les tracks Supabase (http/https), pas les tracks Spotify
                  if (!finalUri || !finalUri.startsWith("http")) {
                    return;
                  }
                  
                  // Éviter les doubles clics rapides
                  if (isPlaying) {
                    return;
                  }
                  
                  setIsPlaying(true);
                  
                  // Réinitialiser le flag autoPlay pour permettre les interactions manuelles
                  autoPlayTriggeredRef.current = false;
                  
                  try {
                    const currentTrack = supabasePlayer.state?.track;
                    const isCurrentTrack = currentTrack?.uri === finalUri;
                    const isPaused = supabasePlayer.state?.isPaused;
                    
                    if (isCurrentTrack) {
                      // Si c'est le même track, toggle play/pause directement
                      if (isPaused) {
                        await supabasePlayer.resume();
                      } else {
                        await supabasePlayer.pause();
                      }
                    } else {
                      // Si c'est un autre track, lancer la lecture
                      const trackWithFinalUri: TrackInfo = { ...track, uri: finalUri };
                      await supabasePlayer.play(trackWithFinalUri);
                    }
                    
                    // Réinitialiser immédiatement après l'action pour permettre les clics suivants
                    setIsPlaying(false);
                  } catch {
                    setIsPlaying(false);
                  }
                }}
                style={styles.playButton}
              >
                {(() => {
                  const currentTrack = supabasePlayer.state?.track;
                  const isCurrentTrack = currentTrack?.uri === finalUri;
                  const isPaused = supabasePlayer.state?.isPaused ?? true;
                  
                  const iconSource = isCurrentTrack && !isPaused 
                    ? require("@/assets/images/icons/pause.png")
                    : require("@/assets/images/icons/play.png");
                  
                  return (
                    <Image
                      source={iconSource}
                      style={styles.playButtonIcon}
                      resizeMode="contain"
                    />
                  );
                })()}
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
  headerTextContainer: {
    flex: 1,
    marginRight: 10,
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
  playButtonIcon: {
    width: 20,
    height: 20,
    tintColor: "#fff",
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
