import React from 'react';
import { View } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSession } from '@/store/AppStore';
import { color } from '@/theme';
import { Button, EmptyState, FocusStatusBar, NavBar } from '@/components/ui';

/** The admin console is gated to the demo admin account. */
export default function AdminLayout() {
  const { isAdmin } = useSession();
  if (isAdmin) return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg } }} />;
  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <FocusStatusBar style="dark" />
      <NavBar close />
      <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 80 }}>
        <EmptyState
          icon="lock-closed-outline"
          title="Admins only"
          body="Sign in with the demo admin account (Avery Brooks) to open the console."
          action="Sign in as admin"
          onAction={() => router.push('/sign-in')}
        />
        <Button title="Back to app" variant="tertiary" onPress={() => router.replace('/')} style={{ alignSelf: 'center' }} />
      </View>
    </View>
  );
}
