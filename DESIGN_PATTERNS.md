# Design Patterns Utilisés dans Replic Spotify

Ce document liste tous les design patterns identifiés dans le projet avec leurs localisations et exemples concrets.

---

## 📋 Liste des Design Patterns

### 1. **Repository Pattern** 🗄️

**Objectif** : Abstraction de l'accès aux données, séparation entre la logique métier et la persistance.

**Localisation** :
- `lib/supabase/artists.ts` : Repository pour les artistes
- `lib/supabase/songs.ts` : Repository pour les chansons
- `lib/supabase/storage.ts` : Repository pour le stockage

**Exemple concret** :
```typescript
// lib/supabase/artists.ts
export const getArtistById = async (
  artistId: string,
  spotifyToken?: string
): Promise<Artist | null> {
  // Logique d'accès aux données abstraite
}

export const createArtist = async (
  name: string,
  bio: string,
  imageFile: UploadableFile,
  spotifyToken: string
): Promise<Artist> {
  // Création abstraite d'un artiste
}

export const validateArtist = async (artistId: string): Promise<void> {
  // Validation abstraite
}
```

**Avantages** :
- ✅ Facilite les tests (mockable)
- ✅ Permet de changer la source de données sans modifier le code métier
- ✅ Séparation claire des responsabilités

---

### 2. **Factory Pattern** 🏭

**Objectif** : Création d'objets complexes avec une interface simplifiée.

**Localisation** : `lib/supabase/utils.ts`

**Exemple concret** :
```typescript
// Génération de noms de fichiers uniques
export const generateUniqueImageName = (
  prefix: string,
  originalName?: string,
  extension: string = "jpg"
): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  // Logique de création d'un nom unique
  return `${baseName}_${timestamp}_${random}.${extension}`;
};

// Nettoyage et création de noms de fichiers valides
export const sanitizeFileName = (title: string, extension: string = "mp3"): string => {
  // Transformation d'un titre en nom de fichier valide
  let sanitized = title.trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "");
  return `${sanitized}_${Date.now()}.${extension}`;
};
```

**Usage** :
- Génération de noms de fichiers uniques pour éviter les collisions
- Création de chemins de stockage structurés

---

### 3. **Custom Hooks Pattern** 🎣

**Objectif** : Encapsulation de la logique métier réutilisable et séparation UI/Logique.

**Localisation** : `hooks/`

**Exemples concrets** :

#### `useSpotifyPlayer()` - Gestion du player Spotify
```typescript
// hooks/Spotify/useSpotifyPlayer.ts
export default function useSpotifyPlayer() {
  const [state, setState] = useState<PlayerState | null>(null);
  
  const play = async (uri: string, position?: number) => {
    // Logique de lecture Spotify
  };
  
  const pause = async () => {
    // Logique de pause
  };
  
  return { state, play, pause, resume, seek };
}
```

#### `useSupabasePlayer()` - Gestion du player Supabase
```typescript
// hooks/Player/useSupabasePlayer.ts
export default function useSupabasePlayer() {
  const [state, setState] = useState<SupabasePlayerState | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  
  const play = async (track: TrackInfo) => {
    // Logique de lecture audio native avec Expo AV
  };
  
  return { state, play, pause, resume, togglePlayPause, stop };
}
```

#### `useCreatorProfile()` - Gestion du profil créateur
```typescript
// hooks/ArtistCreator/useCreatorProfile.ts
export const useCreatorProfile = () => {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Logique de récupération et gestion du profil
  return { artist, loading };
};
```

**Avantages** :
- ✅ Réutilisabilité de la logique
- ✅ Encapsulation de l'état
- ✅ Séparation UI / Logique métier
- ✅ Testabilité améliorée

---

### 4. **Adapter Pattern** 🔌

**Objectif** : Adapter une interface incompatible pour qu'elle fonctionne avec le système existant.

**Localisation** : `components/SpotifyConnectDevice.tsx`

**Exemple concret** :
```typescript
// Adaptation du Spotify Web Playback SDK (JavaScript) pour React Native
export default function SpotifyWebPlayer() {
  const [token, setToken] = useState<string | null>(null);
  const webviewRef = useRef<WebView>(null);

  // Injection du SDK JavaScript dans une WebView
  const injectedHtml = `
    <script src="https://sdk.scdn.co/spotify-player.js"></script>
    <script>
      window.onSpotifyWebPlaybackSDKReady = () => {
        player = new Spotify.Player({
          name: 'MonAppRN',
          getOAuthToken: cb => cb(window.tokenFromRN),
        });
        
        // Adaptation des événements SDK vers React Native
        player.addListener('player_state_changed', (state) => {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'PLAYER_STATE', state })
          );
        });
      };
    </script>
  `;

  // Adaptation des messages React Native vers le SDK
  const handleMessage = (event: WebViewMessageEvent) => {
    const message = JSON.parse(event.nativeEvent.data);
    if (message.type === 'PLAY') {
      webviewRef.current?.postMessage(
        JSON.stringify({ type: 'PLAY', uris: message.uris })
      );
    }
  };
}
```

