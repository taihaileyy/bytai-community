import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DEMO_ACCOUNTS, type DemoRole } from '@/services/auth';
import { useActions } from '@/store/AppStore';
import { color, gutter, radius } from '@/theme';
import { PressScale } from '@/components/Motion';
import { Photo } from '@/components/Photo';
import { T } from '@/components/Text';
import { Avatar, Button, DemoBadge, Field, FocusStatusBar, IconButton, Notice, Row } from '@/components/ui';

const ROLES: { role: DemoRole; name: string }[] = [
  { role: 'member', name: 'Jordan Ellis' },
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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: color.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FocusStatusBar style="light" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
        <Photo photo="bonfireCircle" width={1200} scrim={0.85} style={{ height: 240 }}>
          <Row style={{ position: 'absolute', top: 14, left: gutter, right: gutter, justifyContent: 'space-between' }}>
            <DemoBadge onImage />
            <IconButton icon="close" tone="glass" label="Close" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
          </Row>
          <View style={{ position: 'absolute', left: gutter, bottom: 22 }}>
            <T v="title1" c={color.white} accessibilityRole="header">
              Welcome back
            </T>
            <T v="callout" c="rgba(255,255,255,0.82)">
              Choose a sample account to explore.
            </T>
          </View>
        </Photo>

        <View style={{ paddingHorizontal: gutter, paddingTop: 22 }}>
          <View style={styles.accounts} accessibilityRole="radiogroup">
            {ROLES.map((r, i) => {
              const on = role === r.role;
              return (
                <PressScale
                  key={r.role}
                  haptic
                  scaleTo={0.985}
                  onPress={() => setRole(r.role)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={`${r.name}, ${DEMO_ACCOUNTS[r.role].label}`}
                >
                  <Row gap={14} style={[styles.account, i > 0 && styles.accountBorder]}>
                    <Avatar name={r.name} size={42} tone={on ? 'dark' : 'neutral'} />
                    <View style={{ flex: 1 }}>
                      <T v="headline">{r.name}</T>
                      <T v="caption" muted>
                        {DEMO_ACCOUNTS[r.role].label}
                      </T>
                    </View>
                    {on ? <Ionicons name="checkmark-circle" size={22} color={color.accent} /> : <View style={styles.radio} />}
                  </Row>
                </PressScale>
              );
            })}
          </View>

          <View style={{ marginTop: 22 }}>
            <Field label="Email" value={account.email} editable={false} />
            <Field label="Password" value="demo-password" secureTextEntry editable={false} hint="Prefilled for the demo. Never enter real credentials." />
          </View>

          <Button title={`Continue as ${role === 'admin' ? 'admin' : 'member'}`} loading={busy} onPress={submit} />
          <View style={{ marginTop: 16 }}>
            <Notice icon="flask-outline">
              Demo sign-in. Nothing is created or sent anywhere. A production build would use secure sign-in such as Supabase Auth.
            </Notice>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  accounts: { borderRadius: radius.lg, backgroundColor: color.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: color.line, overflow: 'hidden' },
  account: { paddingHorizontal: 16, paddingVertical: 14 },
  accountBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.line },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: color.lineStrong },
});
