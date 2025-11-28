export type ArtistStatus = "pending" | "validated" | "refused";
export type SongStatus = "pending" | "validated" | "refused";

export type Artist = {
  id: string;
  name: string;
  bio: string | null;
  image_url: string | null;
  status: ArtistStatus;
  spotify_user_id?: string | null;
  created_at: string;
};

export type Song = {
  id: string;
  title: string;
  image_url: string | null;
  song_url: string | null;
  status: SongStatus;
  created_at: string;
};

export type SongArtist = {
  song_id: string;
  artist_id: string;
  created_at: string;
};

export type SongWithArtists = Song & { artists: Artist[] };

export type UploadableFile = File | Blob | ArrayBuffer | string;
