import AsyncStorage from "@react-native-async-storage/async-storage";
import { remote } from "react-native-spotify-remote";
import * as AuthSession from "expo-auth-session";
import { exchangeCodeAsync } from "expo-auth-session";

const CLIENT_ID =
  process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ??
  process.env.SPOTIFY_CLIENT_ID ??
  "";
const REDIRECT_URI =
  process.env.EXPO_PUBLIC_SPOTIFY_REDIRECT_URI ??
  process.env.SPOTIFY_REDIRECT_URI ??
  "replicspotify://callback";

const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

// Scopes nécessaires pour App Remote
const scopes = [
  "user-read-email",
  "playlist-read-private",
  "user-read-private",
  "user-read-recently-played",
  "user-top-read",
  "streaming",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-library-read",
  "user-follow-read",
].join(" ");

let connectionPromise: Promise<void> | null = null;

const authorizeWithSpotify = async (): Promise<string> => {
  console.log(
    "[remoteSession] Démarrage autorisation Spotify via expo-auth-session..."
  );
  console.log("[remoteSession] REDIRECT_URI:", REDIRECT_URI);
  console.log("[remoteSession] CLIENT_ID:", CLIENT_ID ? "présent" : "manquant");

  try {
    // Créer la requête d'autorisation
    const request = new AuthSession.AuthRequest({
      clientId: CLIENT_ID,
      scopes: scopes.split(" "),
      redirectUri: REDIRECT_URI,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    });

    // Lancer l'autorisation
    const result = await request.promptAsync(discovery);

    if (result.type !== "success" || !result.params.code) {
      throw new Error("Autorisation annulée ou échouée");
    }

    console.log(
      "[remoteSession] Code d'autorisation reçu, échange contre token..."
    );

    // Échanger le code contre un token
    const tokenResult = await exchangeCodeAsync(
      {
        code: result.params.code,
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        extraParams: {
          code_verifier: request.codeVerifier ?? "",
        },
      },
      discovery
    );

    if (!tokenResult.accessToken) {
      throw new Error("Token d'accès non reçu");
    }

    console.log("[remoteSession] Autorisation réussie, token reçu");
    await AsyncStorage.setItem("spotify_access_token", tokenResult.accessToken);

    // Stocker aussi le refresh token si disponible
    if (tokenResult.refreshToken) {
      await AsyncStorage.setItem(
        "spotify_refresh_token",
        tokenResult.refreshToken
      );
    }

    return tokenResult.accessToken;
  } catch (error: any) {
    console.error("[remoteSession] Erreur autorisation:", error);
    console.error("[remoteSession] Détails erreur:", {
      message: error?.message,
      code: error?.code,
      name: error?.name,
    });
    throw error;
  }
};

export const ensureSpotifyRemoteSession = async (): Promise<void> => {
  const isConnected = await remote.isConnectedAsync();
  if (isConnected) {
    console.log("[remoteSession] Déjà connecté");
    return;
  }

  if (connectionPromise) {
    console.log("[remoteSession] Connexion en cours, attente...");
    await connectionPromise;
    return;
  }

  connectionPromise = (async () => {
    let accessToken =
      (await AsyncStorage.getItem("spotify_access_token")) ?? undefined;

    try {
      if (!accessToken) {
        console.log("[remoteSession] Pas de token, autorisation nécessaire");
        accessToken = await authorizeWithSpotify();
      } else {
        console.log("[remoteSession] Token trouvé, tentative de connexion...");
      }

      await remote.connect(accessToken);
      console.log("[remoteSession] Connexion App Remote réussie");
    } catch (error: any) {
      console.error("[remoteSession] Erreur connexion:", error);
      const errorMessage = error?.message?.toLowerCase() || "";

      // Si Spotify n'est pas accessible ou si le token est invalide, on force une nouvelle autorisation
      if (
        errorMessage.includes("spotify does not appear to be installed") ||
        errorMessage.includes("whitelist") ||
        errorMessage.includes("token") ||
        errorMessage.includes("expired") ||
        errorMessage.includes("unauthorized")
      ) {
        console.log(
          "[remoteSession] Spotify inaccessible ou token invalide, nouvelle autorisation..."
        );
        // Supprime le token invalide
        await AsyncStorage.removeItem("spotify_access_token");
        // Force une nouvelle autorisation
        accessToken = await authorizeWithSpotify();
        await remote.connect(accessToken);
      } else {
        throw error;
      }
    }
  })();

  try {
    await connectionPromise;
  } finally {
    connectionPromise = null;
  }
};
