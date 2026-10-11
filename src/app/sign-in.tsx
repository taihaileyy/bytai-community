import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DEMO_ACCOUNTS, type DemoRole } from '@/services/auth';
import { useActions } from '@/store/AppStore';
import { palette, radius, space } from '@/theme';
import { PressScale } from '@/components/Motion';
import { Txt } from '@/components/Txt';
import { AppHeader, Button, DemoNotice, Field, FocusStatusBar, Row, Screen, type IconName } from '@/components/ui';

const ROLES: { role: DemoRole; icon: IconName; name: string }[] = [
  { role: 'member', icon: 'person', name: 'Jordan Ellis' },
  { role: 'admin', icon: 'shield-checkmark', name: 'Avery Brooks' },
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen header={<AppHeader close />}>
        <FocusStatusBar style="dark" />
        <View style={styles.logo}>
          <Txt variant="title" color={palette.cream}>
            Rb
          </Txt>
        </View>
        <Txt variant="eyebrow" accent center style={{ marginTop: 18 }}>
          Member portal
        </Txt>
        <Txt variant="display" center style={{ marginTop: 8 }}>
          Welcome back
        </Txt>
        <Txt variant="body" muted center style={{ marginTop: 6, marginBottom: 24 }}>
          Choose a sample account to explore the demo.
        </Txt>

        <Row gap={10} style={{ marginBottom: 20 }}>
          {ROLES.map((r) => {
            const on = role === r.role;
            return (
              <PressScale key={r.role} haptic onPress={() => setRole(r.role)} style={[styles.role, on && styles.roleOn]} accessibilityRole="radio" accessibilityState={{ checked: on }}>
                <Ionicons name={r.icon} size={22} color={on ? palette.cream : palette.green} />
                <Txt variant="label" color={on ? palette.cream : palette.ink} style={{ marginTop: 10 }}>
                  {r.name}
                </Txt>
                <Txt variant="caption" color={on ? 'rgba(241,238,228,0.7)' : palette.stone} numberOfLines={1}>
                  {DEMO_ACCOUNTS[r.role].label}
                </Txt>
              </PressScale>
            );
          })}
        </Row>

        <Field label="Email" value={account.email} editable={false} />
        <Field label="Password" value="demo-password" secureTextEntry editable={false} hint="Prefilled for the demo. Never enter real credentials." />

        <Button title={`Sign in as ${role === 'admin' ? 'admin' : 'member'}`} icon="arrow-forward" loading={busy} onPress={submit} style={{ marginTop: 4 }} />
        <View style={{ marginTop: 16 }}>
          <DemoNotice>
            Demo sign-in. No account is created and nothing is sent anywhere. Production builds would use secure
            sign-in (e.g. Supabase Auth with email links).
          </DemoNotice>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
    marginTop: 8,
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: palette.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  role: {
    flex: 1,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: palette.line,
    backgroundColor: palette.card,
  },
  roleOn: { backgroundColor: palette.ink, borderColor: palette.ink },
});
