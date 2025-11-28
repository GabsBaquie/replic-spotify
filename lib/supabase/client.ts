import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKeyRaw =
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabaseAnonKey = supabaseAnonKeyRaw?.trim().replace(/\s/g, "");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL ou clé anonyme manquante. Définis EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_KEY (ou EXPO_PUBLIC_SUPABASE_ANON_KEY) dans ton .env"
  );
}

if (supabaseAnonKey.length < 100) {
  console.warn(
    `⚠️  Clé Supabase suspecte (longueur: ${supabaseAnonKey.length}). Une clé valide fait généralement 200-300 caractères. Vérifie EXPO_PUBLIC_SUPABASE_KEY dans ton .env`
  );
  console.warn(
    `Premiers caractères de la clé: ${supabaseAnonKey.substring(0, 20)}...`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});

export { supabaseUrl, supabaseAnonKey };
