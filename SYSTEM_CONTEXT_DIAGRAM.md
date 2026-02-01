# Diagramme de Contexte Système - Replic Spotify

## Vue d'ensemble

Ce diagramme montre les interactions entre l'application Replic Spotify et les systèmes externes.

```mermaid
graph TB
    User["👤 Utilisateur Mobile<br/>[Person]"]
    App["📱 Replic Spotify<br/>[Software System]<br/>Application mobile React Native/Expo<br/>permettant d'écouter de la musique<br/>et de gérer sa bibliothèque Spotify"]
    Auth["🔐 Spotify OAuth<br/>[Software System]<br/>accounts.spotify.com<br/>Service d'authentification OAuth2"]
    API["🌐 Spotify Web API<br/>[Software System]<br/>api.spotify.com<br/>API REST pour récupérer les données<br/>utilisateur et contrôler la lecture"]
    SDK["🎵 Spotify Web Playback SDK<br/>[Software System]<br/>sdk.scdn.co<br/>SDK JavaScript pour la lecture audio<br/>via WebView"]
    Supabase["🗄️ Supabase<br/>[Software System]<br/>Backend as a Service<br/>PostgreSQL + Storage + Edge Functions<br/>pour le contenu custom"]
    Storage["💾 Stockage Local<br/>[Software System]<br/>AsyncStorage<br/>Stockage persistant local<br/>sur l'appareil mobile"]
    
    User -.->|"Écoute de la musique et<br/>gère sa bibliothèque en utilisant"| App
    App -.->|"Authentifie l'utilisateur<br/>via OAuth2 PKCE"| Auth
    App -.->|"Récupère les données utilisateur<br/>et contrôle la lecture en utilisant"| API
    App -.->|"Lit la musique<br/>via WebView en utilisant"| SDK
    App -.->|"Stocke les tokens et<br/>données en cache dans"| Storage
    App -.->|"Gère le contenu custom<br/>(artistes, chansons) via"| Supabase
    
    Auth -.->|"Fournit les tokens<br/>d'accès à"| App
    API -.->|"Envoie les données<br/>à"| App
    SDK -.->|"Envoie l'état de lecture<br/>et reçoit les commandes de"| App
    Supabase -.->|"Fournit les données<br/>et fichiers à"| App
    
    style App fill:#1DB954,stroke:#191414,stroke-width:3px,color:#fff
    style User fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style Auth fill:#FF6B6B,stroke:#C92A2A,stroke-width:2px,color:#fff
    style API fill:#FFA500,stroke:#CC6600,stroke-width:2px,color:#fff
    style SDK fill:#9B59B6,stroke:#6A1B9A,stroke-width:2px,color:#fff
    style Supabase fill:#3ECF8E,stroke:#1F7A5F,stroke-width:2px,color:#fff
    style Storage fill:#607D8B,stroke:#37474F,stroke-width:2px,color:#fff
```

## Description des Interactions

### 1. Utilisateur ↔ Application
- **Utilisateur** : Interagit avec l'interface mobile (iOS/Android)
- **Application** : Affiche les écrans, gère la navigation, contrôle la lecture

### 2. Application ↔ Spotify OAuth
- **Authentification** : Flux OAuth2 avec PKCE
- **Endpoints** :
  - `https://accounts.spotify.com/authorize` (autorisation)
  - `https://accounts.spotify.com/api/token` (échange de tokens)
- **Scopes** : Lecture de profil, playlists, historique, contrôle de lecture

### 3. Application ↔ Spotify Web API
- **Données récupérées** :
  - Profil utilisateur
  - Artistes, albums, tracks, playlists
  - Historique de lecture récent
  - Top artists et tracks
  - État de lecture actuel
- **Contrôle** : Lecture, pause, recherche dans la piste

### 4. Application ↔ Spotify Web Playback SDK
- **Lecture audio** : Via WebView intégrée
- **Communication** : Messages bidirectionnels entre React Native et WebView
- **Fonctionnalités** : Lecture, pause, contrôle de position, état du player

### 5. Application ↔ Supabase
- **PostgreSQL** : Stockage des données structurées (artistes, chansons)
- **Storage** : Stockage des fichiers (images, audio)
- **Edge Functions** : Logique serveur pour la création de contenu
- **Row Level Security (RLS)** : Sécurité au niveau des données

### 6. Application ↔ Stockage Local
- **AsyncStorage** : Stockage des tokens d'accès, device_id, et données en cache
- **Persistance** : Maintien de l'état de l'application entre les sessions

## Technologies Utilisées

- **Frontend** : React Native, Expo Router
- **Authentification** : Expo Auth Session (OAuth2/PKCE)
- **API Client** : Fetch API (REST)
- **Lecture Audio** : Spotify Web Playback SDK via WebView
- **Stockage** : AsyncStorage
- **State Management** : TanStack Query (React Query)

---

## Légende du diagramme

- 🟢 Rectangle vert avec icône personne = **Person, Utilisateur**
- 🟢 Rectangle vert = **Replic Spotify** (Système principal)
- 🔴 Rectangle rouge = **Spotify OAuth** (Système logiciel externe)
- 🟠 Rectangle orange = **Spotify Web API** (Système logiciel externe)
- 🟣 Rectangle violet = **Spotify Web Playback SDK** (Système logiciel externe)
- 🟢 Rectangle vert clair = **Supabase** (Système logiciel externe)
- ⚫ Rectangle gris = **Stockage Local** (Système logiciel externe)
- Flèche pointillée = **Relation**

---

**System Context View: Replic Spotify**

Le diagramme de contexte système pour l'application mobile Replic Spotify | Format C4 Model | License: CC BY 4.0

