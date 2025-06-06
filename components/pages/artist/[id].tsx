import React, { useState } from 'react';
import { Box, Text } from '@/components/restyle';
import { View, Image, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getArtistDetails, getTopTracksByArtist } from '@/query/artist/Artist';
import TrackPlayer from '@/components/player/TrackPlayer';
import { useQuery } from '@tanstack/react-query';

export default function ArtistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedTrackUrl, setSelectedTrackUrl] = useState<string | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  const { data: artistDetails, isLoading: isLoadingArtist } = useQuery({
    queryKey: ['artist', id],
    queryFn: () => getArtistDetails(id),
  });

  const { data: tracks, isLoading: isLoadingTracks } = useQuery({
    queryKey: ['tracks', id],
    queryFn: () => getTopTracksByArtist(id),
  });

  const isLoading = isLoadingArtist || isLoadingTracks;

  if (isLoading) {
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
      <View>
        <Text style={styles.trackName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Box style={styles.container}>
      {artistDetails.images && artistDetails.images.length > 0 && (
        <Image source={{ uri: artistDetails.images[0].url }} style={styles.artistImage} />
      )}
      <Text style={styles.artistName}>{artistDetails.name}</Text>
      <Text style={styles.heading}>Top Tracks</Text>
      <FlatList 
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.trackList}
      />
      {selectedTrackId && (
        <TrackPlayer trackId={selectedTrackId} />
      )}
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
    textAlign: 'center',
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  trackName: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});
