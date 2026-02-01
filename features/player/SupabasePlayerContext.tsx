import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Audio } from "expo-av";
import type { TrackInfo } from "@/features/player/DetailPlay";
import { pauseSpotify } from "@/hooks/Player/playerCoordinator";
import { registerSupabaseStop } from "@/hooks/Player/playerCoordinator";

export type SupabasePlayerState = {
  playbackPosition: number;
  trackDuration: number;
  isPaused: boolean;
  track: TrackInfo | null;
};

type SupabasePlayerContextValue = {
  state: SupabasePlayerState | null;
  play: (track: TrackInfo) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  stop: () => Promise<void>;
};

const defaultPlayerValue: SupabasePlayerContextValue = {
  state: null,
  play: async () => {},
  pause: async () => {},
  resume: async () => {},
  togglePlayPause: async () => {},
  stop: async () => {},
};

const SupabasePlayerContext =
  createContext<SupabasePlayerContextValue>(defaultPlayerValue);

export function SupabasePlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<SupabasePlayerState | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const positionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isManualActionRef = useRef(false);

  const updatePosition = useCallback(async () => {
    if (!soundRef.current || !state) return;
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        setState((prev) =>
          prev
            ? {
                ...prev,
                playbackPosition: status.positionMillis || 0,
                trackDuration: status.durationMillis || 0,
                isPaused: !status.isPlaying,
              }
            : null
        );
      }
    } catch {}
  }, [state]);

  const stop = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    if (positionIntervalRef.current) {
      clearInterval(positionIntervalRef.current);
      positionIntervalRef.current = null;
    }
    setState(null);
  }, []);

  const pause = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return;
      isManualActionRef.current = true;
      await soundRef.current.pauseAsync();
      setState((prev) => (prev ? { ...prev, isPaused: true } : null));
      setTimeout(() => {
        isManualActionRef.current = false;
      }, 1000);
    } catch {
      isManualActionRef.current = false;
    }
  }, []);

  const resume = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return;
      isManualActionRef.current = true;
      await soundRef.current.playAsync();
      setState((prev) => (prev ? { ...prev, isPaused: false } : null));
      setTimeout(() => {
        isManualActionRef.current = false;
      }, 1000);
    } catch {
      isManualActionRef.current = false;
    }
  }, []);

  const play = useCallback(
    async (track: TrackInfo) => {
      try {
        if (state?.track?.uri === track.uri && !state.isPaused) return;
        if (state?.track?.uri === track.uri && state.isPaused && soundRef.current) {
          await resume();
          return;
        }

        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        if (positionIntervalRef.current) {
          clearInterval(positionIntervalRef.current);
          positionIntervalRef.current = null;
        }
        if (!track.uri) throw new Error("URL audio manquante");

        await pauseSpotify();

        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: track.uri },
          { shouldPlay: true }
        );
        soundRef.current = sound;

        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setState({
            playbackPosition: 0,
            trackDuration: status.durationMillis || 0,
            isPaused: false,
            track,
          });
          positionIntervalRef.current = setInterval(updatePosition, 1000);
        }

        sound.setOnPlaybackStatusUpdate((s) => {
          if (!s.isLoaded) return;
          if (s.didJustFinish) {
            setState((prev) =>
              prev ? { ...prev, playbackPosition: prev.trackDuration, isPaused: true } : null
            );
            if (positionIntervalRef.current) {
              clearInterval(positionIntervalRef.current);
              positionIntervalRef.current = null;
            }
            return;
          }
          const newIsPaused = !s.isPlaying;
          if (isManualActionRef.current) {
            setState((prev) =>
              prev
                ? {
                    ...prev,
                    playbackPosition: s.positionMillis || 0,
                    trackDuration: s.durationMillis || prev.trackDuration,
                  }
                : null
            );
          } else {
            setState((prev) =>
              prev
                ? {
                    ...prev,
                    playbackPosition: s.positionMillis || 0,
                    trackDuration: s.durationMillis || prev.trackDuration,
                    isPaused: newIsPaused,
                  }
                : null
            );
          }
        });
      } catch (error: any) {
        throw new Error(`Erreur lors de la lecture: ${error?.message || "Erreur inconnue"}`);
      }
    },
    [state, updatePosition, resume]
  );

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current || !state) return;
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) await pause();
        else await resume();
      }
    } catch {
      if (state.isPaused) await resume();
      else await pause();
    }
  }, [state, pause, resume]);

  useEffect(() => {
    registerSupabaseStop(stop);
    return () => {
      registerSupabaseStop(null);
    };
  }, [stop]);

  useEffect(() => {
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync().catch(() => {});
      if (positionIntervalRef.current) clearInterval(positionIntervalRef.current);
    };
  }, []);

  const value: SupabasePlayerContextValue = {
    state,
    play,
    pause,
    resume,
    togglePlayPause,
    stop,
  };

  return (
    <SupabasePlayerContext.Provider value={value}>
      {children}
    </SupabasePlayerContext.Provider>
  );
}

export function useSupabasePlayerContext() {
  return useContext(SupabasePlayerContext);
}
