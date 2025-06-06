import { Box } from "@/components/restyle";
import TopArtists from "@/components/home/TopArtists";
import { StyleSheet } from "react-native";
import RecentlyPlayed from '@/components/home/RecentlyPlayed';

export default function Home() {

  return (
    <Box style={styles.container}>
      <TopArtists />
      <RecentlyPlayed />  
    </Box>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
})