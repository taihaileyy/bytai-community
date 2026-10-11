import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DEMO_ACCOUNTS, type DemoRole } from '@/services/auth';
import { useActions } from '@/store/AppStore';
import { gutter, palette, radius } from '@/theme';
import { ToneProvider } from '@/theme/ToneContext';
import { PressScale } from '@/components/Motion';
import { Photo } from '@/components/Photo';
import { T } from '@/components/Text';
import { Avatar, Button, DemoBadge, Field, FocusStatusBar, IconButton, Notice, Row, Wordmark } from '@/components/ui';

const ROLES: { role: DemoRole; name: string; photo?: 'coffeeSmile' }[] = [
  { role: 'member', name: 'Taylor Reed', photo: 'coffeeSmile' },
  { role: 'admin', name: 'Avery Brooks' },
];

export default function SignIn() {
  const actions = useActions();
  const [role, setRole] = useState<DemoRole>('member');
  const [busy, setBusy] = useState(false);
  const account = DEMO_ACCOUNTS[role];

  const submit = async () => {
    setBusy(true);
    await actions.signIn(role);
    setBusy(false);
    if (router.canGoBack()) router.back();
    if (role === 'admin') router.push('/admin');
  };

  return (
    <ToneProvider tone="light">
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: palette.ivory }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FocusStatusBar style="light" />
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
          <Photo photo="streetcar" width={1200} scrim={0.95} style={{ height: 250 }}>
            <Row style={{ position: 'absolute', top: 14, left: gutter, right: gutter, justifyContent: 'space-between' }}>
              <DemoBadge onImage />
              <IconButton icon="close" tone="glass" label="Close" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
            </Row>
            <View style={{ position: 'absolute', left: gutter, bottom: 22 }}>
              <Wordmark />
              <T v="title1" c={palette.ivory} style={{ marginTop: 14 }} accessibilityRole="header">
                Welcome back
              </T>
              <T v="callout" c={palette.goldSoft}>
                Choose a sample account to explore.
              </T>
            </View>
          </Photo>

          <View style={{ paddingHorizontal: gutter, paddingTop: 22 }}>
            <View style={styles.accounts} accessibilityRole="radiogroup">
              {ROLES.map((r, i) => {
                const on = role === r.role;
                return (
                  <PressScale key={r.role} haptic scaleTo={0.985} onPress={() => setRole(r.role)} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`${r.name}, ${DEMO_ACCOUNTS[r.role].label}`}>
                    <Row gap={14} style={[{ paddingHorizontal: 16, paddingVertical: 14 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E3D8C6' }]}>
                      <Avatar name={r.name} size={44} photo={r.photo} />
                      <View style={{ flex: 1 }}>
                        <T v="title3">{r.name}</T>
                        <T v="caption" muted>
                          {DEMO_ACCOUNTS[r.role].label}
                        </T>
                      </View>
                      {on ? <Ionicons name="checkmark-circle" size={24} color={palette.purple} /> : <View style={styles.radio} />}
                    </Row>
                  </PressScale>
                );
              })}
            </View>
            <View style={{ marginTop: 22 }}>
              <Field label="Email" value={account.email} editable={false} />
              <Field label="Password" value="demo-password" secureTextEntry editable={false} hint="Prefilled for the demo. Never enter real credentials." />
            </View>
            <Button title={`Continue as ${role === 'admin' ? 'Admin' : 'Member'}`} variant="purple" iconRight="arrow-forward" loading={busy} onPress={submit} />
            <View style={{ marginTop: 16 }}>
              <Notice icon="shield-checkmark-outline">Demo sign-in. Nothing is created or sent anywhere. A production build would use secure sign-in such as Supabase Auth.</Notice>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ToneProvider>
  );
}

const styles = StyleSheet.create({
  accounts: { borderRadius: radius.lg, backgroundColor: palette.paper, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E3D8C6', overflow: 'hidden' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#CFC3AE' },
});
