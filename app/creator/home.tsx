import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { Box, Text } from "@/components/restyle";
import { useProfile } from "@/hooks/Spotify";
import { useRouter } from "expo-router";
import { RestyleButton } from "@/components/RestyleButton";
import { useCreatorTracks, type CreatorTrack } from "@/hooks/ArtistCreator/useCreatorTracks";
import { useCreatorProfile } from "@/hooks/ArtistCreator/useCreatorProfile";
import DetailPlay, { TrackInfo } from "@/features/player/DetailPlay";
import { getSignedUrl } from "@/lib/supabase/storage";
import { getStoragePath } from "@/lib/supabase/utils";

const CreatorHome = () => {
  const { artist, loading } = useCreatorProfile();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<TrackInfo | null>(null);
  const [isDetailPlayVisible, setDetailPlayVisible] = useState(false);
  const { profile: spotifyProfile, isLoading: spotifyLoading } = useProfile();
  const {
    loading: tracksLoading,
    validatedTracks,
    pendingTracks,
    rejectedTracks,
  } = useCreatorTracks();
  const router = useRouter();

  const convertToTrackInfo = (track: CreatorTrack, signedUrl?: string | null): TrackInfo => {
    const uri = signedUrl !== undefined ? (signedUrl || "") : (track.songUrl || "");
    
    return {
      name: track.title,
      artists: track.artists.length > 0 
        ? track.artists 
        : track.coCreators.length > 0 
        ? track.coCreators 
        : ["Artiste inconnu"],
      artistIds: track.artistIds.length > 0 ? track.artistIds : [],
      albumArtUri: track.coverUri,
      uri,
    };
  };

  const handleTrackPress = async (track: CreatorTrack) => {
    let finalUri: string | null = track.songUrl;
    
    if (finalUri && !finalUri.startsWith("http://") && !finalUri.startsWith("https://")) {
      const storagePath = getStoragePath(finalUri);
      
      if (storagePath) {
        try {
          finalUri = await getSignedUrl("tracks", storagePath, 3600);
        } catch (error: any) {
          finalUri = error?.message?.includes("Object not found") ? track.songUrl : null;
        }
      } else {
        finalUri = track.songUrl;
      }
    }
    
    const trackInfo = convertToTrackInfo(track, finalUri);
    setSelectedTrack(trackInfo);
    setDetailPlayVisible(true);
  };

  // image_url contient déjà l'URL publique complète depuis Supabase
  // Fallback vers photoUri depuis AsyncStorage si image_url est null
  const [fallbackImageUri, setFallbackImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (!artist?.image_url) {
      // Si pas d'image_url depuis Supabase, essayer de récupérer depuis AsyncStorage
      const loadFallbackImage = async () => {
        const oldProfile = await AsyncStorage.getItem("creator_profile");
        if (oldProfile) {
          try {
            const parsed = JSON.parse(oldProfile);
            if (parsed.photoUri) {
              setFallbackImageUri(parsed.photoUri);
            }
          } catch (err) {
            // Erreur silencieuse lors du chargement de l'image de fallback
          }
        }
      };
      loadFallbackImage();
    } else {
      setFallbackImageUri(null); // Réinitialiser si on a une image_url
    }
  }, [artist]);

  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const hasTriedFallback = useRef(false); // Mémorise qu'on a déjà tenté le fallback

  // Priorité : image_url depuis Supabase > fallback photoUri > null
  // Si on a déjà tenté le fallback, utiliser directement le fallback
  const imageUrl =
    hasTriedFallback.current || imageError
      ? fallbackImageUri
      : artist?.image_url || fallbackImageUri;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1DB954" />
        <Text>Chargement de ton espace creator...</Text>
      </View>
    );
  }

  if (!artist) {
    return (
      <View style={styles.center}>
        <Text>Aucune information creator. Reviens au formulaire.</Text>
        <RestyleButton
          title="Créer mon profil creator"
          onPress={() => router.push("/creator")}
          fullWidth
          marginTop="l"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.creatorRow}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.avatar}
            onError={(error) => {
              setImageLoading(false);

              // Si l'erreur vient de l'image Supabase et qu'on n'a pas encore tenté le fallback
              if (
                artist?.image_url &&
                !hasTriedFallback.current &&
                fallbackImageUri
              ) {
                hasTriedFallback.current = true; // Mémoriser qu'on a tenté le fallback
                setImageError(true);
                setImageLoading(true); // Réessayer avec le fallback
              }
            }}
            onLoad={() => {
              // Ne pas réinitialiser imageError si on utilise déjà le fallback
              if (!hasTriedFallback.current) {
                setImageError(false);
              }
              setImageLoading(false);
            }}
            onLoadStart={() => {
              setImageLoading(true);
            }}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]} />
        )}
        {imageLoading && imageUrl && (
          <ActivityIndicator
            style={StyleSheet.absoluteFill}
            color="#1DB954"
            size="small"
          />
        )}
        <View style={styles.creatorInfo}>
          <Text style={styles.stageName}>{artist.name}</Text>
          <Text style={styles.badge}>
            {artist.status === "validated"
              ? "Creator confirmé"
              : artist.status === "pending"
              ? "En attente de validation"
              : "Refusé"}
          </Text>
        </View>
      </TouchableOpacity>

      <RestyleButton
        title="Envoyer un nouveau morceau"
        onPress={() => router.push("/creator/upload")}
        fullWidth
        marginTop="l"
      />

      <Box style={styles.section}>
        <Text style={styles.sectionTitle}>Validés récemment</Text>
        {tracksLoading ? (
          <ActivityIndicator color="#1DB954" style={styles.sectionLoader} />
        ) : validatedTracks.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.slider}
          >
            {validatedTracks.map((track) => (
              <TouchableOpacity
                key={track.id}
                style={styles.sliderCard}
                onPress={() => handleTrackPress(track)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: track.coverUri }}
                  style={styles.sliderCover}
                />
                <Text style={styles.sliderTitle} numberOfLines={1}>
                  {track.title}
                </Text>
                <Text style={styles.badgeValidated}>Validé</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Box style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Aucun morceau validé pour l’instant.
            </Text>
          </Box>
        )}
      </Box>

      <Box style={styles.section}>
        <Text style={styles.sectionTitle}>En validation</Text>
        {tracksLoading ? (
          <ActivityIndicator color="#1DB954" style={styles.sectionLoader} />
        ) : pendingTracks.length > 0 ? (
          pendingTracks.map((track) => (
            <View key={track.id} style={styles.pendingRow}>
              <Image
                source={{ uri: track.coverUri }}
                style={styles.pendingCover}
              />
              <View style={styles.pendingInfo}>
                <Text style={styles.pendingTitle}>{track.title}</Text>
                {track.coCreators.length > 0 && (
                  <Text style={styles.pendingCoCreators} numberOfLines={1}>
                    Avec {track.coCreators.join(", ")}
                  </Text>
                )}
              </View>
              <Text style={styles.badgePending}>En validation</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Aucune soumission en attente.</Text>
        )}
      </Box>

      <Box style={styles.section}>
        <Text style={styles.sectionTitle}>Refusés</Text>
        {tracksLoading ? (
          <ActivityIndicator color="#1DB954" style={styles.sectionLoader} />
        ) : rejectedTracks.length > 0 ? (
          rejectedTracks.map((track) => (
            <View key={track.id} style={styles.pendingRow}>
              <Image
                source={{ uri: track.coverUri }}
                style={styles.pendingCover}
              />
              <View style={styles.pendingInfo}>
                <Text style={styles.pendingTitle}>{track.title}</Text>
                {track.coCreators.length > 0 && (
                  <Text style={styles.pendingCoCreators} numberOfLines={1}>
                    Avec {track.coCreators.join(", ")}
                  </Text>
                )}
              </View>
              <Text style={styles.badgeRejected}>Rejeté</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Aucun morceau refusé.</Text>
        )}
      </Box>

      <Box style={styles.footer}>
        <RestyleButton
          title="Revenir à l’accueil classique"
          onPress={() => router.replace("/(tabs)/home")}
          fullWidth
          marginTop="s"
          variant="outline"
        />
      </Box>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Fermer</Text>
            </TouchableOpacity>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContent}
            >
              <View style={styles.modalRow}>
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.modalAvatar}
                  />
                ) : (
                  <View style={[styles.modalAvatar, styles.avatarFallback]} />
                )}
                <View style={styles.modalInfo}>
                  <Text style={styles.modalName}>{artist.name}</Text>
                  <Text style={styles.badge}>
                    {artist.status === "validated"
                      ? "Creator confirmé"
                      : artist.status === "pending"
                      ? "En attente de validation"
                      : "Refusé"}
                  </Text>
                </View>
              </View>
              <Text style={styles.modalLabel}>Bio</Text>
              <Text style={styles.modalDescription}>
                {artist.bio || "Aucune bio"}
              </Text>

              <View style={styles.divider} />

              <Text style={styles.modalTitle}>Compte Spotify lié</Text>
              {spotifyLoading ? (
                <ActivityIndicator
                  color="#1DB954"
                  style={styles.loadingIndicator}
                />
              ) : spotifyProfile ? (
                <>
                  <Text style={styles.spotifyName}>
                    {spotifyProfile.display_name}
                  </Text>
                  <Text style={styles.spotifyEmail}>
                    {spotifyProfile.email}
                  </Text>
                </>
              ) : (
                <Text style={styles.modalDescription}>
                  Impossible de charger ton profil Spotify.
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Popup DetailPlay pour les chansons */}
      {selectedTrack && (
        <DetailPlay
          visible={isDetailPlayVisible}
          onClose={() => {
            setDetailPlayVisible(false);
            setSelectedTrack(null);
          }}
          track={selectedTrack}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#121212",
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1e",
    borderRadius: 20,
    padding: 16,
    marginTop: 32,
  },
  footer: {
    marginTop: "auto",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  avatarFallback: {
    backgroundColor: "#2f2f2f",
  },
  creatorInfo: {
    marginLeft: 16,
  },
  stageName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  badge: {
    color: "#1DB954",
    marginTop: 4,
  },
  section: {
    marginTop: 32,
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
  sectionLoader: {
    marginTop: 16,
  },
  slider: {
    paddingVertical: 8,
    gap: 16,
  },
  sliderCard: {
    width: 150,
    backgroundColor: "#1c1c1e",
    borderRadius: 18,
    padding: 12,
    marginRight: 16,
  },
  sliderCover: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  sliderTitle: {
    color: "#fff",
    fontWeight: "600",
  },
  badgeValidated: {
    marginTop: 6,
    color: "#58f087",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#1c1c1e",
  },
  emptyText: {
    color: "#7a7a7a",
  },
  pendingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2a2a2a",
  },
  pendingCover: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
  },
  pendingInfo: {
    flex: 1,
  },
  pendingTitle: {
    color: "#fff",
    fontWeight: "600",
  },
  pendingCoCreators: {
    color: "#a0a0a0",
    marginTop: 4,
  },
  badgePending: {
    color: "#f6c343",
    fontWeight: "700",
    fontSize: 12,
  },
  badgeRejected: {
    color: "#ff6b6b",
    fontWeight: "700",
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#1c1c1e",
    borderRadius: 24,
    padding: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  closeText: {
    color: "#fff",
  },
  modalContent: {
    paddingBottom: 16,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  modalInfo: {
    marginLeft: 16,
  },
  modalName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  modalLabel: {
    color: "#a0a0a0",
    marginTop: 16,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalDescription: {
    color: "#d0d0d0",
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#2a2a2a",
    marginVertical: 20,
  },
  spotifyName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  spotifyEmail: {
    color: "#d0d0d0",
    marginTop: 4,
  },
  loadingIndicator: {
    marginVertical: 8,
  },
});

export default CreatorHome;
