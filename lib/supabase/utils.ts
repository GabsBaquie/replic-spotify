import type { Artist } from "./types";

export const toStoragePath = (prefix: string, filename: string) => {
  const safeName =
    filename || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}/${safeName}`;
};

export const mapSongRows = (
  rows: any[],
  options: { onlyValidatedArtists?: boolean } = {}
) =>
  rows.map((row) => {
    const artists =
      row.songs_artists
        ?.map((link: any) => {
          // Gérer le cas où artist est un tableau ou un objet unique
          const artist = Array.isArray(link?.artist)
            ? link.artist[0]
            : link?.artist;
          return artist;
        })
        .filter((artist: Artist | null | undefined): artist is Artist => {
          if (!artist) return false;
          return options.onlyValidatedArtists
            ? artist.status === "validated"
            : true;
        }) ?? [];
    return { ...row, artists };
  });
