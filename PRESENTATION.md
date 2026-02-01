# Replic Spotify - Résumé du Projet

## 🎯 Vue d'ensemble

**Replic Spotify** est une application mobile React Native (Expo) qui combine deux axes principaux :
1. **Reconstitution de l'expérience Spotify** via l'API officielle
2. **Système de contenu personnalisé** avec Supabase pour permettre aux artistes de publier leurs propres créations

---

## 📱 Axe 1 : Reconstitution Spotify

### Authentification & Sécurité
- **OAuth 2.0 avec PKCE** via `expo-auth-session`
- Scopes Spotify complets :
  - Lecture de profil utilisateur
  - Accès à la bibliothèque (playlists, albums, tracks)
  - Historique de lecture récent
  - Top artists et tracks
  - Contrôle de la lecture (playback)
- Stockage sécurisé des tokens dans `AsyncStorage`

### Intégration API Spotify
- **Spotify Web API** (`api.spotify.com`)
  - Récupération du profil utilisateur
  - Bibliothèque : playlists, albums, artistes suivis, tracks likés
  - Recherche multi-types (artistes, albums, tracks, playlists)
  - Historique de lecture récent
  - Top artists et top tracks
  - État de lecture en temps réel

### Player Spotify
- **Spotify Web Playback SDK** intégré via WebView
- Communication bidirectionnelle React Native ↔ WebView
- Fonctionnalités :
  - Lecture/Pause/Reprise
  - Contrôle de position (seek)
  - Synchronisation de l'état de lecture
  - Transfert de lecture vers l'appareil
  - Gestion du device_id unique

### Navigation & Interface
- **Expo Router** avec file-based routing
- **3 onglets principaux** :
  - **Home** : Profil, récemment joué, top artists
  - **Library** : Bibliothèque personnelle (playlists, albums, artistes, tracks likés)
  - **Search** : Recherche dans le catalogue Spotify
- Pages détaillées pour chaque type de contenu (artiste, album, playlist, track)

### Gestion d'État
- **TanStack Query (React Query)** pour le cache et la synchronisation
- Persistance des données avec `@tanstack/react-query-persist-client`
- Optimistic updates pour une UX fluide

---

## 🎨 Axe 2 : Système Custom Supabase

### Architecture Backend
- **Supabase** comme BaaS (Backend as a Service)
- **PostgreSQL** pour les données structurées
- **Storage** pour les fichiers (images, audio)
- **Edge Functions** pour contourner les policies RLS

### Modèle de Données

#### Tables
- **`artists`** : Profils d'artistes créateurs
  - `id`, `name`, `bio`, `image_url`, `status`, `spotify_user_id`, `created_at`
- **`songs`** : Chansons uploadées par les artistes
  - `id`, `title`, `image_url`, `song_url`, `status`, `created_at`
- **`songs_artists`** : Table de liaison (many-to-many)
  - `song_id`, `artist_id`, `created_at`

#### Enums
- **`artist_status`** : `'pending'`, `'validated'`, `'refused'`
- **`song_status`** : `'pending'`, `'validated'`, `'refused'`

#### Storage Buckets
- **`artists_images`** (public) : Photos de profil des artistes
- **`albums_images`** (public) : Covers des chansons
- **`tracks`** (privé) : Fichiers audio MP3 (accès via URLs signées)

### Fonctionnalités Créateur

#### 1. Candidature Artiste
- Formulaire de candidature avec :
  - Nom d'artiste
  - Bio
  - Photo de profil
- Upload automatique vers Supabase Storage
- Statut initial : `'pending'`
- Vérification de l'unicité par `spotify_user_id`

#### 2. Upload de Contenu
- **Création de chansons** :
  - Titre
  - Cover (image)
  - Fichier audio (MP3)
  - Sélection d'artistes associés (co-créateurs)
- Upload sécurisé via Edge Functions
- Génération automatique d'URLs signées pour les fichiers privés

#### 3. Gestion du Contenu
- **Dashboard créateur** (`/creator/home`) :
  - Vue d'ensemble du profil artiste
  - Liste des tracks par statut :
    - ✅ Validées
    - ⏳ En attente
    - ❌ Refusées
  - Prévisualisation et lecture des tracks
  - Statistiques (nombre de tracks par statut)

#### 4. Modération (Admin)
- Système de validation/refus :
  - `validateArtist(artistId)` → `status = 'validated'`
  - `refuseArtist(artistId)` → `status = 'refused'`
  - `validateSong(songId)` → `status = 'validated'`
  - `refuseSong(songId)` → `status = 'refused'`
