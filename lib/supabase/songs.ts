import { supabase, supabaseUrl, supabaseAnonKey } from "./client";
import type {
  Song,
  SongWithArtists,
  UploadableFile,
  SongStatus,
} from "./types";
import { uploadFile, getSignedUrl } from "./storage";
import { toStoragePath, mapSongRows, sanitizeFileName, generateUniqueImageName, getStoragePath } from "./utils";
import { searchArtistsByName } from "./artists";

export const createSong = async (
  title: string,
  imageFile: UploadableFile,
  audioFile: UploadableFile,
  artistIds: string[],
  spotifyToken: string
) => {
  let coverResult: { url: string; path: string };
  let audioResult: { url: string; path: string };

  try {
    const coverForUpload: string | Blob | File =
      imageFile instanceof ArrayBuffer ? new Blob([imageFile]) : imageFile;
    
    const audioForUpload: string | Blob | File =
      audioFile instanceof ArrayBuffer ? new Blob([audioFile]) : audioFile;
    
    const cleanedTitle = title.trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .substring(0, 50) || "cover";
    
    const coverFileName = generateUniqueImageName(
      cleanedTitle,
      typeof File !== "undefined" && imageFile instanceof File
        ? imageFile.name
        : undefined,
      "jpg"
    );
    
    coverResult = await uploadFile(
      "albums_images",
      toStoragePath("songs", coverFileName),
      coverForUpload,
    spotifyToken
  );

    const audioFileName = sanitizeFileName(title.trim(), "mp3");
    audioResult = await uploadFile(
      "tracks",
      toStoragePath("tracks", audioFileName),
      audioForUpload,
    spotifyToken
  );
  } catch (uploadError: any) {
    throw new Error(
      `Erreur lors de l'upload des fichiers: ${uploadError?.message || "Erreur inconnue"}`
    );
  }

  // Utiliser une Edge Function comme pour createArtist pour contourner les policies RLS
  if (!supabaseAnonKey) {
    throw new Error("EXPO_PUBLIC_SUPABASE_KEY n'est pas défini");
  }

  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/functions/v1/create-song`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
        "X-Spotify-Token": spotifyToken,
      },
      body: JSON.stringify({
        title,
        image_url: coverResult.url, // URL publique complète
        song_url: audioResult.url, // URL signée complète (comme image_url)
        artist_ids: artistIds,
      }),
    });
  } catch (networkError: any) {
    throw new Error(
      `Erreur réseau lors de l'appel à l'Edge Function 'create-song': ${networkError?.message || "Network request failed"}. Vérifie ta connexion internet.`
    );
  }

  let result: any;
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    try {
      result = await response.json();
    } catch (parseError) {
      const text = await response.text().catch(() => "Erreur inconnue");
      throw new Error(`Création song échouée (${response.status}): ${text}`);
    }
  } else {
    const text = await response.text().catch(() => "Erreur inconnue");
    if (response.status === 404 || response.status === 401) {
      result = { 
        error: response.status === 404 
          ? "Edge Function 'create-song' non déployée" 
          : "JWT invalide - 'Verify JWT' est probablement activé"
      };
    } else {
      throw new Error(`Création song échouée (${response.status}): ${text}`);
    }
  }

  if (!response.ok) {
    if (response.status === 404 || response.status === 401) {

  const { data: song, error: songError } = await supabase
    .from("songs")
    .insert({
      title,
              image_url: coverResult.url, // URL publique complète
              song_url: audioResult.url, // URL signée complète (comme image_url)
      status: "pending" satisfies SongStatus,
    })
    .select("*")
    .single();

      if (songError || !song) {
        // Vérifier si c'est une erreur de clé API invalide
        if (
          songError?.message?.includes("Invalid API key") ||
          songError?.code === "PGRST301" ||
          songError?.hint?.includes("Double check your Supabase")
        ) {
          throw new Error(
            `❌ Clé API Supabase invalide.\n\n` +
            `🔧 Solutions:\n\n` +
            `1️⃣ Vérifie ta variable d'environnement EXPO_PUBLIC_SUPABASE_KEY:\n` +
            `   - Ouvre ton fichier .env\n` +
            `   - Vérifie que EXPO_PUBLIC_SUPABASE_KEY contient la clé "anon" (pas la "service_role")\n` +
            `   - Tu peux la trouver dans Supabase Dashboard > Settings > API\n` +
            `   - Redémarre Expo avec 'npx expo start -c' après modification\n\n` +
            `2️⃣ Si tu utilises l'Edge Function, désactive "Verify JWT" dans:\n` +
            `   - Supabase Dashboard > Edge Functions > create-song > Settings\n\n` +
            `Erreur détaillée: ${songError.message || JSON.stringify(songError)}`
          );
        }
        
        // Vérifier si c'est une erreur de RLS
        if (
          songError?.message?.includes("row-level security") ||
          songError?.message?.includes("RLS") ||
          songError?.code === "42501"
        ) {
          throw new Error(
            `❌ Accès refusé: Les policies RLS bloquent l'insertion dans la table 'songs'.\n\n` +
            `🔧 Solutions possibles:\n\n` +
            `1️⃣ Déploie l'Edge Function 'create-song' (recommandé):\n` +
            `   - Va dans Supabase Dashboard > Edge Functions\n` +
            `   - Crée une fonction 'create-song' similaire à 'create-artist'\n` +
            `   - Désactive "Verify JWT" dans les Settings\n\n` +
            `2️⃣ Crée une policy RLS (solution rapide):\n` +
            `   - Va dans Supabase Dashboard > Table Editor > songs > RLS Policies\n` +
            `   - Clique sur "New Policy"\n` +
            `   - Nom: "Allow insert on songs"\n` +
            `   - Opération: INSERT\n` +
            `   - Policy definition: WITH CHECK (true)\n` +
            `   - OU exécute ce SQL dans l'éditeur SQL:\n` +
            `     CREATE POLICY "Allow insert on songs" ON songs FOR INSERT WITH CHECK (true);\n\n` +
            `Erreur détaillée: ${songError.message || JSON.stringify(songError)}`
          );
        }
        
        throw new Error(
          `Création song échouée: ${songError?.message || JSON.stringify(songError)}`
        );
      }

      // Insérer les associations songs_artists
  if (artistIds.length) {
    const { error: junctionError } = await supabase
      .from("songs_artists")
      .insert(
        artistIds.map((artist_id) => ({
          song_id: song.id,
          artist_id,
        }))
      );
        if (junctionError) {
          throw new Error(
            `Association song/artists échouée: ${junctionError.message || JSON.stringify(junctionError)}`
          );
        }
      }

      return song as Song;
    }
    
    const errorMessage = result?.error || result?.message || `Erreur ${response.status}`;
    
    if (response.status === 401) {
      throw new Error(
        `❌ Erreur d'authentification JWT (401): L'Edge Function 'create-song' rejette la requête.\n\n` +
        `🔧 Solution:\n` +
        `1. Va dans Supabase Dashboard > Edge Functions > create-song\n` +
        `2. Clique sur "Settings"\n` +
        `3. Désactive "Verify JWT"\n` +
        `4. Sauvegarde les changements\n\n` +
        `OU utilise l'API directe en créant une policy RLS (voir instructions ci-dessous).\n\n` +
        `Erreur: ${errorMessage}`
      );
    }
    
    throw new Error(`Création song échouée: ${errorMessage}`);
  }

  if (!result.data) {
    throw new Error(`Création song échouée: Réponse invalide de l'Edge Function`);
  }

  return result.data as Song;
};

