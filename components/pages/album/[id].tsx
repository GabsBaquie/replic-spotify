import { Box, Text } from '@/components/restyle';
import PlayPauseButton from '@/components/ui/PlayPauseButton';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Image, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import albumTracks from '@/query/search/albumTracks';

export default function AlbumScreen() {
  const { item } = useLocalSearchParams();
  const data = JSON.parse(item as string);
  const [downloadImage, setDownloadImage] = useState(require('@/assets/images/icons/download_off.png'));
  const [likeImage, setLikeImage] = useState(require('@/assets/images/icons/like_off.png'));
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<any[]>([]);

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      try {
        const trackData = await albumTracks(data.id);
        setTracks(trackData.items);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching album tracks:', error);
        setLoading(false);
      }
    };
    fetchTracks();
  }, [data.id]);

  return (
    <Box style={styles.container}>
      <Box flexDirection="row" justifyContent={'space-around'} backgroundColor='transparent' style={{ display: 'flex' }} width={'100%'}>
        <Image source={{ uri: data.images[0]?.url }} style={{ width: 225, height: 225, justifyContent: 'center', display: 'flex' }} />
      </Box>
      <Box flexDirection="row" justifyContent={'space-between'} alignItems={'center'}>
        <Box>
          <Box flexDirection="column" paddingVertical={'l'} >
            <Text>{data.name}</Text>
            <Text variant="body" color="text">
              {data.artists[0]?.name}
            </Text>
            <Box flexDirection="row" gap={'xs'} style={{ opacity: 0.5 }} >
              <Text variant="caption" color="text">
                Album
              </Text>
              <Text variant="caption" color="text">
                -
              </Text>
              <Text variant="caption" color="text">
                {data.release_date.split('-')[0]}
              </Text>
            </Box>
          </Box>
          <Box flexDirection="row" gap={'m'}>
            <TouchableOpacity onPress={() => {
              setLikeImage((prev: import('react-native').ImageSourcePropType) => {
                return prev === require('@/assets/images/icons/like_off.png')
                  ? require('@/assets/images/icons/like_on.png')
                  : require('@/assets/images/icons/like_off.png');
              });
            }}>
              <Image
                source={likeImage}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              setDownloadImage((prev: import('react-native').ImageSourcePropType) => {
                return prev === require('@/assets/images/icons/download_off.png')
                  ? require('@/assets/images/icons/download_on.png')
                  : require('@/assets/images/icons/download_off.png');
              });
            }}>
              <Image
                source={downloadImage}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={require('@/assets/images/icons/more.png')}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </Box>
        </Box>
        <PlayPauseButton />
      </Box>
      <FlatList
      data={tracks}
      style={{ marginTop: 20 }}
      keyExtractor={(item, index) => item.id?.toString() || index.toString()}
      renderItem={({ item }) => (
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom="s">
          <Box>
              <Text variant="body" color="text">
              {item.name}
              </Text>
              <Text variant="body" color="text" style={{ opacity: 0.5 }}>
              {item.artists?.[0]?.name}
              </Text>
          </Box>
          <TouchableOpacity>
              <Image
              source={require('@/assets/images/icons/more.png')}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
              />
          </TouchableOpacity>
        </Box>
        )}
        showsVerticalScrollIndicator={false}
      />
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