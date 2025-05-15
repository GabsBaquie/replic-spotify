import { Box, Text } from "@/components/restyle";
import TopArtists from "@/components/home/TopArtists";
import { StyleSheet } from "react-native";

export default function Home() {
  return (
    <Box>
      <TopArtists />
    </Box>
  );
}

const styles = StyleSheet.create({
})