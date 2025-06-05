import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { RestyleButton } from '@/components/RestyleButton';
import { Box } from '@/components/restyle';

interface TrackPlayerProps {
  previewUrl: string | null;
}

export default function TrackPlayer({ previewUrl }: TrackPlayerProps) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!previewUrl) return;
      try {
        const { sound } = await Audio.Sound.createAsync({ uri: previewUrl });
        if (!isMounted) {
          await sound.unloadAsync();
          return;
        }
        soundRef.current = sound;
      } catch (e) {
        console.warn('Failed to load preview', e);
      }
    };

    load();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setIsPlaying(false);
    };
  }, [previewUrl]);

  const togglePlayback = async () => {
    const sound = soundRef.current;
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (status.isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  if (!previewUrl) return null;

  return (
    <Box marginTop="m" alignItems="center">
      <RestyleButton
        title={isPlaying ? 'Pause' : 'Play'}
        onPress={togglePlayback}
        variant="secondary"
      />
    </Box>
  );
}
