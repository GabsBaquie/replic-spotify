import type { TrackInfo } from "@/features/player/DetailPlay";
import { useSupabasePlayerContext } from "@/features/player/SupabasePlayerContext";

export type SupabasePlayerState = {
  playbackPosition: number;
  trackDuration: number;
  isPaused: boolean;
  track: TrackInfo | null;
};

/**
 * Hook pour piloter et récupérer l'état du playback audio Supabase.
 * Utilise le contexte partagé pour que la barre de lecture (NowPlayingBar) se mette à jour.
 */
export default function useSupabasePlayer() {
  return useSupabasePlayerContext();
}