**Problème résolu** :
- Le Spotify Web Playback SDK est en JavaScript pour le web
- React Native nécessite une adaptation via WebView
- Communication bidirectionnelle via `postMessage`

---

### 5. **Strategy Pattern** 🎯

**Objectif** : Définir une famille d'algorithmes interchangeables.

**Localisation** : `features/player/DetailPlay.tsx`

**Exemple concret** :
```typescript
export default function DetailPlay({ track }: DetailPlayProps) {
  const supabasePlayer = useSupabasePlayer();
  
  // Stratégie différente selon la source de la track
  useEffect(() => {
    const isSupabaseUrl = finalUri.startsWith("http://") || 
                          finalUri.startsWith("https://");
    const isSpotifyUri = finalUri.startsWith("spotify:");
    
    if (isSupabaseUrl) {
      // Stratégie 1 : Lecture via Expo AV (Supabase)
      supabasePlayer.play(trackInfo);
    } else if (isSpotifyUri) {
      // Stratégie 2 : Lecture via Spotify Web Playback SDK
      // (géré par un autre hook/service)
    }
  }, [finalUri]);
}
```

**Avantages** :
- ✅ Algorithme de lecture interchangeable selon la source
- ✅ Facilite l'ajout de nouvelles sources (ex: SoundCloud, YouTube)
- ✅ Code plus maintenable

---

### 6. **Singleton Pattern** 🔒

**Objectif** : Garantir une seule instance d'un objet dans toute l'application.

**Localisation** : `lib/supabase/client.ts`

**Exemple concret** :
```typescript
// Création d'une seule instance du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});

// Cette instance est importée et réutilisée partout dans l'application
// lib/supabase/artists.ts
import { supabase } from "./client";

// lib/supabase/songs.ts
import { supabase } from "./client";
```

**Avantages** :
- ✅ Une seule connexion à la base de données
- ✅ Partage de la configuration
- ✅ Économie de ressources

---

### 7. **Facade Pattern** 🎭

**Objectif** : Fournir une interface simplifiée à un sous-système complexe.

**Localisation** : `lib/supabase/index.ts`

**Exemple concret** :
```typescript
// lib/supabase/index.ts
// Facade simplifiant l'accès aux services Supabase

// Client
export { supabase, supabaseUrl, supabaseAnonKey } from "./client";

// Types
export type {
  Artist, ArtistStatus, Song, SongStatus,
  SongArtist, SongWithArtists, UploadableFile,
} from "./types";

// Storage
export { uploadFile, getPublicUrl, getSignedUrl } from "./storage";

// Artists
export {
  createArtist, getArtistById, getArtistBySpotifyUserId,
  updateArtistSpotifyUserId, getValidatedArtists,
  getPendingArtists, validateArtist, refuseArtist,
} from "./artists";

// Songs
export {
  createSong, getValidatedSongs, getPendingSongs,
  getRefusedSongs, getSongsByArtistId,
  validateSong, refuseSong,
} from "./songs";
```

**Usage dans le code** :
```typescript
// Au lieu d'importer depuis plusieurs fichiers :
// import { createArtist } from "@/lib/supabase/artists";
// import { createSong } from "@/lib/supabase/songs";
// import { uploadFile } from "@/lib/supabase/storage";

// On importe depuis un seul point d'entrée :
import { createArtist, createSong, uploadFile } from "@/lib/supabase";
```

**Avantages** :
- ✅ Interface simplifiée
- ✅ Réduction de la complexité pour les utilisateurs
- ✅ Point d'entrée unique et cohérent

---

### 8. **Observer Pattern** 👁️

**Objectif** : Notifier automatiquement les observateurs des changements d'état.

**Localisation** : 
- `hooks/Player/useSupabasePlayer.ts` (via Expo AV)
- `components/SpotifyConnectDevice.tsx` (via Spotify SDK)

**Exemple concret** :

#### Observer avec Expo AV
```typescript
// hooks/Player/useSupabasePlayer.ts
sound.setOnPlaybackStatusUpdate((status) => {
  // Observer les changements de statut de lecture
  if (status.isLoaded) {
    if (status.didJustFinish) {
      // Notification : chanson terminée
      setState((prev) => ({ ...prev, isPaused: true }));
    } else {
      // Notification : mise à jour de la position
      setState((prev) => ({
        ...prev,
        playbackPosition: status.positionMillis || 0,
        isPaused: !status.isPlaying,
      }));
    }
  }
});
```

