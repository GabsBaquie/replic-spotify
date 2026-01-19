import { useEffect, useState, useRef } from "react";
import { Audio } from "expo-av";
import type { TrackInfo } from "@/features/player/DetailPlay";

export type SupabasePlayerState = {
  playbackPosition: number;
  trackDuration: number;
  isPaused: boolean;
  track: TrackInfo | null;
};

/**
 * Hook pour piloter et récupérer l'état du playback audio Supabase.
 */
export default function useSupabasePlayer() {
  const [state, setState] = useState<SupabasePlayerState | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const positionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updatePosition = async () => {
    if (!soundRef.current || !state) return;

    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        setState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            playbackPosition: status.positionMillis || 0,
            trackDuration: status.durationMillis || 0,
            isPaused: !status.isPlaying,
          };
        });
      }
    } catch {
      // Erreur silencieuse lors de la mise à jour de position
    }
  };

  const play = async (track: TrackInfo) => {
    try {
      // Arrêter la lecture précédente si elle existe
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
        positionIntervalRef.current = null;
      }

      if (!track.uri) {
        throw new Error("URL audio manquante");
      }

      // Configurer le mode audio pour permettre la lecture
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Créer un nouveau Sound et démarrer la lecture
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        { shouldPlay: true }
      );

      soundRef.current = sound;

      // Récupérer la durée initiale
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setState({
          playbackPosition: 0,
          trackDuration: status.durationMillis || 0,
          isPaused: false,
          track,
        });

        // Mettre à jour la position toutes les secondes
        positionIntervalRef.current = setInterval(updatePosition, 1000);
      }

      // Écouter les événements de fin de lecture
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            // La chanson est terminée
            setState((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                playbackPosition: prev.trackDuration,
                isPaused: true,
              };
            });
            if (positionIntervalRef.current) {
              clearInterval(positionIntervalRef.current);
              positionIntervalRef.current = null;
            }
          } else {
            setState((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                playbackPosition: status.positionMillis || 0,
                trackDuration: status.durationMillis || prev.trackDuration,
                isPaused: !status.isPlaying,
              };
            });
          }
        }
      });
    } catch (error: any) {
      throw new Error(`Erreur lors de la lecture: ${error?.message || "Erreur inconnue"}`);
    }
  };

  const pause = async () => {
    if (!soundRef.current) return;

    try {
      await soundRef.current.pauseAsync();
      setState((prev) => {
        if (!prev) return null;
        return { ...prev, isPaused: true };
      });
    } catch {
      // Erreur silencieuse lors de la pause
    }
  };

  const resume = async () => {
    if (!soundRef.current) return;

    try {
      await soundRef.current.playAsync();
      setState((prev) => {
        if (!prev) return null;
        return { ...prev, isPaused: false };
      });
    } catch {
      // Erreur silencieuse lors de la reprise
    }
  };

  const togglePlayPause = async () => {
    if (!state) return;

    if (state.isPaused) {
      await resume();
    } else {
      await pause();
    }
  };

  const stop = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    if (positionIntervalRef.current) {
      clearInterval(positionIntervalRef.current);
      positionIntervalRef.current = null;
    }

    setState(null);
  };

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(console.error);
      }
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
      }
    };
  }, []);

  return {
    state,
    play,
    pause,
    resume,
    togglePlayPause,
    stop,
  };
}
