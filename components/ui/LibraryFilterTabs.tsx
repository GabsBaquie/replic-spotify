import { memo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Box, Text } from "@/components/restyle";
import type { LibraryFilter } from "@/hooks/useLibraryCollections";

const FILTERS: { label: string; value: LibraryFilter }[] = [
  { label: "Playlists", value: "playlist" },
  { label: "Artists", value: "artist" },
  { label: "Albums", value: "album" },
  { label: "Podcasts & shows", value: "podcast" },
];

type LibraryFilterTabsProps = {
  activeFilter: LibraryFilter;
  onFilterChange: (filter: LibraryFilter) => void;
};

export const LibraryFilterTabs = memo(
  ({ activeFilter, onFilterChange }: LibraryFilterTabsProps) => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.container}
      >
        <Chip
          label="All"
          isActive={activeFilter === "all"}
          onPress={() => onFilterChange("all")}
        />
        {FILTERS.map((filter) => (
          <Chip
            key={filter.value}
            label={filter.label}
            isActive={activeFilter === filter.value}
            onPress={() => onFilterChange(filter.value)}
          />
        ))}
      </ScrollView>
    );
  }
);

LibraryFilterTabs.displayName = "LibraryFilterTabs";

type ChipProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

const Chip = ({ label, isActive, onPress }: ChipProps) => (
  <TouchableOpacity onPress={onPress}>
    <Box
      style={[
        styles.chip,
        {
          backgroundColor: isActive ? "#fff" : "#2a2a2a",
        },
      ]}
    >
      <Text style={[styles.chipText, { color: isActive ? "#000" : "#fff" }]}>
        {label}
      </Text>
    </Box>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  scroll: {
    marginBottom: 12,
    flexGrow: 0,
  },
  container: {
    gap: 12,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
