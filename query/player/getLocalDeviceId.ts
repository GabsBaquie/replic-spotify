// query/player/getLocalDeviceId.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://api.spotify.com/v1';

/**
 * Tente de renvoyer l'ID du device Spotify Connect local :
 * 1) Si un device_id était déjà stocké et qu'il est toujours présent, on le renvoie.
 * 2) Sinon, on recherche dans la liste : « MonAppRN » → actif → Smartphone → premier → null.
 * 3) On stocke en AsyncStorage le nouvel ID choisi, ou on retourne null si aucun device.
 *
 * @returns {Promise<string | null>} L'ID du device, ou null si aucun device n'est disponible.
 */
export async function getLocalDeviceId(): Promise<string | null> {
  // 1) Récupérer le token Spotify
  const token = await AsyncStorage.getItem('spotify_access_token');
  if (!token) {
    throw new Error('Aucun token Spotify trouvé dans AsyncStorage.');
  }

  // 2) Lire l'ID précédemment stocké (le cas échéant)
  const storedDeviceId = await AsyncStorage.getItem('spotify_device_id');

  // 3) Récupérer la liste des appareils via l'API Web
  const response = await fetch(`${API_BASE}/me/player/devices`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Impossible de récupérer les appareils : ${err.error?.message || response.status}`
    );
  }

  const json = await response.json();
  const devices: { id: string; is_active: boolean; type: string; name: string }[] =
    Array.isArray(json.devices) ? json.devices : [];

  // 4) Si un device_id stocké existe encore dans la liste, on le renvoie
  if (storedDeviceId) {
    const stillHere = devices.find((d) => d.id === storedDeviceId);
    if (stillHere) {
      return storedDeviceId;
    }
    // Sinon on supprime la clé pour forcer la recherche d'un autre device
    await AsyncStorage.removeItem('spotify_device_id');
  }

  // 5) Sélection selon l'ordre souhaité : MonAppRN → actif → smartphone → premier
  const device =
    devices.find((d) => d.name === 'MonAppRN') ||
    devices.find((d) => d.is_active) ||
    devices.find((d) => d.type === 'Smartphone') ||
    devices[0];

  if (!device) {
    // Aucun device dans la liste : on renvoie null
    return null;
  }

  // 6) Stocker ce nouvel ID et le renvoyer
  await AsyncStorage.setItem('spotify_device_id', device.id);
  return device.id;
}