- Queries pour récupérer les contenus en attente :
  - `getPendingArtists()`
  - `getPendingSongs()`

### Player Custom Supabase

#### Architecture
- **Expo AV** (`expo-av`) pour la lecture audio native
- Gestion d'état React avec hooks personnalisés
- URLs signées temporaires pour les fichiers privés (expiration configurable)

#### Fonctionnalités
- Lecture de tracks Supabase
- Contrôle complet (play, pause, resume, seek)
- Synchronisation de position en temps réel
- Gestion de la queue
- Support du mode silencieux iOS

### Services Supabase

#### Storage
- `uploadFile(bucket, filename, file, spotifyToken)` : Upload sécurisé
- `getPublicUrl(bucket, path)` : URLs publiques pour images
- `getSignedUrl(bucket, path, expiresIn)` : URLs signées pour audio

#### Artists
- `createArtist(name, bio, imageFile, spotifyToken)`
- `getArtistById(artistId, spotifyToken?)`
- `getValidatedArtists()`
- `getPendingArtists()`
- `validateArtist(artistId)`
- `refuseArtist(artistId)`

#### Songs
- `createSong(title, imageFile, audioFile, artistIds[], spotifyToken)`
- `getValidatedSongs()`
- `getSongsByArtistId(artistId)`
- `getPendingSongs()`
- `validateSong(songId)`
- `refuseSong(songId)`

---

## 🔄 Intégration des Deux Axes

### Expérience Utilisateur Unifiée
- **Player unique** qui gère à la fois :
  - Tracks Spotify (via Web Playback SDK)
  - Tracks Supabase (via Expo AV)
- **Bibliothèque mixte** :
  - Contenu Spotify (playlists, albums, tracks)
  - Contenu custom (artistes validés, chansons validées)
- **Recherche unifiée** (à implémenter) :
  - Résultats Spotify
  - Résultats Supabase

### Sécurité & Permissions
- **Row Level Security (RLS)** sur Supabase
- Edge Functions pour contourner les limitations RLS
- Authentification Spotify requise pour certaines opérations
- URLs signées pour protéger les fichiers audio privés

---

## 🛠️ Stack Technique

### Frontend
- **React Native** 0.79.6
- **Expo** ~53.0.25
- **Expo Router** ~5.1.10 (file-based routing)
- **TypeScript** 5.8.3
- **TanStack Query** 5.75.1 (state management)
- **@shopify/restyle** 2.4.5 (styling)

### Backend & Services
- **Supabase** (@supabase/supabase-js 2.86.0)
  - PostgreSQL
  - Storage
  - Edge Functions
- **Spotify Web API**
- **Spotify Web Playback SDK**

### Audio & Media
- **expo-av** ~15.0.1 (lecture audio native)
- **expo-image-picker** ~16.1.4
- **expo-document-picker** ~13.1.6
- **expo-file-system** ~18.1.11

### Authentification
- **expo-auth-session** ~6.2.1 (OAuth 2.0 PKCE)
- **@react-native-async-storage/async-storage** 2.1.2

---

## 📊 Points Forts du Projet

### Technique
✅ **Architecture modulaire** avec séparation claire des responsabilités  
✅ **TypeScript** pour la sécurité de type  
✅ **Gestion d'état moderne** avec React Query  
✅ **Sécurité** : OAuth 2.0 PKCE, RLS, URLs signées  
✅ **Performance** : Cache, optimistic updates, lazy loading  

### Fonctionnel
✅ **Expérience Spotify complète** : bibliothèque, recherche, player  
✅ **Système de création de contenu** pour les artistes  
✅ **Modération** avec workflow de validation  
✅ **Player unifié** gérant deux sources différentes  
✅ **Interface intuitive** avec navigation fluide  

---

## 🚀 Prochaines Étapes Possibles

- [ ] Recherche unifiée (Spotify + Supabase)
- [ ] Playlists custom avec tracks Supabase
- [ ] Système de favoris pour les tracks Supabase
- [ ] Notifications push pour les validations/refus
- [ ] Analytics pour les artistes (vues, écoutes)
- [ ] Partage social des tracks
- [ ] Mode hors-ligne avec cache audio

---

---

## 🏗️ Architecture Logicielle

### 1. Diagramme C4

#### Niveau 1 : Contexte Système
Le diagramme de contexte système montre l'application Replic Spotify et ses interactions avec les systèmes externes.

