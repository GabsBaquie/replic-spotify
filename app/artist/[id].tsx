import { Box, Text } from '@/components/restyle';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import getArtist from '@/query/search/getArtist';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

export default function ArtistScreen() {
  const { item } = useLocalSearchParams();
  const data = JSON.parse(item as string);
  const [playButtonImage, setPlayButtonImage] = useState(require('@/assets/images/icons/play.png'));
  const [downloadImage, setDownloadImage] = useState(require('@/assets/images/icons/download_off.png'));
  const [likeImage, setLikeImage] = useState(require('@/assets/images/icons/like_off.png'));
  const [loading, setLoading] = useState(false);
  const [artistInfo, setArtistInfo] = useState<any>(null);

    useEffect(() => {
        setLoading(true);
        getArtist(data.id)
            .then((artistData) => {
            setArtistInfo(artistData);
            console.log('✅ Artist Data:', artistData);
            })
            .catch((err: any) => console.error('❌ getArtist error:', err))
            .finally(() => setLoading(false));
    }, [data?.id]);

    console.log('🧪 Artist Info:', artistInfo);

    if (loading || !artistInfo) {
        return (
            <Box style={styles.container}>
                <Text>Loading artist information...</Text>
            </Box>
        );
    }

  return (
    <Box style={styles.container}>
      <Box flexDirection="row" justifyContent={'space-around'} backgroundColor='transparent' style={{ display: 'flex' }} width={'100%'}>
        <Image source={{ uri: artistInfo.images[0].url }} style={{ width: 225, height: 225, justifyContent: 'center', display: 'flex' }} />
      </Box>
      <Box flexDirection="row" justifyContent={'space-between'}alignItems={'center'}>
        <Text variant="body" color="text">
            {artistInfo.name}
        </Text>
      </Box>
    </Box>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 75,
  },
  play_button: {
    backgroundColor: '#1DB954',
    padding: 20,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
  }
});