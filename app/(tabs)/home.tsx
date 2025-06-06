import { Box } from "@/components/restyle";
import TopArtists from "@/components/home/TopArtists";
import { StyleSheet, ScrollView } from "react-native";
import TrackPlayer from "@/components/player/TrackPlayer";
import { useState, useEffect } from 'react';
import getTopTracks from '@/query/profile/topTracks';

export default function Home() {
  const [tracks, setTracks] = useState<any[]>([]);
  useEffect(() => {
    getTopTracks(10).then(setTracks).catch(console.error);
  }, []);
  return (
    <Box style={styles.container}>
      <TopArtists />
      <ScrollView>
        {tracks[0] && (
          <TrackPlayer
            trackId={tracks[0].id}
          />
        )}
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
})