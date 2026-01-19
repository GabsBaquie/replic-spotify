import type { Artist } from "./types";

// Nettoie un titre pour en faire un nom de fichier valide
export const sanitizeFileName = (title: string, extension: string = "mp3"): string => {
  // Enlever les espaces en début/fin
  let sanitized = title.trim();
  
  // Remplacer les espaces par des underscores
  sanitized = sanitized.replace(/\s+/g, "_");
  
  // Enlever les caractères spéciaux (garder seulement lettres, chiffres, underscores, tirets)
  sanitized = sanitized.replace(/[^a-zA-Z0-9_-]/g, "");
  
  // Limiter la longueur (max 100 caractères)
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }
  
  // Si le nom est vide après nettoyage, utiliser un nom par défaut
  if (!sanitized) {
    sanitized = `song_${Date.now()}`;
  }
  
  // Ajouter un timestamp pour garantir l'unicité
  const timestamp = Date.now();
  sanitized = `${sanitized}_${timestamp}`;
  
  // Ajouter l'extension si elle n'est pas déjà présente
  if (!sanitized.toLowerCase().endsWith(`.${extension.toLowerCase()}`)) {
    sanitized = `${sanitized}.${extension}`;
  }
  
  return sanitized;
};

// Génère un nom de fichier unique pour une image
export const generateUniqueImageName = (
  prefix: string,
  originalName?: string,
  extension: string = "jpg"
): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  
  let baseName: string;
  if (originalName) {
    // Extraire le nom sans extension
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
    // Nettoyer le nom
    const cleaned = nameWithoutExt
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .substring(0, 50);
    baseName = cleaned || prefix;
  } else {
    baseName = prefix;
  }
  
  return `${baseName}_${timestamp}_${random}.${extension}`;
};

export const toStoragePath = (prefix: string, filename: string) => {
  const safeName =
    filename || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}/${safeName}`;
};

/**
 * Convertit le path stocké dans la DB en path réel dans Supabase Storage.
 * Gère la compatibilité avec les anciens paths qui nécessitent un double préfixe.
 */
export const getStoragePath = (dbPath: string | null): string | null => {
  if (!dbPath) return null;
  
  if (dbPath.startsWith("http://") || dbPath.startsWith("https://")) {
    return dbPath;
  }
  
  if (dbPath.startsWith("tracks/tracks/")) {
    return dbPath;
  }
  
  if (dbPath.startsWith("tracks/")) {
    return `tracks/${dbPath}`;
  }
  
  return `tracks/tracks/${dbPath}`;
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
