import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useActions, useMyActivity, useSession } from '@/store/AppStore';
import { palette } from '@/theme';
import { ToneProvider } from '@/theme/ToneContext';
import { relative } from '@/utils/format';
import { FadeIn, PressScale } from '@/components/Motion';
import { T } from '@/components/Text';
import { Button, Divider, EmptyState, Row, Screen, type IconName } from '@/components/ui';

export default function Notifications() {
  return (
    <ToneProvider tone="light">
      <Body />
    </ToneProvider>
  );
}

function Body() {
  const { signedIn } = useSession();
  const { notifications, unread } = useMyActivity();
  const actions = useActions();
  const sorted = [...notifications].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Screen title="Notifications" right={unread ? <Button title="Read all" variant="ghost" size="sm" onPress={actions.readAllNotifications} /> : null}>
      {!signedIn ? (
        <EmptyState icon="notifications-outline" title="Sign in for updates" body="News about your programs and events will show here." action="Sign in" onAction={() => router.push('/sign-in')} />
      ) : sorted.length ? (
        sorted.map((n, i) => (
          <FadeIn key={n.id} delay={Math.min(i, 6) * 40}>
            {i > 0 ? <Divider inset={56} /> : null}
            <PressScale
              scaleTo={0.985}
              onPress={() => {
                actions.readNotification(n.id);
                if (n.link) router.push(n.link as never);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${n.read ? '' : 'Unread. '}${n.title}. ${n.body}. ${relative(n.date)}`}
            >
              <Row gap={14} style={{ paddingVertical: 16, alignItems: 'flex-start' }}>
                <View style={[styles.icon, !n.read && { backgroundColor: palette.purple }]}>
                  <Ionicons name={n.icon as IconName} size={18} color={n.read ? palette.purple : palette.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Row gap={8} style={{ alignItems: 'flex-start' }}>
                    <T v={n.read ? 'bodyMedium' : 'title3'} style={{ flex: 1 }}>
                      {n.title}
                    </T>
                    <T v="caption" muted>
                      {relative(n.date)}
                    </T>
                  </Row>
                  <T v="callout" muted style={{ marginTop: 3 }}>
                    {n.body}
                  </T>
                </View>
                {!n.read ? <View style={styles.dot} /> : null}
              </Row>
            </PressScale>
          </FadeIn>
        ))
      ) : (
        <EmptyState icon="notifications-off-outline" title="All caught up" body="New updates will appear here." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.ivory2, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.gold, marginTop: 8 },
});
