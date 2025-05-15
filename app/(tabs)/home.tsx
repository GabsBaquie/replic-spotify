import { Box, Text } from "@/components/restyle";
import TopArtists from "@/components/home/TopArtists";
import { StyleSheet } from "react-native";

export default function Home() {
  return (
    <Box style={styles.container}>
      <TopArtists />
    </Box>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
})