import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useActions, useSession } from '@/store/AppStore';
import { ToneProvider } from '@/theme/ToneContext';
import { confirmAction } from '@/utils/confirm';
import { T } from '@/components/Text';
import { Group, ListItem, Screen, Toggle } from '@/components/ui';

export default function Settings() {
  const { member } = useSession();
  const actions = useActions();
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  return (
    <ToneProvider tone="light">
      <Screen title="Settings" padded={false}>
        {member ? (
          <Group title="Account" style={{ marginTop: 8 }}>
            <ListItem icon="person-outline" title={member.name} subtitle={member.email} />
            <ListItem icon="location-outline" title="Neighborhood" value={member.neighborhood} />
          </Group>
        ) : null}
        <Group title="Notifications" style={{ marginTop: 22 }}>
          <View style={{ paddingHorizontal: 16 }}>
            <Toggle label="Push notifications" description="Event reminders and program updates" value={push} onChange={setPush} />
          </View>
          <View style={{ paddingHorizontal: 16 }}>
            <Toggle label="Email updates" description="Monthly impact newsletter" value={email} onChange={setEmail} />
          </View>
        </Group>
        <Group title="Demo" style={{ marginTop: 22 }}>
          <ListItem
            icon="refresh-outline"
            title="Reset demo data"
            subtitle="Restore the original sample data"
            onPress={() => confirmAction('Reset demo data?', 'All enrollments, registrations, gifts and admin changes from this session will be cleared.', actions.resetDemo, 'Reset')}
          />
          {member ? (
            <ListItem
              icon="log-out-outline"
              title="Sign out"
              destructive
              onPress={() => {
                actions.signOut();
                router.back();
              }}
            />
          ) : (
            <ListItem icon="log-in-outline" title="Sign in" onPress={() => router.push('/sign-in')} />
          )}
        </Group>
        <T v="caption" muted center style={{ marginTop: 28, paddingHorizontal: 40 }}>
          Settings here are for demonstration and are not saved to a server.
        </T>
      </Screen>
    </ToneProvider>
  );
}
