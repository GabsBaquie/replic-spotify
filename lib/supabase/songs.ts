import { supabase, supabaseUrl, supabaseAnonKey } from "./client";
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
  console.log("[createSong] Début de la création:", {
    title,
    artistIds,
    imageFileType: imageFile instanceof File ? "File" : imageFile instanceof Blob ? "Blob" : typeof imageFile,
    audioFileType: audioFile instanceof File ? "File" : audioFile instanceof Blob ? "Blob" : typeof audioFile,
  });

  let coverResult: { url: string; path: string };
  let audioResult: { url: string; path: string };

  try {
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

    console.log("[createSong] Upload de la cover...");
    coverResult = await uploadFile(
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
    console.log("[createSong] Cover uploadée:", coverResult.url);

    console.log("[createSong] Upload de l'audio...");
    audioResult = await uploadFile(
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
