import { supabase, supabaseUrl, supabaseAnonKey } from "./client";

export const uploadFile = async (
  bucket: string,
  filename: string,
  file: Blob | File | string,
  spotifyToken: string
) => {
  if (!supabaseUrl) {
    throw new Error("EXPO_PUBLIC_SUPABASE_URL n'est pas défini");
  }
  if (!supabaseAnonKey) {
    throw new Error("EXPO_PUBLIC_SUPABASE_KEY n'est pas défini");
  }
  if (!spotifyToken) {
    throw new Error("Token Spotify manquant");
  }

  const isLocalUri = typeof file === "string";
  const fileName = filename.split("/").pop() || "file.jpg";

  // Si c'est un File, utiliser son type MIME directement
  let mimeType: string | undefined;
  if (file instanceof File && file.type) {
    mimeType = file.type;
  } else if (file instanceof Blob && file.type) {
    mimeType = file.type;
  }

  // Sinon, détecter depuis l'extension
  if (!mimeType) {
    const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
    mimeType = "image/jpeg"; // Par défaut
    // Images
    if (extension === "png") mimeType = "image/png";
    else if (extension === "webp") mimeType = "image/webp";
    else if (extension === "gif") mimeType = "image/gif";
    // Audio
    else if (extension === "mp3") mimeType = "audio/mpeg";
    else if (extension === "m4a") mimeType = "audio/mp4";
    else if (extension === "wav") mimeType = "audio/wav";
    else if (extension === "aac") mimeType = "audio/aac";
    else if (extension === "ogg") mimeType = "audio/ogg";
    else if (extension === "flac") mimeType = "audio/flac";
  }

  const formData = new FormData();

  if (isLocalUri) {
    formData.append("file", {
      // @ts-ignore (type React Native)
      uri: file,
      name: fileName,
      type: mimeType,
    } as any);
  } else {
    if ((file as Blob).size === 0) {
      throw new Error(
        `Le fichier est vide (0 bytes). Vérifie que le fichier a été correctement lu.`
      );
    }
    // Si c'est un File, le passer directement (il contient déjà le type MIME)
    // Sinon, créer un nouveau File avec le type MIME détecté
    if (file instanceof File) {
      formData.append("file", file, fileName);
    } else {
      // Pour les Blob, créer un File avec le type MIME correct
      const fileWithMime = new File([file], fileName, { type: mimeType });
      formData.append("file", fileWithMime);
    }
  }

  formData.append("bucket", bucket);
  formData.append("filename", filename);

  const functionUrl = `${supabaseUrl}/functions/v1/upload-file`;

  try {
    if (!supabaseAnonKey || supabaseAnonKey.length < 100) {
      throw new Error(
        `Clé anonyme Supabase invalide (longueur: ${
          supabaseAnonKey?.length || 0
        }). Une clé valide fait généralement 200-300 caractères. Vérifie EXPO_PUBLIC_SUPABASE_KEY dans ton .env et redémarre Expo avec 'expo start -c'`
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 120000);

    let response;
    try {
      response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          apikey: supabaseAnonKey,
          "X-Spotify-Token": spotifyToken,
        },
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (networkError: any) {
      clearTimeout(timeoutId);

      if (networkError.name === "AbortError") {
        throw new Error(
          "Upload timeout: le fichier est trop volumineux ou la connexion est trop lente. Réessaye avec une image plus petite (< 3MB recommandé) ou vérifie ta connexion."
        );
      }

      throw new Error(
        `Erreur réseau lors de l'appel à l'Edge Function. Vérifie que l'Edge Function 'upload-file' est bien déployée sur Supabase. Erreur: ${
          networkError?.message || "Network request failed"
        }`
      );
    }

    let result;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      try {
        result = await response.json();
      } catch (parseError) {
        const text = await response.text().catch(() => "Erreur inconnue");
        console.error("[uploadFile] Erreur parsing JSON:", parseError, "Response text:", text);
        throw new Error(
          `Upload échoué (${response.status}): ${text || response.statusText}`
        );
      }
    } else {
      const text = await response.text();
      console.error("[uploadFile] Réponse non-JSON:", response.status, text);
      throw new Error(
        `Upload échoué (${response.status}): ${text || response.statusText}`
      );
    }

    if (!response.ok) {
      console.error("[uploadFile] Erreur Edge Function:", {
        status: response.status,
        result,
        contentType,
      });
      
      // Si erreur 500, essayer avec l'API Supabase Storage directe comme fallback
      if (response.status === 500 || response.status === 404) {
        console.warn(
          `[uploadFile] Edge Function 'upload-file' a échoué (${response.status}), tentative avec API Supabase Storage directe`
        );
        
        try {
          return await uploadFileDirect(bucket, filename, file, mimeType);
        } catch (directError: any) {
          // Si le fallback échoue aussi, afficher les deux erreurs
          const edgeErrorMsg =
            result?.error ||
            result?.message ||
            `Erreur Edge Function (${response.status})`;
          throw new Error(
            `Upload échoué:\n` +
            `- Edge Function: ${edgeErrorMsg}\n` +
            `- API directe: ${directError?.message || "Erreur inconnue"}\n\n` +
            `💡 Vérifie les logs de l'Edge Function 'upload-file' dans Supabase Dashboard pour plus de détails.`
          );
        }
      }
      
      const errorMsg =
        result?.error ||
        result?.message ||
        `Upload échoué (${response.status}): Erreur inconnue`;
      throw new Error(errorMsg);
    }

    if (!result.path || !result.url) {
      throw new Error(
        `Réponse invalide: path ou url manquant. Réponse reçue: ${JSON.stringify(
          result
        )}`
      );
    }

    if (
      !result.url.startsWith("http://") &&
      !result.url.startsWith("https://")
    ) {
      throw new Error(
        `URL invalide retournée par l'upload: ${result.url}. L'URL doit commencer par http:// ou https://`
      );
    }

    return result; // { path, url }
  } catch (error: any) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Upload échoué: ${error?.message || "Erreur réseau"}`);
  }
};

// Fallback: Upload direct via l'API Supabase Storage
const uploadFileDirect = async (
  bucket: string,
  filename: string,
  file: Blob | File | string,
  mimeType: string
): Promise<{ path: string; url: string }> => {
  console.log("[uploadFileDirect] Upload direct vers bucket:", bucket, "filename:", filename);
  
  const isLocalUri = typeof file === "string";
  
  let fileToUpload: Blob | File;
  if (isLocalUri) {
    // Pour React Native, on doit lire le fichier depuis l'URI
    const response = await fetch(file);
    fileToUpload = await response.blob();
  } else if (file instanceof File) {
    fileToUpload = file;
  } else {
    fileToUpload = file instanceof Blob ? file : new Blob([file], { type: mimeType });
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, fileToUpload, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    console.error("[uploadFileDirect] Erreur upload direct:", error);
    throw new Error(
      `Upload direct échoué: ${error.message}. ` +
      `Vérifie que le bucket '${bucket}' existe et que les policies RLS permettent l'upload.`
    );
  }

  if (!data?.path) {
    throw new Error("Upload direct réussi mais path manquant dans la réponse");
  }

  // Générer l'URL publique ou signée selon le bucket
  let url: string;
  if (bucket === "tracks") {
    // Bucket privé, générer une URL signée
    const { data: signedData, error: signedError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(data.path, 3600); // 1 heure
    
    if (signedError || !signedData?.signedUrl) {
      throw new Error(
        `Impossible de générer l'URL signée: ${signedError?.message || "Erreur inconnue"}`
      );
    }
    url = signedData.signedUrl;
  } else {
    // Bucket public, utiliser l'URL publique
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    url = publicData.publicUrl;
  }

  console.log("[uploadFileDirect] Upload direct réussi:", { path: data.path, url });
  return { path: data.path, url };
};

export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const getSignedUrl = async (
  bucket: string,
  path: string,
  expiresIn: number
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  if (error)
    throw new Error(`Impossible de générer l'URL signée: ${error.message}`);
  return data.signedUrl;
};
