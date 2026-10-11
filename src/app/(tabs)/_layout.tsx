import React from 'react';
import { Platform, StyleSheet, type ColorValue } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';
import { Ionicons } from '@expo/vector-icons';
import { fonts, palette } from '@/theme';
import { useMyActivity } from '@/store/AppStore';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const tab = (title: string, icon: IconName, iconActive: IconName) => ({
  title,
  tabBarIcon: ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Ionicons name={focused ? iconActive : icon} size={23} color={color as string} />
  ),
});

export default function TabsLayout() {
  const { unread } = useMyActivity();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.green,
        tabBarInactiveTintColor: palette.stoneLight,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: palette.card,
          borderTopColor: palette.line,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        },
        sceneStyle: { backgroundColor: palette.paper },
      }}
    >
      <Tabs.Screen name="index" options={tab('Home', 'home-outline', 'home')} />
      <Tabs.Screen name="programs" options={tab('Programs', 'grid-outline', 'grid')} />
      <Tabs.Screen name="events" options={tab('Events', 'calendar-outline', 'calendar')} />
      <Tabs.Screen name="give" options={tab('Give', 'heart-outline', 'heart')} />
      <Tabs.Screen
        name="account"
        options={{
          ...tab('Me', 'person-circle-outline', 'person-circle'),
          tabBarBadge: unread || undefined,
          tabBarBadgeStyle: { backgroundColor: palette.clay, fontFamily: fonts.semibold, fontSize: 10 },
        }}
      />
    </Tabs>
  );
}