const getSongUrl = async (songUrl: string | null): Promise<string | null> => {
  if (!songUrl) return null;
  
  if (songUrl.startsWith("http://") || songUrl.startsWith("https://")) {
    return songUrl;
  }
  
  try {
    const storagePath = getStoragePath(songUrl);
    if (!storagePath) return null;
    
    const signedUrl = await getSignedUrl("tracks", storagePath, 3600);
    return signedUrl;
  } catch (error) {
    return null;
  }
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
  
  const mappedSongs = mapSongRows(data, { onlyValidatedArtists: true }) as SongWithArtists[];
  
  // Convertir les song_url en URLs signées
  const songsWithSignedUrls = await Promise.all(
    mappedSongs.map(async (song) => ({
      ...song,
      song_url: await getSongUrl(song.song_url),
    }))
  );
  
  return songsWithSignedUrls;
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
  
  const mappedSongs = mapSongRows(data) as SongWithArtists[];
  
  // Convertir les song_url en URLs signées
  const songsWithSignedUrls = await Promise.all(
    mappedSongs.map(async (song) => ({
      ...song,
      song_url: await getSongUrl(song.song_url),
    }))
  );
  
  return songsWithSignedUrls;
};

export const getRefusedSongs = async (): Promise<SongWithArtists[]> => {
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
    .eq("status", "refused");

  if (error || !data)
    throw new Error(`Lecture songs refusés échouée: ${error?.message}`);
  
  const mappedSongs = mapSongRows(data) as SongWithArtists[];
  
  // Convertir les song_url en URLs signées
  const songsWithSignedUrls = await Promise.all(
    mappedSongs.map(async (song) => ({
      ...song,
      song_url: await getSongUrl(song.song_url),
    }))
  );
  
  return songsWithSignedUrls;
};

/**
 * Recherche les chansons validées dont au moins un artiste a un nom qui contient la requête.
 * Retourne uniquement les chansons avec status = 'validated', dédupliquées par id.
 */
export const searchValidatedSongsByArtistName = async (
  query: string
): Promise<SongWithArtists[]> => {
  const artists = await searchArtistsByName(query);
  if (artists.length === 0) return [];
  const songsArrays = await Promise.all(
    artists.map((a) => getSongsByArtistId(a.id))
  );
  const byId = new Map<string, SongWithArtists>();
  for (const arr of songsArrays) {
    for (const song of arr) {
      if (song.status === "validated" && !byId.has(song.id)) {
        byId.set(song.id, song);
      }
    }
  }
  return Array.from(byId.values());
};

