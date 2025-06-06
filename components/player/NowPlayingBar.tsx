import React, { useState } from 'react';
import DetailPlay, { TrackInfo } from '@/components/player/DetailPlay';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ColorValue,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useSpotifyPlayer from '@/hooks/useSpotifyPlayer';

interface NowPlayingBarProps {
  backgroundColor?: ColorValue;
}

export default function NowPlayingBar({
  backgroundColor = '#121212',
}: NowPlayingBarProps) {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);

  const { state, togglePlayPause } = useSpotifyPlayer();

  if (!state) return null;

  const { playbackPosition, trackDuration, isPaused, track } = state;
  const { name: trackName, artists, albumArtUri } = track;
  const artistNames = artists.join(', ');

  const progressFraction =
    trackDuration > 0 ? playbackPosition / trackDuration : 0;

  const formatMsToMMSS = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : n.toString());
    return `${pad(m)}:${pad(s)}`;
  };

  return (
    <>
      <Pressable onPress={() => setModalVisible(true)}>
        <View
          style={[
            styles.container,
            { backgroundColor, paddingBottom: insets.bottom || 0 },
          ]}
        >
          {/* Pochette + Titre/Artiste */}
          <View style={styles.trackInfoContainer}>
            {albumArtUri ? (
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Image source={{ uri: albumArtUri }} style={styles.albumArt} />
              </TouchableOpacity>
            ) : (
              <View style={[styles.albumArt, styles.albumArtPlaceholder]} />
            )}
            <View style={styles.textContainer}>
              <Text style={styles.trackName} numberOfLines={1}>
                {trackName}
              </Text>
              <Text style={styles.artistName} numberOfLines={1}>
                {artistNames}
              </Text>
            </View>
          </View>

          {/* Play / Pause */}
          <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
            <Text style={styles.playPauseIcon}>{isPaused ? '▶︎' : '⏸︎'}</Text>
          </TouchableOpacity>

          {/* Barre de progression sans "bulle" */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground} />
            <View
              style={[
                styles.progressFill,
                { width: `${Math.floor(progressFraction * 100)}%` },
              ]}
            />
            <View style={styles.timeLabels}>
              <Text style={styles.timeText}>{formatMsToMMSS(playbackPosition)}</Text>
              <Text style={styles.timeText}>{formatMsToMMSS(trackDuration)}</Text>
            </View>
          </View>
        </View>
      </Pressable>
      <DetailPlay
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        track={track as TrackInfo}
      />
    </>
  );
}

const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 80,
      left: 0,
      right: 0,
      height: 80,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      borderRadius: 10,
    },
    
    trackInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 3,
    },
    albumArt: {
      width: 48,
      height: 48,
      borderRadius: 4,
      backgroundColor: '#333333',
    },
    albumArtPlaceholder: {
      backgroundColor: '#555555',
    },
    textContainer: {
      marginLeft: 8,
      flexShrink: 1,
    },
    trackName: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    artistName: {
      color: '#B3B3B3',
      fontSize: 12,
      marginTop: 2,
    },
    playPauseButton: {
      flex: 1,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    playPauseIcon: {
      fontSize: 24,
      color: '#FFFFFF',
    },
    
    progressContainer: {
      position: 'absolute',
      top: 60,
      left: 12,
      right: 12,
      height: 20,
    },
  
    progressBackground: {
      height: 4,
      backgroundColor: '#404040',
      borderRadius: 2,
      paddingHorizontal: 5,
    },
    progressFill: {
      position: 'absolute',
      left: 0,
      height: 4,
      backgroundColor: '#1DB954',
      borderRadius: 2,
    },
  
    timeLabels: {
      flexDirection: 'row',
      margin: 4,
      justifyContent: 'space-between',
    },
    timeText: {
      color: '#B3B3B3',
      fontSize: 10,
    },
  });