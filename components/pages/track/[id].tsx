import { Box, Text } from '@/components/restyle';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import useSpotifyPlayer from '@/hooks/useSpotifyPlayer'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDeviceId } from '@/query/player/getLocalDeviceId';

const API_BASE = 'https://api.spotify.com/v1';

export default function TrackScreen() {
  const { item } = useLocalSearchParams();
  const data = JSON.parse(item as string);
  const [likeImage, setLikeImage] = useState(require('@/assets/images/icons/like_off.png'));
  const [modalVisible, setModalVisible] = useState(false);
  const [downloadImage, setDownloadImage] = useState(require('@/assets/images/icons/download_off.png'));

  const { state, togglePlayPause } = useSpotifyPlayer();
  const { isPaused } = state || { isPaused: false };

  const handlePlayPause = async () => {
    if (!state) return;
    try {
      if (state.isPaused) {
        const token = await AsyncStorage.getItem('spotify_access_token');
        if (!token) throw new Error('Token manquant');
        const deviceId = await getLocalDeviceId();
        if (!deviceId) throw new Error('Pas d’appareil Spotify');
        await fetch(`${API_BASE}/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ context_uri: `spotify:album:${data.album.id}` }),
        });
      } else {
        togglePlayPause();
      }
    } catch (e) {
      console.error('Erreur play album :', e);
    }
  };

  return (
    <Box style={styles.container}>
      <Box>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }
        }>
          <Box style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
            <Box style={{width:'100%', height:'100%', paddingVertical: 75, backgroundColor: '#121212', borderRadius: 10, display: 'flex', alignItems: 'center'}}>
              <Image source={{ uri: data.album.images[0]?.url }} style={{ width: 225, height: 225, justifyContent: 'center', display: 'flex' }} />
              <Box flexDirection="column" justifyContent={'center'} alignItems={'center'} padding={'l'}>
                <Text>{data.name}</Text>
                <Text variant="caption" color="text" opacity={0.5}>
                  {data.artists[0]?.name}
                </Text>
              </Box>
              <ScrollView style={{ width: '80%' }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 15, gap: 20, display: 'flex' }} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={{ flexDirection: 'row', gap:10 }} onPress={() => {}}>
                  <Image
                    source={require('@/assets/images/icons/like_off.png')}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                  <Text variant="caption" color="text">
                    Like
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', gap:10 }} onPress={() => {}}>
                  <Image
                    source={require('@/assets/images/icons/hide.png')}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                  <Text variant="caption" color="text">
                    Hide song
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', gap:10 }} onPress={() => {}}>
                  <Image
                    source={require('@/assets/images/icons/add_playlist.png')}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                  <Text variant="caption" color="text">
                    Add to playlist
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', gap:10 }} onPress={() => {}}>
                  <Image
                    source={require('@/assets/images/icons/add_queue.png')}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                  <Text variant="caption" color="text">
                    Add to queue
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', gap:10 }} onPress={() => {}}>
                  <Image
                    source={require('@/assets/images/icons/share.png')}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                  <Text variant="caption" color="text">
                    Share
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', gap:10 }} onPress={() => {}}>
                  <Image
                    source={require('@/assets/images/icons/radio.png')}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                  <Text variant="caption" color="text">
                    Go to radio
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', gap:10 }} onPress={() => {
                  router.push({
                    pathname: '/(tabs)/search/album/[id]',
                    params: {
                      id: data.album.id,
                      item: JSON.stringify(data.album),
                    },
                  });
                  setModalVisible(false);
                }}>
                  <Image
                    source={require('@/assets/images/icons/album.png')}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                  <Text variant="caption" color="text">
                    View album
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', gap:10 }} onPress={() => {}}>
                  <Image
                    source={require('@/assets/images/icons/artist.png')}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                  <Text variant="caption" color="text">
                    View artist
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', gap:10 }} onPress={() => {}}>
                  <Image
                    source={require('@/assets/images/icons/credits.png')}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                  <Text variant="caption" color="text">
                    Song credits
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: 'row', gap:10 }} onPress={() => {}}>
                  <Image
                    source={require('@/assets/images/icons/sleep.png')}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                  <Text variant="caption" color="text">
                    Sleep timer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 5, width: '100%' }}>
                  <Text>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </Box>
          </Box>
        </Modal>
        <Box flexDirection="row" justifyContent={'space-around'} backgroundColor='transparent' style={{ display: 'flex' }} width={'100%'}>
          <Image source={{ uri: data.album.images[0]?.url }} style={{ width: 225, height: 225, justifyContent: 'center', display: 'flex' }} />
        </Box>
        <Box flexDirection="row" justifyContent={'space-between'}alignItems={'center'}>
          <Box>
            <Box flexDirection="column" paddingVertical={'l'} >
              <Text>{data.name}</Text>
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: '/home/artist/[id]',
                    params: {
                      id: data.artists[0].id,
                      item: JSON.stringify(data.artists[0]),
                    },
                  });
                }
              }>
                <Text variant="body" color="text">
                  {data.artists[0]?.name}
                </Text>
              </TouchableOpacity>
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
                    pathname: '/(tabs)/search/album/[id]',
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
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Image
                  source={require('@/assets/images/icons/more.png')}
                  style={{ width: 20, height: 20 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </Box>
          </Box>
          <Box>
            <TouchableOpacity style={styles.play_button} onPress={handlePlayPause}>
              <Image
                source={isPaused
                  ? require('@/assets/images/icons/play.png')
                  : require('@/assets/images/icons/pause.png')}
                style={{ width: 20, height: 20 }}
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
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image
              source={require('@/assets/images/icons/more.png')}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Box>
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