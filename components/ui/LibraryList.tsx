import { memo } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Box, Text } from "@/components/restyle";
import type { LibraryItem } from "@/hooks/useLibraryCollections";

type LibraryListProps = {
  items: LibraryItem[];
  isLoading: boolean;
  error?: string;
  onRetry: () => void;
  onSelectItem?: (item: LibraryItem) => void;
};

export const LibraryList = memo(
  ({ items, isLoading, error, onRetry, onSelectItem }: LibraryListProps) => {
    if (isLoading) {
      return (
        <View style={styles.stateContainer}>
          <Text>Chargement de la bibliothèque...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={onRetry}>
            <Text style={styles.retry}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!items.length) {
      return (
        <View style={styles.stateContainer}>
          <Text>Aucun élément pour cette catégorie.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        style={styles.flatList}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <LibraryListItem item={item} onPress={onSelectItem} />
        )}
        showsVerticalScrollIndicator={false}
      />
    );
  }
);

LibraryList.displayName = "LibraryList";

type LibraryListItemProps = {
  item: LibraryItem;
  onPress?: (item: LibraryItem) => void;
};

const LibraryListItem = ({ item, onPress }: LibraryListItemProps) => (
  <TouchableOpacity onPress={() => onPress?.(item)}>
    <Box style={styles.item}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.cover} />
      ) : (
        <Box
          style={[
            styles.cover,
            styles.fallbackCover,
            { backgroundColor: item.accentColor ?? "#2a2a2a" },
          ]}
        >
          <Ionicons name="musical-notes" color="#fff" size={20} />
        </Box>
      )}
      <View style={styles.itemText}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
      </View>
    </Box>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  flatList: {
    flex: 1,
  },
  list: {
    paddingVertical: 16,
    paddingBottom: 150,
    gap: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  cover: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  fallbackCover: {
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  itemSubtitle: {
    color: "#b3b3b3",
    marginTop: 4,
  },
  stateContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  errorText: {
    color: "#ff6b6b",
    marginBottom: 8,
  },
  retry: {
    color: "#fff",
    fontWeight: "600",
  },
});
