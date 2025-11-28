import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Box, Text } from "@/components/restyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ensureSpotifyRemoteSession } from "@/lib/spotify/remoteSession";
import { auth } from "react-native-spotify-remote";
import * as AuthSession from "expo-auth-session";

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

/**
 * Route de callback pour gérer les redirections après autorisation Spotify.
 * Cette route est appelée lorsque Spotify redirige vers replicspotify://callback
 * après l'autorisation.
 */
export default function CallbackScreen() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("[callback] Reçu callback Spotify, params:", params);

        // Si on a un code, le SDK devrait le gérer automatiquement
        // Mais si l'app a redémarré, il faut peut-être réinitialiser l'autorisation
        if (params.code) {
          console.log("[callback] Code d'autorisation reçu, attente du SDK...");

          // Attendre un peu pour que le SDK récupère la session
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Vérifier si le token est maintenant disponible
          let token = await AsyncStorage.getItem("spotify_access_token");

          if (!token) {
            // Si le token n'est toujours pas là, attendre plus longtemps
            // Le SDK natif peut prendre du temps pour finaliser l'autorisation
            console.log(
              "[callback] Token non trouvé, attente supplémentaire pour le SDK..."
            );

            // Attendre plusieurs secondes pour que le SDK finalise l'autorisation
            for (let i = 0; i < 5; i++) {
              await new Promise((resolve) => setTimeout(resolve, 500));
              token = await AsyncStorage.getItem("spotify_access_token");
              if (token) {
                console.log(`[callback] Token trouvé après ${(i + 1) * 500}ms`);
                break;
              }
            }

            // Si toujours pas de token, le SDK ne l'a pas géré automatiquement
            // Dans ce cas, on essaie d'échanger le code contre un token directement
            // Note: Cela nécessite le code_verifier qui n'est pas disponible si l'app redémarre
            // Mais on peut essayer sans PKCE en utilisant l'API Spotify directement
            if (!token) {
              console.warn(
                "[callback] Le SDK n'a pas finalisé l'autorisation automatiquement, tentative d'échange direct..."
              );

              try {
                // Essayer d'échanger le code contre un token via l'API Spotify
                // Note: Cela ne fonctionnera pas avec PKCE, mais on peut essayer
                const code = params.code as string;
                if (code) {
                  console.log(
                    "[callback] Tentative d'échange du code contre un token..."
                  );

                  // Essayer avec expo-auth-session (sans PKCE pour ce cas)
                  // Mais cela nécessite le code_verifier qui n'est pas disponible
                  // Donc on ne peut pas vraiment échanger le code sans le code_verifier

                  // Réessayer l'autorisation - le SDK devrait détecter le callback en cours
                  const session = await auth.authorize({
                    clientID: CLIENT_ID,
                    redirectURL: REDIRECT_URI,
                    scopes: [],
                  });

                  if (session?.accessToken) {
                    console.log("[callback] Session récupérée après réessai");
                    await AsyncStorage.setItem(
                      "spotify_access_token",
                      session.accessToken
                    );
                    token = session.accessToken;
                  } else {
                    console.warn("[callback] Session retournée sans token");
                  }
                }
              } catch (authError: any) {
                console.error(
                  "[callback] Erreur lors du réessai d'autorisation:",
                  authError
                );
              }
            }
          }

          if (token) {
            console.log(
              "[callback] Token trouvé, tentative de connexion App Remote..."
            );
            // Essayer de se connecter à App Remote
            await ensureSpotifyRemoteSession();
            setStatus("success");
            // Rediriger vers la page d'accueil après un court délai
            setTimeout(() => {
              router.replace("/(tabs)/home");
            }, 1000);
          } else {
            console.warn(
              "[callback] Token toujours non trouvé après toutes les tentatives"
            );
            setStatus("error");
            // Rediriger quand même vers la page d'accueil après 3 secondes
            setTimeout(() => {
              router.replace("/(tabs)/home");
            }, 3000);
          }
        } else {
          console.warn("[callback] Aucun code d'autorisation dans les params");
          setStatus("error");
          setTimeout(() => {
            router.replace("/(tabs)/home");
          }, 2000);
        }
      } catch (error) {
        console.error(
          "[callback] Erreur lors du traitement du callback:",
          error
        );
        setStatus("error");
        // Rediriger vers la page d'accueil même en cas d'erreur
        setTimeout(() => {
          router.replace("/(tabs)/home");
        }, 2000);
      }
    };

    handleCallback();
  }, [params]);

  return (
    <Box style={styles.container}>
      <ActivityIndicator size="large" color="#1DB954" />
      <Text style={styles.text}>
        {status === "loading" && "Connexion en cours..."}
        {status === "success" && "Connexion réussie !"}
        {status === "error" && "Erreur de connexion"}
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  text: {
    marginTop: 16,
    color: "#fff",
    fontSize: 16,
  },
});
