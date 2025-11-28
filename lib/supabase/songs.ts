import { supabase } from "./client";
import type {
  Song,
  SongWithArtists,
  UploadableFile,
  SongStatus,
} from "./types";
import { uploadFile } from "./storage";
import { toStoragePath, mapSongRows } from "./utils";

export const createSong = async (
  title: string,
  imageFile: UploadableFile,
  audioFile: UploadableFile,
  artistIds: string[],
  spotifyToken: string
) => {
  const coverBlob =
    imageFile instanceof Blob
      ? imageFile
      : imageFile instanceof File
      ? imageFile
      : new Blob([imageFile]);

  const audioBlob =
    audioFile instanceof Blob
      ? audioFile
      : audioFile instanceof File
      ? audioFile
      : new Blob([audioFile]);

  const coverResult = await uploadFile(
    "albums_images",
    toStoragePath(
      "songs",
      typeof File !== "undefined" && imageFile instanceof File
        ? imageFile.name
        : "cover.jpg"
    ),
    coverBlob,
    spotifyToken
  );

  const audioResult = await uploadFile(
    "tracks",
    toStoragePath(
      "tracks",
      typeof File !== "undefined" && audioFile instanceof File
        ? audioFile.name
        : "track.mp3"
    ),
    audioBlob,
    spotifyToken
  );

  const { data: song, error: songError } = await supabase
    .from("songs")
    .insert({
      title,
      image_url: coverResult.url,
      song_url: audioResult.path,
      status: "pending" satisfies SongStatus,
    })
    .select("*")
    .single();

  if (songError || !song)
    throw new Error(`Création song échouée: ${songError?.message}`);

  if (artistIds.length) {
    const { error: junctionError } = await supabase
      .from("songs_artists")
      .insert(
        artistIds.map((artist_id) => ({
          song_id: song.id,
          artist_id,
        }))
      );
    if (junctionError)
      throw new Error(
        `Association song/artists échouée: ${junctionError.message}`
      );
  }

  return song as Song;
};

export const getValidatedSongs = async (): Promise<SongWithArtists[]> => {
  const { data, error } = await supabase
    .from("songs")
    .select(
      `
        id, title, image_url, song_url, status, created_at,
        songs_artists (
          artist:artists (
            id, name, bio, image_url, status, created_at
          )
        )
      `
    )
    .eq("status", "validated");

  if (error || !data)
    throw new Error(`Lecture songs validés échouée: ${error?.message}`);
  return mapSongRows(data, { onlyValidatedArtists: true }) as SongWithArtists[];
};

export const getPendingSongs = async (): Promise<SongWithArtists[]> => {
  const { data, error } = await supabase
    .from("songs")
    .select(
      `
        id, title, image_url, song_url, status, created_at,
        songs_artists (
          artist:artists (
            id, name, bio, image_url, status, created_at
          )
        )
      `
    )
    .eq("status", "pending");

  if (error || !data)
    throw new Error(`Lecture songs en attente échouée: ${error?.message}`);
  return mapSongRows(data) as SongWithArtists[];
};

export const validateSong = async (songId: string) => {
  const { data, error } = await supabase
    .from("songs")
    .update({ status: "validated" satisfies SongStatus })
    .eq("id", songId)
    .select("*")
    .single();
  if (error || !data)
    throw new Error(`Validation song échouée: ${error?.message}`);
  return data as Song;
};

export const refuseSong = async (songId: string) => {
  const { data, error } = await supabase
    .from("songs")
    .update({ status: "refused" satisfies SongStatus })
    .eq("id", songId)
    .select("*")
    .single();
  if (error || !data) throw new Error(`Refus song échoué: ${error?.message}`);
  return data as Song;
};
