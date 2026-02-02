// jest.setup.js - Configuration et mocks pour les tests Creator/Supabase

import { jest } from "@jest/globals";
import "@testing-library/jest-native/extend-expect";

// ============================================
// MOCKS GLOBAUX POUR SUPABASE
// ============================================

// Mock du client Supabase
jest.mock("./lib/supabase/client", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
    })),
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        getPublicUrl: jest.fn(),
        createSignedUrl: jest.fn(),
        remove: jest.fn(),
      })),
    },
  },
  supabaseUrl: "https://test.supabase.co",
  supabaseAnonKey: "test-anon-key",
}));

// ============================================
// MOCKS POUR REACT NATIVE / EXPO
// ============================================

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock Expo modules nécessaires
jest.mock("expo-font", () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

jest.mock("expo-asset", () => ({
  Asset: {
    loadAsync: jest.fn(() => Promise.resolve()),
    fromModule: jest.fn(() => ({
      downloadAsync: jest.fn(() => Promise.resolve()),
    })),
  },
}));

// Mock Expo AV (pour le player audio)
jest.mock("expo-av", () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() =>
        Promise.resolve({
          sound: {
            playAsync: jest.fn(),
            pauseAsync: jest.fn(),
            stopAsync: jest.fn(),
            setPositionAsync: jest.fn(),
            getStatusAsync: jest.fn(() =>
              Promise.resolve({
                isLoaded: true,
                isPlaying: false,
                positionMillis: 0,
                durationMillis: 180000,
              }),
            ),
            unloadAsync: jest.fn(),
          },
          status: {},
        }),
      ),
    },
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
  },
}));

// Mock Expo File System
jest.mock("expo-file-system", () => ({
  downloadAsync: jest.fn(() => Promise.resolve({ uri: "file://test.mp3" })),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true })),
  deleteAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve("")),
}));

// Mock Expo Document Picker (pour upload de fichiers)
jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn(() =>
    Promise.resolve({
      type: "success",
      uri: "file://test.mp3",
      name: "test.mp3",
      size: 1024,
    }),
  ),
}));

// Mock Expo Image Picker (pour upload d'images)
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" }),
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      cancelled: false,
      assets: [
        {
          uri: "file://test.jpg",
          width: 1000,
          height: 1000,
        },
      ],
    }),
  ),
}));

// ============================================
// MOCKS POUR REACT NAVIGATION
// ============================================

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  })),
  useRoute: jest.fn(() => ({
    params: {},
    key: "test-route",
  })),
  useFocusEffect: jest.fn(),
}));

// ============================================
// CONFIGURATION GLOBALE
// ============================================

// Timeout global pour les tests async
jest.setTimeout(10000);

// Supprimer les warnings console pendant les tests
global.console = {
  ...console,
  warn: jest.fn(), // Masquer les warnings
  error: jest.fn(), // Masquer les erreurs (sauf si on veut les voir)
};

// Variables d'environnement pour les tests
process.env.EXPO_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.EXPO_PUBLIC_SUPABASE_KEY = "test-anon-key";