// Récupère les chansons d'un artiste spécifique
export const getSongsByArtistId = async (artistId: string): Promise<SongWithArtists[]> => {
  try {
    // Approche en deux étapes pour éviter les problèmes de jointure complexe
    // 1. Récupérer les song_ids associés à l'artiste
    const { data: songArtists, error: songArtistsError } = await supabase
      .from("songs_artists")
      .select("song_id")
      .eq("artist_id", artistId);

    if (songArtistsError) {
      // Si c'est une erreur "Invalid API key", c'est probablement un problème de RLS
      if (
        songArtistsError.message?.includes("Invalid API key") ||
        songArtistsError.code === "PGRST301"
      ) {
        throw new Error(
          `❌ Erreur d'accès à la table 'songs_artists': ${songArtistsError.message}\n\n` +
          `🔧 Solution: Vérifie que la policy RLS "Allow read on songs_artists" existe bien.\n` +
          `   Exécute ce SQL dans Supabase Dashboard > SQL Editor:\n` +
          `   CREATE POLICY "Allow read on songs_artists" ON songs_artists FOR SELECT USING (true);`
        );
      }
      
      throw songArtistsError;
    }

    if (!songArtists || songArtists.length === 0) {
      return [];
    }

    const songIds = songArtists.map((sa) => sa.song_id);

    // 2. Récupérer les songs avec leurs artists
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
      .in("id", songIds);

    if (error) {
      // Vérifier si c'est une erreur de clé API invalide
      if (
        error.message?.includes("Invalid API key") ||
        error.code === "PGRST301" ||
        error.hint?.includes("Double check your Supabase")
      ) {
        throw new Error(
          `❌ Clé API Supabase invalide.\n\n` +
          `🔧 Solutions:\n\n` +
          `1️⃣ Vérifie ta variable d'environnement EXPO_PUBLIC_SUPABASE_KEY:\n` +
          `   - Ouvre ton fichier .env\n` +
          `   - Vérifie que EXPO_PUBLIC_SUPABASE_KEY contient la clé "anon" (pas la "service_role")\n` +
          `   - Tu peux la trouver dans Supabase Dashboard > Settings > API\n` +
          `   - Redémarre Expo avec 'npx expo start -c' après modification\n\n` +
          `Erreur détaillée: ${error.message || JSON.stringify(error)}`
        );
      }
      
      // Vérifier si c'est une erreur de RLS
      if (
        error.message?.includes("row-level security") ||
        error.message?.includes("RLS") ||
        error.code === "42501"
      ) {
        throw new Error(
          `❌ Accès refusé: Les policies RLS bloquent la lecture des chansons.\n\n` +
          `🔧 Solutions possibles:\n\n` +
          `1️⃣ Crée des policies RLS pour permettre la lecture:\n` +
          `   - Va dans Supabase Dashboard > Table Editor > songs > RLS Policies\n` +
          `   - Clique sur "New Policy"\n` +
          `   - Nom: "Allow read on songs"\n` +
          `   - Opération: SELECT\n` +
          `   - Policy definition: USING (true)\n` +
          `   - Répète pour songs_artists et artists\n\n` +
          `   OU exécute ce SQL dans l'éditeur SQL:\n` +
          `   CREATE POLICY "Allow read on songs" ON songs FOR SELECT USING (true);\n` +
          `   CREATE POLICY "Allow read on songs_artists" ON songs_artists FOR SELECT USING (true);\n` +
          `   CREATE POLICY "Allow read on artists" ON artists FOR SELECT USING (true);\n\n` +
          `Erreur détaillée: ${error.message || JSON.stringify(error)}`
        );
      }
      
      throw new Error(`Lecture songs de l'artiste échouée: ${error.message || JSON.stringify(error)}`);
    }

    if (error) {
      console.error("[getSongsByArtistId] Erreur Supabase (étape 2):", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }
    
    const mappedSongs = mapSongRows(data) as SongWithArtists[];
    
    const songsWithSignedUrls = await Promise.all(
      mappedSongs.map(async (song) => {
        const originalPath = song.song_url;
        const signedUrl = await getSongUrl(originalPath);
        const finalUrl = signedUrl || originalPath || null;
        
        return {
          ...song,
          song_url: finalUrl,
        };
      })
    );
    
    return songsWithSignedUrls;
  } catch (err: any) {
    // Si l'erreur a déjà un message détaillé, la relancer
    if (err.message?.includes("❌") || err.message?.includes("🔧")) {
      throw err;
    }
    // Sinon, wrapper dans une erreur générique
    throw new Error(`Lecture songs de l'artiste échouée: ${err?.message || "Erreur inconnue"}`);
  }
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
