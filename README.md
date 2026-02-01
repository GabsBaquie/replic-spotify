# Replic Spotify

**Replic Spotify** est une application mobile (React Native / Expo) qui associe l’expérience **Spotify** (API officielle) et un **système de contenu créateur** (Supabase). Les utilisateurs peuvent écouter leur bibliothèque Spotify, rechercher des titres et des artistes (catalogue Spotify + créateurs validés), et les créateurs peuvent publier leurs propres morceaux après validation.

---

## Fonctionnalités principales

- **Connexion Spotify** (OAuth 2.0) et accès à la bibliothèque (playlists, albums, artistes, titres likés)
- **Recherche unifiée** : résultats Spotify et créateurs (artistes / titres validés) dans une même liste, triés par pertinence
- **Lecture** : un seul player à la fois — Spotify ou Supabase ; la barre de lecture en bas de l’écran s’adapte au titre en cours
- **Espace créateur** : candidature artiste, upload de titres (cover + audio), suivi des statuts (validé / en attente / refusé)

---

## Documentation

| Document | Description |
|----------|-------------|
| [**INSTALLATION.md**](./INSTALLATION.md) | Prérequis (Mac / Android), simulateurs, variables d’environnement, lancement du projet |
| [**GUIDE_UTILISATEUR.md**](./GUIDE_UTILISATEUR.md) | Utilisation de l’app : connexion, recherche, bibliothèque, lecture, espace créateur |
| [**PRESENTATION.md**](./PRESENTATION.md) | Présentation technique et fonctionnelle du projet |

---

## Pour tester l’application (enseignants / évaluation)

Le fichier **`.env`** n’est pas versionné (sécurité : clés API). Il est **transmis séparément** (mail, plateforme, etc.) pour permettre de lancer l’app sans créer de comptes Spotify / Supabase.

**Étapes :**

1. Cloner le dépôt et installer les dépendances (voir [INSTALLATION.md](./INSTALLATION.md)).
2. Récupérer le fichier **`.env`** fourni et le placer **à la racine du projet** (à côté de `package.json`).
3. Installer les outils nécessaires selon la plateforme (Mac : Xcode + simulateur iOS ; Android : Android Studio + émulateur) — détaillé dans [INSTALLATION.md](./INSTALLATION.md).
4. Lancer l’app : `npx expo start` puis ouvrir sur simulateur / appareil ou Expo Go.

Sans le fichier `.env`, l’application ne pourra pas se connecter à Spotify ni à Supabase.

---

## Démarrage rapide (développeurs)

```bash
# Cloner et entrer dans le projet
git clone <url-du-repo>
cd replic-spotify

# Installer les dépendances
npm install

# Placer le fichier .env à la racine (fourni séparément ou créé selon INSTALLATION.md)

# Démarrer Expo
npx expo start
```

Ensuite : **i** pour iOS, **a** pour Android, ou scanner le QR code avec Expo Go. Détails et dépannage dans [INSTALLATION.md](./INSTALLATION.md).

---

## Stack technique

- **Frontend** : React Native, Expo SDK 53, Expo Router, TypeScript, TanStack Query, Restyle
- **Backend / services** : Spotify Web API & Web Playback SDK, Supabase (PostgreSQL, Storage, Edge Functions)
- **Audio** : Expo AV (titres créateurs), Spotify SDK (titres Spotify)

---

## Licence

Projet à usage pédagogique / évaluation.
