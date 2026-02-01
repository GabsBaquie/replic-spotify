// Client Supabase
export { supabase, supabaseUrl, supabaseAnonKey } from "./client";

// Types
export type {
  Artist,
  ArtistStatus,
  Song,
  SongStatus,
  SongArtist,
  SongWithArtists,
  UploadableFile,
} from "./types";

// Storage
export { uploadFile, getPublicUrl, getSignedUrl } from "./storage";

// Artists
export {
  createArtist,
  getArtistById,
  getArtistBySpotifyUserId,
  updateArtistSpotifyUserId,
  searchArtistsByName,
  getValidatedArtists,
  getPendingArtists,
  validateArtist,
  refuseArtist,
} from "./artists";

// Songs
export {
  createSong,
  getValidatedSongs,
  getPendingSongs,
  getRefusedSongs,
  getSongsByArtistId,
  searchValidatedSongsByArtistName,
  validateSong,
  refuseSong,
} from "./songs";
