import {
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  View,
} from "react-native";
import { Box, Text } from "@/components/restyle";
import { useRouter } from "expo-router";

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
  const { name, artists, artistIds, albumArtUri } = track;
  const router = useRouter();

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
            <TouchableOpacity>
              <Image
                source={require("@/assets/images/icons/like_off.png")}
                style={styles.icon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </Box>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
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
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 5,
    width: "100%",
    marginTop: 20,
  },
});