**Systèmes externes identifiés :**
- **Spotify OAuth** : Service d'authentification OAuth2
- **Spotify Web API** : API REST pour récupérer les données utilisateur
- **Spotify Web Playback SDK** : SDK JavaScript pour la lecture audio
- **Supabase** : Backend as a Service (PostgreSQL, Storage, Edge Functions)
- **Stockage Local** : AsyncStorage pour la persistance locale

> 📄 **Référence** : Voir le fichier `SYSTEM_CONTEXT_DIAGRAM.md` pour le diagramme Mermaid complet

#### Niveau 2 : Conteneurs
L'application se compose de plusieurs conteneurs :

1. **Application Mobile React Native** (Frontend)
   - Expo Router pour la navigation
   - Composants React Native
   - Hooks personnalisés pour la logique métier
   - TanStack Query pour la gestion d'état

2. **Supabase Backend** (Backend)
   - PostgreSQL pour les données structurées
   - Storage pour les fichiers (images, audio)
   - Edge Functions pour la logique serveur
   - Row Level Security (RLS) pour la sécurité

3. **WebView Spotify Player** (Conteneur intégré)
   - WebView React Native
   - Spotify Web Playback SDK
   - Communication bidirectionnelle via messages

#### Niveau 3 : Composants
**Frontend :**
- **Layers** : `app/` (routing), `features/` (features), `components/` (UI), `hooks/` (logique), `lib/` (services)
- **Services** : `lib/supabase/` (artists, songs, storage), `query/` (Spotify API)
- **Hooks** : `useSpotifyPlayer`, `useSupabasePlayer`, `useCreatorProfile`, etc.

**Backend :**
- **Edge Functions** : `create-artist`, `create-song`, `upload-file`
- **Database** : Tables `artists`, `songs`, `songs_artists`
- **Storage** : Buckets `artists_images`, `albums_images`, `tracks`

---

### 2. Styles Architecturaux

#### 2.1 Architecture en Couches (Layered Architecture)
L'application suit une architecture en couches claire :

```
┌─────────────────────────────────────┐
│   Presentation Layer               │
│   (app/, components/, features/)   │
├─────────────────────────────────────┤
│   Application Layer                 │
│   (hooks/, query/)                  │
├─────────────────────────────────────┤
│   Domain Layer                      │
│   (lib/supabase/types.ts)          │
├─────────────────────────────────────┤
│   Infrastructure Layer              │
│   (lib/supabase/, supabase/)       │
└─────────────────────────────────────┘
```

**Séparation des responsabilités :**
- **Presentation** : Composants UI, navigation, affichage
- **Application** : Hooks métier, orchestration des services
- **Domain** : Types, entités métier, règles de domaine
- **Infrastructure** : Accès données, API externes, storage

#### 2.2 Architecture Client-Serveur
- **Client** : Application mobile React Native (Expo)
- **Serveur** : Supabase (PostgreSQL + Storage + Edge Functions)
- **Communication** : REST API (Supabase), REST API (Spotify), WebSocket (Spotify Player)

#### 2.3 Architecture Hexagonale (Ports & Adapters)
- **Ports** : Interfaces définies dans `lib/supabase/` (artists, songs, storage)
- **Adapters** : Implémentations concrètes (Supabase client, Spotify API)
- **Domain** : Types et entités dans `lib/supabase/types.ts`

#### 2.4 Microservices (Partiel)
- **Edge Functions** Supabase comme microservices dédiés
- Chaque fonction a une responsabilité unique (create-artist, create-song, upload-file)

---

### 3. Modélisation DDD (Domain-Driven Design)

#### 3.1 Bounded Contexts
Deux contextes délimités principaux :

1. **Spotify Context**
   - **Entités** : Profile, Playlist, Album, Track, Artist (Spotify)
   - **Value Objects** : SpotifyToken, DeviceId, PlaybackState
   - **Services** : SpotifyAuthService, SpotifyAPIService, SpotifyPlayerService

2. **Creator Context**
   - **Entités** : Artist (Supabase), Song, SongArtist
   - **Value Objects** : ArtistStatus, SongStatus, StoragePath
   - **Services** : ArtistService, SongService, StorageService
   - **Aggregates** : Artist (root), Song (root)

#### 3.2 Entités du Domaine

**Artist (Creator Context)**
```typescript
type Artist = {
  id: string;                    // Identifiant unique
  name: string;                  // Nom de l'artiste
  bio: string | null;            // Biographie
  image_url: string | null;      // URL de l'image
  status: ArtistStatus;          // Statut de modération
  spotify_user_id?: string;      // Lien avec compte Spotify
  created_at: string;            // Date de création
}
```

