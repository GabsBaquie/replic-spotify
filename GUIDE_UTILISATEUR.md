# Guide utilisateur – Replic Spotify

Ce guide décrit comment utiliser l’application Replic Spotify au quotidien : connexion, écoute, recherche, bibliothèque et espace créateur.

---

## 1. Démarrer et se connecter

### Premier lancement

1. Ouvre l’application Replic Spotify.
2. Tu arrives sur l’**onboarding** (écran d’accueil / connexion).
3. Appuie sur le bouton pour **te connecter avec Spotify**.
4. Une page web (ou une fenêtre) s’ouvre pour te demander d’autoriser l’app à accéder à ton compte Spotify.
5. Accepte les autorisations, puis tu es redirigé vers l’app. Tu es alors connecté.

Tu accèdes ensuite à l’écran d’accueil (Home) avec les onglets en bas.

### Connexion suivante

Si tu as déjà connecté l’app une fois, ta session est conservée. Au prochain lancement, tu peux arriver directement sur l’accueil sans refaire la connexion (sauf si tu t’es déconnecté ou si la session a expiré).

---

## 2. Les onglets principaux

En bas de l’écran, trois onglets :

- **Home** : accueil, profil, récemment écouté, top artistes.
- **Search** : recherche (Spotify + créateurs).
- **Your Library** : ta bibliothèque (playlists, albums, artistes, titres likés).

---

## 3. Home (Accueil)

- **Profil** : accès à ton profil Spotify (photo, nom).
- **Récemment écouté** : titres que tu as écoutés récemment sur Spotify.
- **Top artistes** : tes artistes les plus écoutés.

En appuyant sur un titre ou un artiste, tu ouvres la page détaillée (artiste, album ou titre) et tu peux lancer la lecture.

---

## 4. Search (Recherche)

### Barre de recherche

- En haut, une barre **« Artiste, titre… »**.
- La recherche se lance automatiquement après que tu aies tapé (avec un court délai).

### Résultats mélangés (Spotify + créateurs)

Les résultats affichent en même temps :

- **Contenu Spotify** : artistes, albums, titres, playlists du catalogue Spotify.
- **Contenu créateurs** : artistes et titres validés issus de Supabase (indiqués par un sous-titre du type **« Créateur »**).

L’ordre des résultats est adapté à ta requête : les meilleurs matchs (ex. nom exact, nom qui commence par la recherche) apparaissent en premier.

### Utiliser un résultat

- **Artiste Spotify** : ouvre la fiche artiste Spotify (top titres, etc.).
- **Artiste créateur** : ouvre la fiche artiste créateur (titres uploadés, validés).
- **Titre Spotify** : ouvre la page du titre et lance la lecture Spotify.
- **Titre créateur** : ouvre la page du titre et lance la lecture du fichier audio Supabase (streaming).

Une seule lecture à la fois : lancer un titre Spotify arrête le titre Supabase en cours, et inversement.

---

## 5. Barre de lecture (en bas de l’écran)

Quand une musique est en cours (Spotify ou créateur) :

- Une **barre de lecture** apparaît au-dessus des onglets.
- Elle affiche :
  - **Pochette**
  - **Titre** et **artiste(s)**
  - **Bouton play / pause**
  - **Barre de progression** et temps (position / durée)

En appuyant sur cette barre, tu peux ouvrir l’écran détaillé du titre (modal ou page) pour voir plus d’infos et contrôler la lecture.

- **Spotify** : lecture gérée par le player Spotify (Web Playback SDK).
- **Créateur (Supabase)** : lecture gérée par le player audio de l’app (Expo AV). La barre se met à jour automatiquement avec le titre en cours.

---

## 6. Your Library (Bibliothèque)

Tu y retrouves ton contenu Spotify :

- **Playlists** : tes playlists.
- **Albums** : albums enregistrés.
- **Artistes** : artistes suivis.
- **Liked Songs** : titres likés.

