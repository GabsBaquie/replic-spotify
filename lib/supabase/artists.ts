import { supabase, supabaseUrl, supabaseAnonKey } from "./client";
import type { Artist, UploadableFile, ArtistStatus } from "./types";
import { uploadFile } from "./storage";
import { toStoragePath } from "./utils";

export const createArtist = async (
  name: string,
  bio: string,
  imageFile: UploadableFile,
  spotifyToken: string
) => {
  const isLocalUri = typeof imageFile === "string";

  let fileName: string;

  if (isLocalUri) {
    const uriParts = imageFile.split("/");
    const uriFileName = uriParts[uriParts.length - 1];
    fileName = uriFileName || `artist-${Date.now()}.jpg`;
  } else if (imageFile instanceof File) {
    fileName = imageFile.name;
  } else {
    fileName = `${Date.now()}.jpg`;
  }

  const fileForUpload: string | Blob | File = isLocalUri
    ? imageFile
    : imageFile instanceof ArrayBuffer
    ? new Blob([imageFile])
    : imageFile;

  const uploadResult = await uploadFile(
    "artists_images",
    toStoragePath("artists", fileName),
    fileForUpload,
    spotifyToken
  );

  if (!uploadResult.url || !uploadResult.path) {
    throw new Error(
      "L'upload de l'image a échoué : URL ou path manquant dans la réponse."
    );
  }

  if (!supabaseAnonKey) {
    throw new Error("EXPO_PUBLIC_SUPABASE_KEY n'est pas défini");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/create-artist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
      "X-Spotify-Token": spotifyToken,
    },
    body: JSON.stringify({
      name,
      bio,
      image_url: uploadResult.url,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    // Si l'erreur est due à une contrainte unique sur spotify_user_id
    if (
      result.error?.includes("duplicate key") ||
      result.error?.includes("spotify_user_id") ||
      result.error?.includes("unique constraint")
    ) {
      throw new Error(
        "Un profil artiste existe déjà pour ce compte Spotify. Si tu veux modifier ton profil, contacte le support."
      );
    }
    throw new Error(result.error || "Création artiste échouée");
  }

  return result.data as Artist;
};

export const getArtistById = async (
  artistId: string,
  spotifyToken?: string
): Promise<Artist | null> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Configuration Supabase manquante. Vérifie les variables d'environnement."
    );
  }

  if (spotifyToken) {
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/get-artist-by-id`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
            "X-Spotify-Token": spotifyToken,
          },
          body: JSON.stringify({ artistId }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        return result.artist as Artist;
      } else {
        let errorText: string;
        let errorJson: any = null;
        try {
          errorJson = await response.json();
          errorText = JSON.stringify(errorJson);
        } catch {
          errorText = await response.text();
        }

        console.error(
          `[getArtistById] Edge Function échouée (${response.status}):`,
          errorJson || errorText
        );

        if (response.status === 404) {
          throw new Error(
            `Edge Function 'get-artist-by-id' non déployée. ` +
              `Déploie-la dans Supabase Dashboard > Edge Functions\n` +
              `OU crée une policy RLS: CREATE POLICY "Allow public read on artists" ON artists FOR SELECT USING (true);`
          );
        }

        if (response.status === 401) {
          const errorMessage = errorJson?.error || errorText;
          throw new Error(
            `Authentification échouée (401). ` +
              `Vérifie que:\n` +
              `1. "Verify JWT" est DÉSACTIVÉ dans Supabase Dashboard > Edge Functions > get-artist-by-id > Settings\n` +
              `2. Le token Spotify est valide et non expiré\n` +
              `3. Le header 'X-Spotify-Token' est bien envoyé\n` +
              `Erreur détaillée: ${errorMessage}`
          );
        }

        if (response.status === 403 && spotifyToken) {
          const errorMessage = errorJson?.error || errorText;

          try {
            await updateArtistSpotifyUserId(artistId, spotifyToken);
            const retryResponse = await fetch(
              `${supabaseUrl}/functions/v1/get-artist-by-id`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  apikey: supabaseAnonKey,
                  "X-Spotify-Token": spotifyToken,
                },
                body: JSON.stringify({ artistId }),
              }
            );

            if (retryResponse.ok) {
              const retryResult = await retryResponse.json();
              return retryResult.artist as Artist;
            }
          } catch (updateError: any) {
            console.error(
              "[getArtistById] Échec de la mise à jour du spotify_user_id:",
              updateError.message
            );
          }

          throw new Error(
            `Accès refusé (403). ` +
              `L'artist a un status "pending" mais le spotify_user_id ne correspond pas.\n` +
              `Tentative de mise à jour automatique échouée.\n` +
              `Solution: Vérifie que l'Edge Function "create-artist" stocke bien le spotify_user_id (me.id) lors de l'insertion.\n` +
              `Erreur détaillée: ${errorMessage}`
          );
        }

        if (response.status === 500) {
          const errorMsg = errorJson?.error || errorText || "";
          if (
            errorMsg.includes(
              "Cannot coerce the result to a single JSON object"
            ) ||
            errorMsg.includes("PGRST116")
          ) {
            return null;
          }
          throw new Error(`Edge Function erreur (500): ${errorMsg}`);
        } else {
          throw new Error(
            `Edge Function erreur (${response.status}): ${
              errorJson?.error || errorText
            }`
          );
        }
      }
    } catch (err: any) {
      if (
        err.message?.includes("Edge Function") ||
        err.message?.includes("404")
      ) {
        throw err;
      }
      if (
        err.message?.includes(
          "Cannot coerce the result to a single JSON object"
        ) ||
        err.message?.includes("PGRST116")
      ) {
        return null;
      }
      throw err;
    }
  }

  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("id", artistId)
    .single();

  if (error) {
    console.error("[getArtistById] Erreur Supabase:", error);
    if (error.code === "PGRST116") {
      return null;
    }
    if (
      error.message?.includes("Invalid API key") ||
      error.message?.includes("row-level security") ||
      error.code === "42501"
    ) {
      throw new Error(
        `Accès refusé: Les policies RLS bloquent la lecture de la table 'artists'. ` +
          `Solution: Dans Supabase Dashboard > Table Editor > artists > RLS Policies, ` +
          `crée une policy "Allow public read on artists" avec: ` +
          `CREATE POLICY "Allow public read on artists" ON artists FOR SELECT USING (true);`
      );
    }
    throw new Error(`Lecture artist échouée: ${error.message}`);
  }
  return data as Artist;
};

