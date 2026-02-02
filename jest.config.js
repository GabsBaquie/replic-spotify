// jest.config.js - Configuration Jest pour partie Creator/Supabase uniquement

module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "node",

  // Transformation des fichiers
  transform: {
    "^.+\\.(js|ts)$": ["babel-jest", { configFile: "./babel.config.js" }],
  },

  // Patterns de transformation
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@supabase|@react-native-async-storage|react-native-url-polyfill)/)",
  ],

  // Extensions de fichiers
  moduleFileExtensions: ["ts", "js", "json"],

  // Alias de modules
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // ⭐ COLLECTE DE COUVERTURE - UNIQUEMENT CREATOR/SUPABASE ⭐
  collectCoverageFrom: [
    // Services Supabase (priorité absolue)
    "lib/supabase/**/*.{ts,tsx}",

    // Hooks Creator
    "hooks/ArtistCreator/**/*.{ts,tsx}",

    // Exclusions
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.expo/**",
    "!**/coverage/**",
    "!lib/supabase/index.ts", // Fichier d'exports seulement
    "!lib/supabase/types.ts", // Types seulement (optionnel de tester)
  ],

  // Seuils de couverture - 30% minimum requis
  coverageThreshold: {
    global: {
      statements: 30,
      branches: 30,
      functions: 30,
      lines: 30,
    },
  },

  testMatch: [
    // Tests des services Supabase
    "<rootDir>/lib/supabase/__tests__/**/*.(test|spec).[jt]s?(x)",

    // Tests des hooks Creator
    "<rootDir>/hooks/ArtistCreator/__tests__/**/*.(test|spec).[jt]s?(x)",
  ],

  // Ignorer certains dossiers dans les tests
  testPathIgnorePatterns: ["/node_modules/", "/.expo/", "/android/", "/ios/"],

  // Timeout global
  testTimeout: 10000,

  // Reporter de couverture
  coverageReporters: ["text", "lcov", "html"],

  // Verbose pour voir les détails
  verbose: true,
};
