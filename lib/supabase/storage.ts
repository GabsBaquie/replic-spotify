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

  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  let mimeType = "image/jpeg";
  if (extension === "png") mimeType = "image/png";
  else if (extension === "webp") mimeType = "image/webp";
  else if (extension === "gif") mimeType = "image/gif";

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
    formData.append("file", file as any, fileName);
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
      result = await response.json();
    } else {
      const text = await response.text();
      throw new Error(
        `Upload échoué (${response.status}): ${text || response.statusText}`
      );
    }

    if (!response.ok) {
      const errorMsg =
        result.error ||
        result.message ||
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
