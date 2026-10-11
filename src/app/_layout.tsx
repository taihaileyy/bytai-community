import React, { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, PlayfairDisplay_400Regular, PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { GreatVibes_400Regular } from '@expo-google-fonts/great-vibes';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { AppStoreProvider, useStore } from '@/store/AppStore';
import { palette } from '@/theme';
import { ToneProvider } from '@/theme/ToneContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootStack() {
  const { ready } = useStore();
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    GreatVibes_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const loaded = fontsLoaded && ready;
  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);
  if (!loaded) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.midnight }, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="program/[id]" />
        <Stack.Screen name="event/[id]" />
        <Stack.Screen name="map" />
        <Stack.Screen name="impact" />
        <Stack.Screen name="my-programs" />
        <Stack.Screen name="my-events" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="announcements" />
        <Stack.Screen name="donations" />
        <Stack.Screen name="sign-in" options={{ presentation: 'modal' }} />
        <Stack.Screen name="checkout" options={{ presentation: 'modal' }} />
        <Stack.Screen name="confirm" options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="admin" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppStoreProvider>
      <ToneProvider tone="light">
        <RootStack />
      </ToneProvider>
    </AppStoreProvider>
  );
}
