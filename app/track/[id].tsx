import { Box, Text } from '@/components/restyle';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function TrackScreen() {
  const { item } = useLocalSearchParams();
  const data = JSON.parse(item as string);
  const [playButtonImage, setPlayButtonImage] = useState(require('@/assets/images/icons/play.png'));
  const [downloadImage, setDownloadImage] = useState(require('@/assets/images/icons/download_off.png'));
  const [likeImage, setLikeImage] = useState(require('@/assets/images/icons/like_off.png'));

  return (
    <Box style={styles.container}>
      <Box flexDirection="row" justifyContent={'space-around'} backgroundColor='transparent' style={{ display: 'flex' }} width={'100%'}>
        <Image source={{ uri: data.album.images[0]?.url }} style={{ width: 225, height: 225, justifyContent: 'center', display: 'flex' }} />
      </Box>
      <Box flexDirection="row" justifyContent={'space-between'}alignItems={'center'}>
        <Box>
          <Box flexDirection="column" paddingVertical={'l'} >
            <Text>{data.name}</Text>
            <Text variant="body" color="text">
              {data.artists[0]?.name}
            </Text>
            <Box flexDirection="row" gap={'xs'} style={{ opacity: 0.5 }} >
              <Text variant="caption" color="text">
                Single
              </Text>
              <Text variant="caption" color="text">
                -
              </Text>
              <Text variant="caption" color="text">
                {data.album.release_date.split('-')[0]}
              </Text>
            </Box>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: '/album/[id]',
                  params: {
                    id: data.album.id,
                    item: JSON.stringify(data.album),
                  },
                });
              }}
            >
              <Text variant="caption" color="text" style={{ opacity: 0.3 }}>
                {data.album.name}
              </Text>
            </TouchableOpacity>
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
        <Box>
          <TouchableOpacity style={styles.play_button} onPress={() => { 
            setPlayButtonImage((prev: import('react-native').ImageSourcePropType) => {
              return prev === require('@/assets/images/icons/play.png')
                ? require('@/assets/images/icons/pause.png')
                : require('@/assets/images/icons/play.png');
            });
          }}>
            <Image
              source={playButtonImage}
              style={{ width: 20, height: 20}}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Box>
      </Box>
      <Box flexDirection="row" gap={'m'} paddingVertical={'l'} alignItems="center" justifyContent="space-between">
        <Box>
          <Text variant="body" color="text">
            {data.name}
          </Text>
          <Text variant="body" color="text" style={{ opacity: 0.5 }}>
            {data.artists[0]?.name}
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