import { supabase, supabaseUrl, supabaseAnonKey } from "./client";
import type {
  Song,
  SongWithArtists,
  UploadableFile,
  SongStatus,
} from "./types";
import { uploadFile, getSignedUrl } from "./storage";
import { toStoragePath, mapSongRows, sanitizeFileName, generateUniqueImageName } from "./utils";

export const createSong = async (
  title: string,
  imageFile: UploadableFile,
  audioFile: UploadableFile,
  artistIds: string[],
  spotifyToken: string
) => {
  console.log("[createSong] Début de la création:", {
    title,
    artistIds,
    imageFileType: imageFile instanceof File ? "File" : imageFile instanceof Blob ? "Blob" : typeof imageFile,
    audioFileType: audioFile instanceof File ? "File" : audioFile instanceof Blob ? "Blob" : typeof audioFile,
  });

  let coverResult: { url: string; path: string };
  let audioResult: { url: string; path: string };

  try {
    // Préparer les fichiers pour l'upload
    // uploadFile gère déjà les URIs locales (string), Blob, File
    // On doit juste convertir ArrayBuffer en Blob si nécessaire
    
    const coverForUpload: string | Blob | File =
      imageFile instanceof ArrayBuffer
        ? new Blob([imageFile])
        : imageFile;
    
    const audioForUpload: string | Blob | File =
      audioFile instanceof ArrayBuffer
        ? new Blob([audioFile])
        : audioFile;
    
    console.log("[createSong] Upload de la cover...");
    // Nettoyer le titre pour la cover (sans timestamp, generateUniqueImageName l'ajoutera)
    const cleanedTitle = title.trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .substring(0, 50) || "cover";
    
    // Générer un nom unique pour la cover basé sur le titre
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
    console.log("[createSong] Cover uploadée:", coverResult.url);

    console.log("[createSong] Upload de l'audio...");
    // Utiliser le titre de la chanson comme nom de fichier
    const audioFileName = sanitizeFileName(title.trim(), "mp3");
    audioResult = await uploadFile(
      "tracks",
      toStoragePath("tracks", audioFileName),
      audioForUpload,
      spotifyToken
    );
    console.log("[createSong] Audio uploadé:", audioResult.path);
  } catch (uploadError: any) {
    console.error("[createSong] Erreur lors de l'upload:", uploadError);
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
        image_url: coverResult.url,
        song_url: audioResult.path,
        artist_ids: artistIds,
      }),
    });
  } catch (networkError: any) {
    console.error("[createSong] Erreur réseau lors de l'appel Edge Function:", networkError);
    throw new Error(
      `Erreur réseau lors de l'appel à l'Edge Function 'create-song': ${networkError?.message || "Network request failed"}. Vérifie ta connexion internet.`
    );
  }

  console.log("[createSong] Réponse Edge Function:", {
    status: response.status,
    ok: response.ok,
    contentType: response.headers.get("content-type"),
  });

  let result: any;
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    try {
      result = await response.json();
      console.log("[createSong] Réponse JSON parsée:", result);
    } catch (parseError) {
      // Si le JSON est invalide
      const text = await response.text().catch(() => "Erreur inconnue");
      console.error("[createSong] Erreur parsing JSON:", parseError, "Response text:", text);
      throw new Error(`Création song échouée (${response.status}): ${text}`);
    }
  } else {
    // Si la réponse n'est pas du JSON
    const text = await response.text().catch(() => "Erreur inconnue");
    console.warn("[createSong] Réponse non-JSON:", response.status, text);
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
    console.log("[createSong] Réponse non-OK, status:", response.status, "result:", result);
    
    // Si l'Edge Function n'est pas déployée (404) ou si JWT invalide (401), essayer avec l'API directe
    if (response.status === 404 || response.status === 401) {
      const reason = response.status === 404 
        ? "non déployée (404)" 
        : "JWT invalide - 'Verify JWT' est probablement activé (401)";
      console.warn(
        `[createSong] Edge Function 'create-song' ${reason}, tentative avec API directe`
      );
      
      if (response.status === 401) {
        console.warn(
          "[createSong] Pour utiliser l'Edge Function, désactive 'Verify JWT' dans Supabase Dashboard > Edge Functions > create-song > Settings"
        );
      }
      
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

      if (songError || !song) {
        console.error("[createSong] Erreur Supabase directe:", {
          error: songError,
          message: songError?.message,
          code: songError?.code,
          details: songError?.details,
          hint: songError?.hint,
        });
        
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
          console.error("[createSong] Erreur insertion songs_artists:", junctionError);
          throw new Error(
            `Association song/artists échouée: ${junctionError.message || JSON.stringify(junctionError)}`
          );
        }
      }

      console.log("[createSong] Song créé avec succès via API directe:", song.id);
      return song as Song;
    }
    
    // Autre erreur de l'Edge Function
    const errorMessage = result?.error || result?.message || `Erreur ${response.status}`;
    console.error("[createSong] Erreur Edge Function:", {
      status: response.status,
      result,
      errorMessage,
    });
    
    // Message d'erreur amélioré pour les erreurs 401 (Invalid JWT)
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
    console.error("[createSong] Réponse Edge Function sans data:", result);
    throw new Error(`Création song échouée: Réponse invalide de l'Edge Function`);
  }

  console.log("[createSong] Song créé avec succès via Edge Function:", result.data.id);
  return result.data as Song;
};

// Convertit le song_url (path) en URL signée pour le bucket privé tracks
const getSongUrl = async (songUrl: string | null): Promise<string | null> => {
  if (!songUrl) return null;
  
  // Si c'est déjà une URL complète (http/https), on la retourne telle quelle
  if (songUrl.startsWith("http://") || songUrl.startsWith("https://")) {
    return songUrl;
  }
  
  // Sinon, c'est un path dans le bucket tracks (privé), on génère une URL signée
  try {
    const signedUrl = await getSignedUrl("tracks", songUrl, 3600); // 1 heure
    return signedUrl;
  } catch (error: any) {
    console.error("[getSongUrl] Erreur génération URL signée:", error);
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
      console.error("[getSongsByArtistId] Erreur songs_artists:", songArtistsError);
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
      console.error("[getSongsByArtistId] Erreur Supabase:", error);
      
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
    
    // Convertir les song_url en URLs signées
    const songsWithSignedUrls = await Promise.all(
      mappedSongs.map(async (song) => ({
        ...song,
        song_url: await getSongUrl(song.song_url),
      }))
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
