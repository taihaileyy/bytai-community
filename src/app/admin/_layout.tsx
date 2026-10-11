import React from 'react';
import { View } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '@/store/AppStore';
import { dark, palette } from '@/theme';
import { SchemeProvider } from '@/theme/SchemeContext';
import { Txt } from '@/components/Txt';
import { Button, EmptyState, FocusStatusBar } from '@/components/ui';

/** The admin console uses the dark builtbyTAI scheme and is gated to admin accounts. */
export default function AdminLayout() {
  const { isAdmin } = useSession();
  const insets = useSafeAreaInsets();

  return (
    <SchemeProvider value={dark}>
      {isAdmin ? (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.night } }} />
      ) : (
        <View style={{ flex: 1, backgroundColor: palette.night, paddingTop: insets.top + 80, paddingHorizontal: 24 }}>
          <FocusStatusBar style="light" />
          <EmptyState
            icon="lock-closed-outline"
            title="Admins only"
            body="Sign in with the demo admin account (Avery Brooks) to open the console."
            action="Sign in as admin"
            onAction={() => router.push('/sign-in')}
          />
          <Button title="Back to app" variant="ghost" onPress={() => router.replace('/')} />
          <Txt variant="caption" muted center style={{ marginTop: 20 }}>
            ByTAI Demo · Admin console
          </Txt>
        </View>
      )}
    </SchemeProvider>
  );
}
