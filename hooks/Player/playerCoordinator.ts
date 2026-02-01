/**
 * Coordinateur pour éviter de lancer Spotify et Supabase en même temps.
 * Quand on lance une musique Supabase → on met Spotify en pause.
 * Quand on lance une musique Spotify → on arrête le player Supabase.
 */

let spotifyPause: (() => Promise<void>) | null = null;
let supabaseStop: (() => Promise<void>) | null = null;

export function registerSpotifyPause(fn: (() => Promise<void>) | null) {
  spotifyPause = fn;
}

export function registerSupabaseStop(fn: (() => Promise<void>) | null) {
  supabaseStop = fn;
}

export async function pauseSpotify(): Promise<void> {
  if (spotifyPause) {
    try {
      await spotifyPause();
    } catch (e) {
      console.warn("[playerCoordinator] pauseSpotify error:", e);
    }
  }
}

export async function stopSupabase(): Promise<void> {
  if (supabaseStop) {
    try {
      await supabaseStop();
    } catch (e) {
      console.warn("[playerCoordinator] stopSupabase error:", e);
    }
  }
}