**Song (Creator Context)**
```typescript
type Song = {
  id: string;                    // Identifiant unique
  title: string;                 // Titre de la chanson
  image_url: string | null;      // URL de la cover
  song_url: string | null;       // URL du fichier audio
  status: SongStatus;            // Statut de modération
  created_at: string;            // Date de création
}
```

#### 3.3 Value Objects

**ArtistStatus** : `'pending' | 'validated' | 'refused'`
- Encapsule la logique de statut de modération
- Immutable, pas d'identité propre

**SongStatus** : `'pending' | 'validated' | 'refused'`
- Même principe que ArtistStatus

**StoragePath** : Chemin structuré pour le stockage
- Format : `{prefix}/{filename}` (ex: `artists/artist_123.jpg`)

#### 3.4 Aggregates

**Artist Aggregate** (Root)
- Contient les informations de l'artiste
- Gère les règles de création et validation
- Référence les Songs via `songs_artists`

**Song Aggregate** (Root)
- Contient les informations de la chanson
- Gère les règles de création et validation
- Référence les Artists via `songs_artists`

#### 3.5 Domain Services

**ModerationService**
- `validateArtist(artistId)` : Valide un artiste
- `refuseArtist(artistId)` : Refuse un artiste
- `validateSong(songId)` : Valide une chanson
- `refuseSong(songId)` : Refuse une chanson

**StorageService**
- `uploadFile()` : Upload sécurisé de fichiers
- `getPublicUrl()` : Génération d'URLs publiques
- `getSignedUrl()` : Génération d'URLs signées temporaires

#### 3.6 Repositories (Pattern Repository)
Implémentés dans `lib/supabase/` :

- **ArtistRepository** (`artists.ts`) : CRUD pour les artistes
- **SongRepository** (`songs.ts`) : CRUD pour les chansons
- **StorageRepository** (`storage.ts`) : Gestion du stockage

---

### 4. Design Patterns

#### 4.1 Repository Pattern
**Localisation** : `lib/supabase/artists.ts`, `lib/supabase/songs.ts`

**Exemple** :
```typescript
// Repository pour les artistes
export const getArtistById = async (artistId: string): Promise<Artist | null>
export const createArtist = async (...): Promise<Artist>
export const validateArtist = async (artistId: string): Promise<void>
```

**Avantages** :
- Abstraction de l'accès aux données
- Facilite les tests (mockable)
- Séparation des préoccupations

#### 4.2 Factory Pattern
**Localisation** : `lib/supabase/utils.ts`

**Exemple** :
```typescript
export const generateUniqueImageName = (
  prefix: string,
  originalName?: string,
  extension: string = "jpg"
): string
```

**Usage** : Génération de noms de fichiers uniques pour éviter les collisions

#### 4.3 Hook Pattern (Custom Hooks)
**Localisation** : `hooks/`

**Exemples** :
- `useSpotifyPlayer()` : Gestion du player Spotify
- `useSupabasePlayer()` : Gestion du player Supabase
- `useCreatorProfile()` : Gestion du profil créateur
- `useCreatorTracks()` : Gestion des tracks créateur

**Avantages** :
- Réutilisabilité de la logique
- Encapsulation de l'état
- Séparation UI / Logique métier

#### 4.4 Adapter Pattern
**Localisation** : `components/SpotifyConnectDevice.tsx`

**Usage** : Adaptation du Spotify Web Playback SDK (JavaScript) pour React Native via WebView

#### 4.5 Strategy Pattern
**Localisation** : `features/player/DetailPlay.tsx`

**Usage** : Stratégie différente pour la lecture selon la source (Spotify vs Supabase)

#### 4.6 Singleton Pattern
**Localisation** : `lib/supabase/client.ts`

**Usage** : Instance unique du client Supabase partagée dans toute l'application

#### 4.7 Facade Pattern
**Localisation** : `lib/supabase/index.ts`

**Usage** : Interface simplifiée pour accéder aux services Supabase

---

### 5. Découpage Technique du Projet

#### 5.1 Structure des Dossiers