/**
 * Récupère l'artiste par son spotify_user_id
 * Utilise l'Edge Function get-artist-by-id avec spotifyUserId
 */
export const getArtistBySpotifyUserId = async (
  spotifyToken: string
): Promise<Artist | null> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[getArtistBySpotifyUserId] Configuration Supabase manquante"
    );
    return null;
  }

  if (!spotifyToken) {
    console.warn("[getArtistBySpotifyUserId] Token Spotify manquant");
    return null;
  }

  try {
    // Récupérer le spotify_user_id depuis l'API Spotify
    let spotifyResponse: Response;
    try {
      spotifyResponse = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${spotifyToken}` },
      });
    } catch (networkError: any) {
      console.error(
        "[getArtistBySpotifyUserId] Erreur réseau lors de l'appel à l'API Spotify:",
        networkError.message || networkError
      );
      // Vérifier si c'est une erreur de connexion
      if (
        networkError.message?.includes("Network request failed") ||
        networkError.message?.includes("Failed to fetch") ||
        networkError.message?.includes("network")
      ) {
        throw new Error(
          "Impossible de se connecter à l'API Spotify. Vérifie ta connexion internet."
        );
      }
      throw networkError;
    }

    if (!spotifyResponse.ok) {
      const errorText = await spotifyResponse.text().catch(() => "");
      let errorJson: any = null;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        // Ignore JSON parse errors
      }

      if (spotifyResponse.status === 401) {
        console.warn(
          "[getArtistBySpotifyUserId] Token Spotify invalide ou expiré (401)"
        );
        return null;
      }

      console.warn(
        `[getArtistBySpotifyUserId] API Spotify erreur (${spotifyResponse.status}):`,
        errorJson?.error?.message || errorText || "Erreur inconnue"
      );
      return null;
    }

    const spotifyUser = await spotifyResponse.json();
    const spotifyUserId = spotifyUser.id;

    if (!spotifyUserId) {
      console.warn(
        "[getArtistBySpotifyUserId] spotify_user_id non trouvé dans la réponse Spotify"
      );
      return null;
    }

    // Essayer d'abord l'Edge Function get-artist-by-id avec spotifyUserId
    let edgeFunctionFailed = false;
    let edgeFunctionError: any = null;

    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/get-artist-by-id`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
            "X-Spotify-Token": spotifyToken,
          },
          body: JSON.stringify({ spotifyUserId }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        return result.artist as Artist | null;
      }

      // Si 404, l'artiste n'existe peut-être pas, ou l'Edge Function n'est pas déployée
      if (response.status === 404) {
        edgeFunctionFailed = true;
        console.warn(
          "[getArtistBySpotifyUserId] Edge Function retourne 404, tentative avec requête directe Supabase"
        );
      } else {
        // Pour les autres erreurs HTTP, logger mais continuer avec le fallback
        const errorText = await response.text().catch(() => "Erreur inconnue");
        let errorJson: any = null;
        try {
          errorJson = JSON.parse(errorText);
        } catch {
          // Ignore JSON parse errors
        }
        console.warn(
          `[getArtistBySpotifyUserId] Edge Function erreur (${response.status}):`,
          errorJson?.error || errorText
        );
        edgeFunctionFailed = true;
      }
    } catch (networkError: any) {
      // Erreur réseau lors de l'appel à l'Edge Function
      console.warn(
        "[getArtistBySpotifyUserId] Erreur réseau lors de l'appel à l'Edge Function, tentative avec requête directe Supabase:",
        networkError.message || networkError
      );
      edgeFunctionFailed = true;
      edgeFunctionError = networkError;
    }

    // Fallback: interroger directement la table Supabase si l'Edge Function a échoué
    if (edgeFunctionFailed) {
      try {
        const { data, error } = await supabase
          .from("artists")
          .select("*")
          .eq("spotify_user_id", spotifyUserId)
          .maybeSingle();

        if (error) {
          console.error(
            "[getArtistBySpotifyUserId] Erreur requête directe Supabase:",
            error
          );
          // Si c'est une erreur RLS, on peut quand même retourner null silencieusement
          if (
            error.message?.includes("row-level security") ||
            error.code === "42501"
          ) {
            console.warn(
              "[getArtistBySpotifyUserId] RLS bloque l'accès. Assure-toi que les policies RLS permettent la lecture."
            );
            return null;
          }
          return null;
        }

        return data as Artist | null;
      } catch (fallbackError: any) {
        console.error(
          "[getArtistBySpotifyUserId] Erreur lors du fallback Supabase:",
          fallbackError
        );
        // Si le fallback échoue aussi, retourner null
        return null;
      }
    }

    return null;
  } catch (error: any) {
    // Erreur lors de l'appel à l'API Spotify (pas de fallback possible)
    if (
      error.message?.includes("Impossible de se connecter à l'API Spotify")
    ) {
      console.error("[getArtistBySpotifyUserId] Erreur:", error.message);
      // Ne pas lancer l'erreur, retourner null pour éviter de casser l'UI
      return null;
    }
    console.error("[getArtistBySpotifyUserId] Erreur inattendue:", error);
    return null;
  }
};

