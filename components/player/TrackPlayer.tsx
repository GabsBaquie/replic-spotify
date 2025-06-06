import React, { useState } from 'react';
import { Alert } from 'react-native';
import { RestyleButton } from '@/components/RestyleButton';
import { Box } from '@/components/restyle';

// Votre fonction qui appelle Spotify Web API pour lancer la lecture :
import { playSpotifyTrack } from '@/query/player/playSpotifyTrack';
// Fonction qui récupère l’ID du device local (Web Playback SDK)
import { getLocalDeviceId } from '@/query/player/getLocalDeviceId';

interface TrackPlayerProps {
  /** ID Spotify complet (ex : "3n3Ppam7vgaVa1iaRUc9Lp") */
  trackId: string;
}

export default function TrackPlayer({ trackId }: TrackPlayerProps) {
  // État pour désactiver le bouton une fois lancé
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayFullTrack = async () => {
    try {
      // 1) Récupérer l’ID du device local (Web Playback SDK), 
      //    qui correspond à la WebView cachée ou au player Spotify intantié
      const deviceId = await getLocalDeviceId();
      // 2) Lancer la lecture complète sur ce device
      await playSpotifyTrack(trackId, deviceId ?? undefined);

      // 3) Désactiver le bouton pour indiquer que c’est en cours
      setIsPlaying(true);
    } catch (e: any) {
      Alert.alert('Erreur de lecture Spotify', e.message);
      
    }
  };

  return (
    <Box marginTop="m" alignItems="center">
      <RestyleButton
        title={isPlaying ? 'En cours sur Spotify…' : 'Lire sur Spotify'}
        onPress={handlePlayFullTrack}
        variant="primary"
        disabled={isPlaying}
      />
    </Box>
  );
}