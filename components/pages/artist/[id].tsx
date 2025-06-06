import React, { useState } from 'react'
import useArtist from '@/hooks/useArtist'
import { Box, Text } from '@/components/restyle';
import { View, Image, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import PlayPauseButton from '@/components/ui/PlayPauseButton';

export default function ArtistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { artist: artistDetails, tracks, loading } = useArtist(id)
  const [selectedTrackUrl, setSelectedTrackUrl] = useState<string | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!artistDetails) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Unable to load artist details.</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedTrackUrl(item.preview_url);
        setSelectedTrackId(item.id);
      }}
      style={styles.trackItem}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Image
          source={{ uri: item.album.images[0]?.url || 'https://via.placeholder.com/150' }}
          style={{ width: 50, height: 50, borderRadius: 8, marginTop: 8 }}
        />
        <Text style={styles.trackName}>{item.name}</Text>
      </View>
      <TouchableOpacity onPress={() => {}}>
        <Image
          source={require('@/assets/images/icons/more.png')}
          style={{ width: 20, height: 20 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Box style={styles.container}>
      {artistDetails.images && artistDetails.images.length > 0 && (
        <Image source={{ uri: artistDetails.images[0].url }} style={styles.artistImage} />
      )}

      <Box flexDirection="row" alignItems="center" justifyContent="space-between" width="100%">
        <Text style={styles.artistName}>{artistDetails.name}</Text>
        <PlayPauseButton />
      </Box>
      
      <Text style={styles.heading}>Top Tracks</Text>
      
      <FlatList 
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.trackList}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  artistName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  trackList: {
    flexGrow: 0,
    marginBottom: 16,
  },
  trackItem: {
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackName: {
    fontSize: 16,
    fontWeight: 'semibold',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});