export const updateArtistSpotifyUserId = async (
  artistId: string,
  spotifyToken: string
): Promise<void> => {
  if (!supabaseAnonKey) {
    throw new Error("EXPO_PUBLIC_SUPABASE_KEY n'est pas défini");
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/update-artist-spotify-user-id`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        "X-Spotify-Token": spotifyToken,
      },
      body: JSON.stringify({ artistId }),
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Erreur inconnue" }));
    throw new Error(
      `Échec de la mise à jour du spotify_user_id: ${
        error.error || response.statusText
      }`
    );
  }
};

export const getValidatedArtists = async (): Promise<Artist[]> => {
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("status", "validated");
  if (error || !data)
    throw new Error(`Lecture artists validés échouée: ${error?.message}`);
  return data as Artist[];
};

export const getPendingArtists = async (): Promise<Artist[]> => {
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("status", "pending");
  if (error || !data)
    throw new Error(`Lecture artists en attente échouée: ${error?.message}`);
  return data as Artist[];
};

export const validateArtist = async (artistId: string) => {
  const { data, error } = await supabase
    .from("artists")
    .update({ status: "validated" satisfies ArtistStatus })
    .eq("id", artistId)
    .select("*")
    .single();
  if (error || !data)
    throw new Error(`Validation artist échouée: ${error?.message}`);
  return data as Artist;
};

export const refuseArtist = async (artistId: string) => {
  const { data, error } = await supabase
    .from("artists")
    .update({ status: "refused" satisfies ArtistStatus })
    .eq("id", artistId)
    .select("*")
    .single();
  if (error || !data) throw new Error(`Refus artist échoué: ${error?.message}`);
  return data as Artist;
};