En appuyant sur un élément, tu ouvres la page correspondante (playlist, album, artiste ou liste de titres likés) et tu peux lancer la lecture.

Les **artistes et titres créateurs** que tu découvres via la recherche sont accessibles depuis leurs fiches (artiste / titre) ; ils n’apparaissent pas dans une section dédiée « créateurs » de la bibliothèque dans cette version.

---

## 7. Lecture d’un titre (Spotify ou créateur)

### Page titre

- **Pochette**, **titre**, **artiste(s)**.
- **Bouton play / pause** (vert).
- **Actions** : ajouter à une playlist, partager, voir l’album, voir l’artiste (selon le type de contenu).

Pour un **titre Spotify** : la lecture démarre via Spotify.  
Pour un **titre créateur** : la lecture démarre via le player intégré (Supabase). La barre du bas se met à jour avec ce titre.

### Une seule lecture à la fois

- Si tu lances un **titre créateur** alors qu’un titre **Spotify** joue → Spotify est mis en pause et le titre créateur démarre.
- Si tu lances un **titre Spotify** alors qu’un titre **créateur** joue → le titre créateur s’arrête et Spotify démarre.

Tu ne peux pas avoir une musique Spotify et une musique créateur qui jouent en même temps.

---

## 8. Espace créateur (devenir artiste et publier des titres)

### Accéder à l’espace créateur

Depuis la navigation de l’app (menu ou écran dédié selon la structure), accède à l’**espace créateur** (par ex. **Creator** ou **Devenir créateur**).

### Devenir artiste (candidature)

1. Sur l’écran créateur, choisis l’option pour **devenir artiste** / **candidater**.
2. Remplis le formulaire :
   - **Nom d’artiste**
   - **Bio**
   - **Photo de profil** (upload)
3. Envoie la candidature. Ton statut est alors **« en attente »** (pending) jusqu’à validation par un admin.

Une fois ton **compte artiste validé**, tu peux uploader des titres.

### Uploader un titre

1. Dans l’espace créateur, va sur **Upload** (ou équivalent).
2. Renseigne :
   - **Titre** du morceau
   - **Cover** (image)
   - **Fichier audio** (MP3)
   - **Artiste(s)** associé(s) (toi-même et éventuellement d’autres artistes créateurs)
3. Envoie le titre. Il est enregistré avec le statut **« en attente »** (pending).

Après **validation par un admin**, le titre apparaît dans la **recherche** pour tous les utilisateurs (sous « Créateur »). Seuls les titres **validés** sont visibles et écoutables dans la recherche.

### Tableau de bord créateur

- Vue d’ensemble de ton **profil artiste**.
- Liste de **tes titres** avec leur statut :
  - Validés
  - En attente
  - Refusés
- Possibilité d’écouter tes titres (prévisualisation) depuis cet espace.

---

## 9. Profil et déconnexion

Depuis l’écran **Profil** (ou paramètres, selon l’app) :

- Tu peux voir tes infos Spotify.
- Une option **Se déconnecter** te permet de couper la session Spotify. À la prochaine ouverture, tu repasseras par l’écran de connexion.

---

## 10. Résumé des fonctionnalités

| Fonctionnalité              | Description                                      |
|----------------------------|--------------------------------------------------|
| Connexion Spotify          | OAuth depuis l’app, session conservée           |
| Recherche                  | Mélange Spotify + créateurs, tri par pertinence  |
| Lecture Spotify            | Via le player Spotify (Web Playback SDK)        |
| Lecture créateurs          | Via le player intégré ; barre du bas à jour     |
| Une seule lecture          | Spotify ou créateur, jamais les deux en parallèle|
| Bibliothèque               | Playlists, albums, artistes, titres likés       |
| Espace créateur            | Candidature artiste, upload de titres, statuts  |
| Barre de lecture           | Titre en cours, play/pause, progression          |

Pour l’installation et la configuration du projet, voir **INSTALLATION.md**.
