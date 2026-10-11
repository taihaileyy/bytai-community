import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useActions, useMyActivity, useSession } from '@/store/AppStore';
import { palette, radius, space } from '@/theme';
import { relative } from '@/utils/format';
import { FadeIn, PressScale } from '@/components/Motion';
import { Txt } from '@/components/Txt';
import { AppHeader, Button, EmptyState, FocusStatusBar, Row, Screen, type IconName } from '@/components/ui';

export default function Notifications() {
  const { signedIn } = useSession();
  const { notifications, unread } = useMyActivity();
  const actions = useActions();
  const sorted = [...notifications].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Screen
      header={
        <AppHeader
          title="Notifications"
          right={unread ? <Button title="Mark all read" variant="ghost" size="sm" onPress={actions.readAllNotifications} /> : null}
        />
      }
    >
      <FocusStatusBar style="dark" />
      {!signedIn ? (
        <EmptyState icon="notifications-outline" title="Sign in for updates" body="Notifications about your programs and events will show here." action="Sign in" onAction={() => router.push('/sign-in')} />
      ) : sorted.length ? (
        sorted.map((n, i) => (
          <FadeIn key={n.id} delay={i * 40}>
            <PressScale
              onPress={() => {
                actions.readNotification(n.id);
                if (n.link) router.push(n.link as never);
              }}
              style={[styles.item, !n.read && styles.unread]}
              accessibilityRole="button"
            >
              <View style={[styles.icon, { backgroundColor: n.read ? palette.paper2 : palette.mintSoft }]}>
                <Ionicons name={n.icon as IconName} size={20} color={n.read ? palette.stone : palette.green} />
              </View>
              <View style={{ flex: 1 }}>
                <Row style={{ justifyContent: 'space-between' }} gap={8}>
                  <Txt variant="bodyStrong" style={{ flex: 1 }} numberOfLines={2}>
                    {n.title}
                  </Txt>
                  {!n.read ? <View style={styles.dot} /> : null}
                </Row>
                <Txt variant="caption" muted style={{ marginTop: 3 }}>
                  {n.body}
                </Txt>
                <Txt variant="caption" accent style={{ marginTop: 6, fontSize: 11.5 }}>
                  {relative(n.date)}
                </Txt>
              </View>
            </PressScale>
          </FadeIn>
        ))
      ) : (
        <EmptyState icon="notifications-off-outline" title="No notifications" body="You're all caught up." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    gap: 14,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: palette.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.line,
    marginBottom: 10,
  },
  unread: { borderColor: palette.mint, backgroundColor: '#FBFDFB' },
  icon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: palette.clay, marginTop: 6 },
});
