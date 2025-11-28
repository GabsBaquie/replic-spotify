import React, { useCallback } from "react";
import useArtist from "@/hooks/Spotify/useArtist";
import { Box } from "@/components/restyle";
import {
  View,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import PlayPauseButton from "@/components/ui/PlayPauseButton";
import { LibraryHero } from "@/components/ui/LibraryHero";
import { LibraryTrackRow } from "@/components/ui/LibraryTrackRow";
import { startPlayback } from "@/query/player/startPlayback";

export default function ArtistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { artist: artistDetails, tracks, loading } = useArtist(id);

  const handlePlay = useCallback(async (trackId: string) => {
    try {
      await startPlayback({ uris: [`spotify:track:${trackId}`] });
    } catch (error: any) {
      Alert.alert(
        "Lecture impossible",
        error?.message ?? "Réessaie plus tard."
      );
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!artistDetails) {
    return (
      <View style={styles.centered}>
        <Image
          source={require("@/assets/images/icons/artist.png")}
          style={styles.placeholderIcon}
        />
      </View>
    );
  }

  return (
    <Box style={styles.container}>
      <LibraryHero
        cover={
          <Image
            source={{
              uri:
                artistDetails.images?.[0]?.url ||
                "https://via.placeholder.com/300",
            }}
            style={styles.heroCover}
          />
        }
        title={artistDetails.name}
        subtitle={
          artistDetails.followers
            ? `${artistDetails.followers.total.toLocaleString()} followers`
            : undefined
        }
        metadata={artistDetails.genres?.slice(0, 2)}
        actions={
          <>
            <TouchableOpacity>
              <Image
                source={require("@/assets/images/icons/like_off.png")}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={require("@/assets/images/icons/more.png")}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </>
        }
        rightSlot={<PlayPauseButton />}
      />

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LibraryTrackRow
            title={item.name}
            subtitle={item.album?.name}
            imageUri={item.album?.images?.[0]?.url}
            onPress={() => handlePlay(item.id)}
            rightElement={
              <Image
                source={require("@/assets/images/icons/more.png")}
                style={styles.rowIcon}
                resizeMode="contain"
              />
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 60,
    paddingBottom: 150,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    width: 48,
    height: 48,
    tintColor: "#555",
  },
  heroCover: {
    width: 225,
    height: 225,
    borderRadius: 16,
  },
  actionIcon: {
    width: 20,
    height: 20,
  },
  rowIcon: {
    width: 20,
    height: 20,
  },
  separator: {
    height: 8,
  },
});
