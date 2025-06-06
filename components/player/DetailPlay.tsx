import { Modal, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Box, Text } from '@/components/restyle';

export type TrackInfo = {
  name: string;
  artists: string[];
  albumArtUri: string | null;
  uri: string;
};

interface DetailPlayProps {
  visible: boolean;
  onClose: () => void;
  track: TrackInfo;
}

export default function DetailPlay({ visible, onClose, track }: DetailPlayProps) {
  const { name, artists, albumArtUri } = track;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Box style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
        <Box style={{width:'100%', height:'100%', paddingVertical: 75, backgroundColor: '#121212', borderRadius: 10, display: 'flex', alignItems: 'center'}}>
          <Image source={{ uri: albumArtUri || undefined }} style={{ width: 225, height: 225 }} />
          <Box flexDirection="column" justifyContent={'center'} alignItems={'center'} padding={'l'}>
            <Text>{name}</Text>
            <Text variant="caption" color="text" opacity={0.5}>
              {artists[0]}
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
            <TouchableOpacity onPress={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 5, width: '100%' }}>
              <Text>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </Box>
      </Box>
    </Modal>
  )
}