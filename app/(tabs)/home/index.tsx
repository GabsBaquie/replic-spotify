import { Box } from "@/components/restyle";
import TopArtists from "@/components/home/TopArtists";
import { StyleSheet, ScrollView } from "react-native";

export default function Home() {

  return (
    <Box style={styles.container}>
      <TopArtists />
      <ScrollView>
       
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
})