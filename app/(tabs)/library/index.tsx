import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Box, Text } from "@/components/restyle";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { LibraryFilterTabs } from "@/components/library/LibraryFilterTabs";
import { LibraryList } from "@/components/library/LibraryList";
import { useProfile } from "@/hooks/useProfile";
import {
  LibraryFilter,
  useLibraryCollections,
} from "@/hooks/useLibraryCollections";

const Library = () => {
  const [filter, setFilter] = useState<LibraryFilter>("all");
  const { profile } = useProfile();
  const { isLoading, error, refetch, getFilteredItems } =
    useLibraryCollections();

  const filteredItems = useMemo(
    () => getFilteredItems(filter),
    [filter, getFilteredItems]
  );

  return (
    <Box style={styles.container}>
      <LibraryHeader profile={profile} />
      <LibraryFilterTabs activeFilter={filter} onFilterChange={setFilter} />
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Recently played</Text>
      </View>
      <LibraryList
        items={filteredItems}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metaLabel: {
    color: "#fff",
    fontWeight: "600",
  },
  metaIcon: {
    color: "#fff",
    fontSize: 18,
  },
});

export default Library;
