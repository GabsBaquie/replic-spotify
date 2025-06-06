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
        <Image source={{ uri: albumArtUri || undefined }} style={{ width: 250, height: 225 }} />

          <Box style={{width: '100%', display: 'flex', alignItems: 'center'}}>
            
            <Box style={{ marginTop: 30, display: 'flex',  alignItems: 'flex-start', justifyContent: 'space-between', width: '50%' }}>
              <Text>{name} </Text>
              <Text variant="caption" color="text" opacity={0.5}>
              {artists[0]}
              </Text>
              <TouchableOpacity style={{position: 'absolute', right: 0}} onPress={() => {}}>
                <Image
                source={require('@/assets/images/icons/like_off.png')}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            
            </Box>
          </Box>
          <ScrollView style={{ width: '80%' }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 15, gap: 20, display: 'flex' }} showsVerticalScrollIndicator={false}>
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
                source={require('@/assets/images/icons/share.png')}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
              <Text variant="caption" color="text">
                Share
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