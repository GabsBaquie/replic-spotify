# Guide d’installation – Replic Spotify

Ce guide décrit les **installations nécessaires** (Mac, Android, simulateurs) et comment **installer et lancer** le projet Replic Spotify en local.

---

## Fichier `.env` pour tester l’app (enseignants / évaluation)

Le fichier **`.env`** contient les clés API (Spotify, Supabase) et **n’est pas versionné** pour des raisons de sécurité. Il est **transmis séparément** à l’enseignant(e) (mail, plateforme, lien sécurisé, etc.) afin de pouvoir lancer l’application sans créer de comptes développeur.

**Pour tester l’app :**

1. Récupérer le fichier **`.env`** fourni.
2. Le placer **à la racine du projet** (même niveau que `package.json`).
3. Ne pas le modifier sauf besoin (même structure que décrite plus bas).
4. Après toute modification du `.env`, relancer avec : `npx expo start -c`.

Sans ce fichier, l’app affichera des erreurs du type « Token Spotify manquant » ou « Supabase URL ou clé manquante ».

---

## Installations nécessaires

### Sur Mac (pour développer et lancer sur iOS / Android)

#### 1. Node.js et npm

- **Node.js** : version **18 LTS** ou plus récente.
- Téléchargement : [nodejs.org](https://nodejs.org/) (version LTS).
- Vérification après installation :
  ```bash
  node -v   # ex. v20.x.x
  npm -v    # ex. 10.x.x
  ```

#### 2. Xcode et simulateur iOS (pour iOS)

- **Xcode** : installé depuis l’App Store (gratuit, plusieurs Go).
- Après installation, ouvrir Xcode une fois et accepter la licence.
- **Simulateur iOS** : inclus avec Xcode.  
  - Lancer : **Xcode → Open Developer Tool → Simulator**  
  - Ou depuis le terminal après `npx expo start` : appuyer sur **i** pour ouvrir l’app dans le simulateur.
- **Outils en ligne de commande** :  
  - Xcode → **Settings → Locations** : vérifier que **Command Line Tools** est bien sélectionné (version Xcode installée).

#### 3. Watchman (optionnel mais recommandé sur Mac)

- Améliore les performances du file watcher (rechargement à chaud).
- Installation avec Homebrew :
  ```bash
  brew install watchman
  ```

#### 4. Android Studio et émulateur Android (pour Android)

- **Android Studio** : [developer.android.com/studio](https://developer.android.com/studio).
- Lors de l’installation, cocher :
  - **Android SDK**
  - **Android SDK Platform**
  - **Android Virtual Device (AVD)**
- Après installation :
  1. Ouvrir **Android Studio**.
  2. **More Actions → Virtual Device Manager** (ou **Tools → Device Manager**).
  3. Créer un **AVD** (ex. Pixel 6, API 34).
  4. Vérifier que la variable d’environnement **ANDROID_HOME** est définie (voir ci-dessous).

**Variables d’environnement Android (Mac / Linux)**  
À ajouter dans `~/.zshrc` ou `~/.bash_profile` :

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Puis : `source ~/.zshrc` (ou `source ~/.bash_profile`).

---

### Sur Windows (pour Android uniquement ; iOS nécessite un Mac)

- **Node.js** : idem, v18+ depuis [nodejs.org](https://nodejs.org/).
- **Android Studio** : idem, télécharger depuis le site officiel, installer le SDK et créer un AVD.
- **ANDROID_HOME** :  
  - Variable d’environnement système : `ANDROID_HOME` = `C:\Users\<user>\AppData\Local\Android\Sdk`  
  - Ajouter `%ANDROID_HOME%\platform-tools` et `%ANDROID_HOME%\emulator` au **PATH**.

---

## Résumé des prérequis par plateforme

| Outil / environnement | Mac (iOS) | Mac (Android) | Windows (Android) |
|-----------------------|-----------|----------------|--------------------|
| Node.js 18+            | ✅        | ✅             | ✅                 |
| npm                    | ✅        | ✅             | ✅                 |
| Xcode + simulateur iOS | ✅        | —              | —                  |
| Android Studio + AVD   | Optionnel | ✅             | ✅                 |
| Watchman               | Recommandé| Recommandé     | —                  |

---

## 1. Cloner le projet

```bash
git clone <url-du-repo>
cd replic-spotify
```

---

## 2. Installer les dépendances du projet

```bash
npm install
```

---

## 3. Fichier `.env` (variables d’environnement)

Le fichier **`.env`** doit être à la **racine du projet** (à côté de `package.json`).  
Pour l’évaluation, il est **fourni séparément** (voir en tête de ce guide).  
Si tu configures toi-même les clés (développement perso), utilise la structure suivante.

### Variables requises

```env
# Spotify (Dashboard : developer.spotify.com/dashboard)
EXPO_PUBLIC_SPOTIFY_CLIENT_ID=ton_client_id_spotify
EXPO_PUBLIC_SPOTIFY_REDIRECT_URI=replicspotify://callback

# Supabase (Settings → API sur ton projet Supabase)
EXPO_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=ta_cle_anon_publique
```

- **Spotify** : Redirect URI à ajouter dans le Dashboard Spotify (Redirect URIs) : `replicspotify://callback`.
- **Supabase** : utiliser la clé **anon public**, pas la `service_role`.
- Ne jamais commiter le fichier `.env` (il doit rester dans `.gitignore`).

---

## 4. Lancer l’application

### Démarrer le serveur Expo

```bash
npx expo start
```

Ou :

```bash
npm start
```

### Ouvrir sur un appareil / simulateur

- **iOS (Mac)** :  
  - Lancer le **simulateur iOS** (Xcode → Open Developer Tool → Simulator), puis dans le terminal Expo appuyer sur **i**  
  - Ou avoir un iPhone avec **Expo Go** et scanner le QR code
- **Android** :  
  - Lancer un **AVD** depuis Android Studio (Device Manager), puis dans le terminal Expo appuyer sur **a**  
  - Ou avoir un Android avec **Expo Go** et scanner le QR code
- **Web** : `npx expo start --web` ou option **w** dans le menu Expo

### Build natif (optionnel)

```bash
# iOS (Mac uniquement, Xcode requis)
npx expo run:ios

# Android
npx expo run:android
```

### Après modification du `.env`

Les variables `EXPO_PUBLIC_*` sont lues au démarrage. Après toute modification du `.env` :

```bash
npx expo start -c
```

L’option `-c` vide le cache pour prendre en compte les nouvelles variables.

---

## 5. Dépannage

### « No access token » / « Token Spotify manquant »

- Vérifier que le fichier `.env` est bien à la racine et contient `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` et `EXPO_PUBLIC_SPOTIFY_REDIRECT_URI`.
- Se connecter à Spotify depuis l’écran de connexion de l’app.
- Vérifier que l’URI `replicspotify://callback` est bien ajoutée dans le Dashboard Spotify (Redirect URIs).

### « Supabase URL ou clé manquante »

- Vérifier `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_KEY` dans `.env`.
- Redémarrer avec `npx expo start -c`.

### « Network request failed » (Supabase / API)

- Sur **simulateur iOS**, les requêtes réseau peuvent échouer : tester sur un **appareil réel** ou redémarrer le simulateur.
- Vérifier la connexion internet, VPN, pare-feu.
- Vérifier que l’URL Supabase est en **https**.

### « Aucun player Spotify local »

- La lecture Spotify utilise le Web Playback SDK (WebView). S’assurer d’être connecté avec un compte Spotify (Premium si requis par l’app).
- Vérifier que l’écran de connexion au player / Spotify Connect a bien été franchi dans l’app.

### Android : `ANDROID_HOME` non défini

- Vérifier les variables d’environnement (voir section « Installations nécessaires »).
- Sur Mac : `echo $ANDROID_HOME` doit afficher le chemin du SDK.

### Lint

```bash
npm run lint
```

---

## 6. Builder l’app avec EAS (Expo)

Pour générer des **builds installables** (APK / AAB pour Android, IPA pour iOS), utilise **EAS Build** (Expo Application Services).

### Prérequis

- Compte **Expo** : [expo.dev](https://expo.dev) (gratuit).
- Projet déjà lié à EAS (le `projectId` dans `app.json` indique que c’est le cas).

### Connexion et variables d’environnement

1. Se connecter à EAS :
   ```bash
   npx eas login
   ```

2. **Variables d’environnement pour le build** : les variables `EXPO_PUBLIC_*` du `.env` doivent être disponibles pendant le build. Deux options :
   - **EAS Secrets** (recommandé pour production) : les définir une fois, elles seront injectées à chaque build.
     ```bash
     npx eas secret:create --name EXPO_PUBLIC_SPOTIFY_CLIENT_ID --value "ton_client_id" --type string
     npx eas secret:create --name EXPO_PUBLIC_SPOTIFY_REDIRECT_URI --value "replicspotify://callback" --type string
     npx eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://ton-projet.supabase.co" --type string
     npx eas secret:create --name EXPO_PUBLIC_SUPABASE_KEY --value "ta_cle_anon" --type string
     ```
   - **Fichier `eas.json`** : ajouter un champ `env` dans le profil de build (ex. `production`) avec les mêmes variables. Moins sécurisé si le repo est public.

### Lancer un build

```bash
# Android (APK/AAB)
npm run build:android
# ou
npx eas build --platform android --profile production

# iOS (nécessite un compte Apple Developer pour distribution)
npm run build:ios
# ou
npx eas build --platform ios --profile production

# Les deux plateformes
npm run build:all
# ou
npx eas build --platform all --profile production
```

- Le build s’exécute sur les **serveurs Expo** (pas besoin de Xcode/Android Studio sur ta machine).
- À la fin, un **lien de téléchargement** est fourni (APK pour Android ; pour iOS, téléchargement possible si le profil est configuré pour une distribution interne ou ad hoc).

### Profils de build (`eas.json`)

- **production** : build pour mise en store ou distribution finale (par défaut dans les scripts).
- **preview** : build interne (ex. testeurs), distribution « internal ».
- **development** : build avec client de développement (Expo Dev Client).

Pour un build de démo ou pour la prof, **preview** suffit souvent :

```bash
npx eas build --platform android --profile preview
```

---

## 7. Commandes utiles

| Commande                 | Description                          |
|--------------------------|--------------------------------------|
| `npm install`            | Installer les dépendances            |
| `npm start`              | Démarrer Expo en mode développement  |
| `npx expo start -c`      | Démarrer en vidant le cache           |
| `npx expo run:ios`       | Lancer en build natif iOS             |
| `npx expo run:android`   | Lancer en build natif Android        |
| `npm run build:ios`      | Build EAS iOS (production)           |
| `npm run build:android`  | Build EAS Android (production)       |
| `npm run build:all`      | Build EAS iOS + Android              |
| `npm run lint`           | Lancer le linter                     |

---

Une fois l’installation et le `.env` en place, l’app peut être lancée et testée. Pour l’utilisation au quotidien, voir **[GUIDE_UTILISATEUR.md](./GUIDE_UTILISATEUR.md)**.
