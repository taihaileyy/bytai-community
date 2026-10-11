import React from 'react';
import { View } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSession } from '@/store/AppStore';
import { palette } from '@/theme';
import { ToneProvider } from '@/theme/ToneContext';
import { Button, EmptyState, FocusStatusBar, NavBar, Wordmark } from '@/components/ui';

/** Admin console, gated to the demo admin account. */
export default function AdminLayout() {
  const { isAdmin } = useSession();
  if (isAdmin) return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.midnight } }} />;
  return (
    <ToneProvider tone="dark">
      <View style={{ flex: 1, backgroundColor: palette.midnight }}>
        <FocusStatusBar style="light" />
        <NavBar close />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 }}>
          <Wordmark />
          <EmptyState icon="lock-closed-outline" title="Admins only" body="Sign in with the demo admin account (Avery Brooks) to open the dashboard." action="Sign in as admin" onAction={() => router.push('/sign-in')} />
          <Button title="Back to app" variant="ghost" onPress={() => router.replace('/')} />
        </View>
      </View>
    </ToneProvider>
  );
}
