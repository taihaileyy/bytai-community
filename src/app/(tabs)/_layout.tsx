import React from 'react';
import { Tabs } from 'expo-router/js-tabs';
import { TabBar } from '@/components/TabBar';
import { useMyActivity } from '@/store/AppStore';
import { color } from '@/theme';

export default function TabsLayout() {
  const { unread } = useMyActivity();
  return (
    <Tabs
      tabBar={(props) => <TabBar {...(props as unknown as React.ComponentProps<typeof TabBar>)} badges={{ account: unread }} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.bg } }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="programs" options={{ title: 'Programs' }} />
      <Tabs.Screen name="events" options={{ title: 'Events' }} />
      <Tabs.Screen name="give" options={{ title: 'Give' }} />
      <Tabs.Screen name="account" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
