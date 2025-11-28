import { startPlayback } from "./startPlayback";

/**
 * Historique util partagé : on garde la signature pour compat.
 * Utilise désormais startPlayback pour piloter la lecture.
 */
export async function playSpotifyTrack(trackId: string): Promise<void> {
  await startPlayback({ uris: [`spotify:track:${trackId}`] });
}