#### Observer avec Spotify SDK
```typescript
// components/SpotifyConnectDevice.tsx
player.addListener('player_state_changed', (state) => {
  // Observer les changements d'état du player Spotify
  const payload = {
    type: 'PLAYER_STATE',
    state: {
      playbackPosition: state.position,
      trackDuration: state.duration,
      isPaused: state.paused,
      track: { /* ... */ }
    }
  };
  // Notification vers React Native
  window.ReactNativeWebView.postMessage(JSON.stringify(payload));
});
```

**Avantages** :
- ✅ Découplage entre l'émetteur et les récepteurs
- ✅ Mise à jour automatique de l'UI
- ✅ Réactivité aux événements système

---

### 9. **Builder Pattern** (Partiel) 🏗️

**Objectif** : Construction d'objets complexes étape par étape.

**Localisation** : `hooks/ArtistCreator/useCreatorTrackSubmission.ts`

**Exemple concret** :
```typescript
export const useCreatorTrackSubmission = () => {
  const [state, setState] = useState({
    title: "",
    coverUri: null,
    audioUri: null,
    audioFileName: null,
    coCreators: [],
    coCreatorDraft: "",
    loading: false,
  });

  // Méthodes de construction progressive
  const actions = {
    setTitle: (title: string) => setState(prev => ({ ...prev, title })),
    pickCover: async () => { /* ... */ },
    pickAudio: async () => { /* ... */ },
    addCoCreator: (name: string) => { /* ... */ },
    removeCoCreator: (index: number) => { /* ... */ },
    submit: async () => {
      // Construction finale avec toutes les données
      await createSong(
        state.title,
        state.coverUri,
        state.audioUri,
        state.coCreators.map(c => c.id)
      );
    },
  };

  return { state, actions };
};
```

**Avantages** :
- ✅ Construction progressive d'objets complexes
- ✅ Validation à chaque étape
- ✅ Code plus lisible

---

### 10. **Template Method Pattern** (Implicite) 📝

**Objectif** : Définir le squelette d'un algorithme avec des étapes personnalisables.

**Localisation** : `lib/supabase/artists.ts`, `lib/supabase/songs.ts`

**Exemple concret** :
```typescript
// Template commun pour la création d'entités
export const createArtist = async (
  name: string,
  bio: string,
  imageFile: UploadableFile,
  spotifyToken: string
): Promise<Artist> {
  // Étape 1 : Upload du fichier (template)
  const uploadResult = await uploadFile(
    "artists_images",
    toStoragePath("artists", fileName),
    fileForUpload,
    spotifyToken
  );

  // Étape 2 : Création de l'entité (template)
  const response = await fetch(`${supabaseUrl}/functions/v1/create-artist`, {
    method: "POST",
    headers: { /* ... */ },
    body: JSON.stringify({ name, bio, image_url: uploadResult.url }),
  });

  // Étape 3 : Retour du résultat (template)
  return result.data as Artist;
}

// Même template pour createSong avec des variations
export const createSong = async (
  title: string,
  imageFile: UploadableFile,
  audioFile: UploadableFile,
  artistIds: string[],
  spotifyToken: string
): Promise<Song> {
  // Même structure mais avec upload de 2 fichiers
  // et création des associations songs_artists
}
```

---

## 📊 Récapitulatif

| Pattern | Localisation | Usage Principal |
|---------|-------------|-----------------|
| **Repository** | `lib/supabase/*.ts` | Abstraction accès données |
| **Factory** | `lib/supabase/utils.ts` | Création noms fichiers |
| **Custom Hooks** | `hooks/` | Logique métier réutilisable |
| **Adapter** | `components/SpotifyConnectDevice.tsx` | Adaptation SDK Spotify |
| **Strategy** | `features/player/DetailPlay.tsx` | Stratégie lecture selon source |
| **Singleton** | `lib/supabase/client.ts` | Instance unique client Supabase |
| **Facade** | `lib/supabase/index.ts` | Interface simplifiée |
| **Observer** | `hooks/Player/*.ts` | Écoute événements lecture |
| **Builder** | `hooks/ArtistCreator/*.ts` | Construction progressive objets |
| **Template Method** | `lib/supabase/*.ts` | Structure commune création |

---

## 🎯 Bénéfices Globaux

Ces patterns permettent de :

✅ **Maintenabilité** : Code organisé et facile à modifier  
✅ **Testabilité** : Patterns facilitent les tests unitaires  
✅ **Réutilisabilité** : Logique métier réutilisable via hooks  
✅ **Séparation des responsabilités** : Chaque pattern a un rôle clair  
✅ **Évolutivité** : Facilite l'ajout de nouvelles fonctionnalités  
✅ **Découplage** : Réduction des dépendances entre modules  

---

**Version** : 1.0  
**Date** : 2024  
**Auteur** : Équipe Replic Spotify