```
replic-spotify/
├── app/                    # Expo Router (file-based routing)
│   ├── (tabs)/            # Onglets principaux
│   ├── creator/           # Pages créateur
│   └── index.tsx          # Point d'entrée
├── components/             # Composants UI réutilisables
│   └── ui/                # Composants UI spécifiques
├── features/              # Features métier
│   ├── home/             # Feature Home
│   ├── pages/            # Pages détaillées
│   └── player/           # Feature Player
├── hooks/                 # Custom hooks
│   ├── ArtistCreator/   # Hooks créateur
│   ├── Player/          # Hooks player
│   └── Spotify/         # Hooks Spotify
├── lib/                   # Bibliothèques et services
│   └── supabase/         # Services Supabase
├── query/                 # Queries Spotify API
├── theme/                 # Configuration thème
└── supabase/              # Edge Functions
    └── functions/
```

#### 5.2 Dépendances Externes

**Core** :
- `react` 19.0.0
- `react-native` 0.79.6
- `expo` ~53.0.25
- `typescript` 5.8.3

**Routing & Navigation** :
- `expo-router` ~5.1.10
- `@react-navigation/*`

**State Management** :
- `@tanstack/react-query` 5.75.1
- `@react-native-async-storage/async-storage` 2.1.2

**Backend** :
- `@supabase/supabase-js` 2.86.0

**Audio & Media** :
- `expo-av` ~15.0.1
- `expo-image-picker` ~16.1.4
- `expo-document-picker` ~13.1.6

**Authentification** :
- `expo-auth-session` ~6.2.1

**Spotify** :
- `react-native-spotify-remote` ^0.3.10

#### 5.3 Communication Inter-Composants

**Props Drilling** : Minimisé grâce aux hooks personnalisés

**Context API** : Utilisé implicitement par TanStack Query

**Event Bus** : Communication WebView ↔ React Native via `postMessage`

---

### 6. Testing

#### 6.1 Stratégie de Tests

**Tests Unitaires** :
- Composants : `components/__tests__/ThemedText-test.tsx`
- Utilitaires : Tests des fonctions dans `lib/supabase/utils.ts`
- Hooks : Tests des hooks personnalisés (à développer)

**Tests d'Intégration** :
- Intégration Supabase : Tests des repositories
- Intégration Spotify API : Tests des queries
- Intégration Player : Tests des hooks de player

**Tests E2E** :
- Flux d'authentification
- Flux de création d'artiste
- Flux d'upload de chanson
- Flux de lecture audio

#### 6.2 Outils de Test

- **Jest** : Framework de test (inclus avec Expo)
- **React Native Testing Library** : Tests de composants
- **Snapshots** : Tests de régression visuelle

#### 6.3 Couverture Actuelle

- ✅ Tests de composants basiques (ThemedText)
- ⚠️ Tests de services à développer
- ⚠️ Tests de hooks à développer
- ⚠️ Tests E2E à développer

#### 6.4 Stratégie de Mock

**Mocks nécessaires** :
- Mock Supabase client
- Mock Spotify API
- Mock AsyncStorage
- Mock Expo AV

---

## 📝 Notes de Présentation

### Structure Recommandée (13 minutes)

1. **Présentation fonctionnelle** (4 min)
   - Besoin utilisateur
   - Découpage fonctionnel (Spotify + Supabase)
   - Démos fonctionnelles

2. **Diagramme C4** (6 min)
   - Contexte système
   - Conteneurs
   - Composants principaux

3. **Présentation technique** (4 min)
   - Outils/langages
   - Dépendances externes
   - Découpage technique
   - Styles architecturaux

4. **Modélisation DDD** (6 min)
   - Bounded contexts
   - Entités et Value Objects
   - Aggregates
   - Domain Services
   - Design Patterns

5. **Testing** (mention rapide)
   - Stratégie
   - Outils
   - État actuel

### Démos Suggérées
- 🔐 Authentification Spotify
- 🎵 Lecture d'une track Spotify
- 📚 Navigation dans la bibliothèque
- 🎨 Candidature artiste
- 📤 Upload d'une chanson
- ▶️ Lecture d'une track Supabase
- 📊 Dashboard créateur

### Points Clés à Mettre en Avant

**Architecture** :
- ✅ Architecture en couches claire
- ✅ Séparation des responsabilités
- ✅ Pattern Repository pour l'accès aux données
- ✅ Custom Hooks pour la réutilisabilité

**DDD** :
- ✅ Bounded contexts bien définis
- ✅ Entités et Value Objects typés
- ✅ Domain Services pour la logique métier
- ✅ Aggregates pour la cohérence

**Design Patterns** :
- ✅ Repository, Factory, Hook, Adapter, Strategy
- ✅ Singleton pour le client Supabase
- ✅ Facade pour simplifier l'API

---

**Version** : 2.0 (Architecture Logicielle)  
**Date** : 2024  
**Auteur** : Équipe Replic Spotify
