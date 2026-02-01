import 'react-native-url-polyfill/auto';
import { ThemeProvider } from '@shopify/restyle';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import SpotifyConnectDevice from '@/components/SpotifyConnectDevice';
import theme from '@/theme/theme';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
})

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
       <SpotifyConnectDevice  />
          <PersistQueryClientProvider
            client={queryClient} persistOptions={{ persister: asyncStoragePersister }}
          > 
        <QueryClientProvider client={ queryClient }>
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>

        <StatusBar style="light" />
      </PersistQueryClientProvider>    
    </ThemeProvider>
    
  );
}
