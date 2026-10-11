import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActions, useMyActivity, useSession, useStore } from '@/store/AppStore';
import { getCategoryColor, palette, radius, space } from '@/theme';
import { shortDate } from '@/utils/format';
import { confirmAction } from '@/utils/confirm';
import { FadeIn, GrowBar } from '@/components/Motion';
import { Txt } from '@/components/Txt';
import { Button, Card, EmptyState, FocusStatusBar, IconButton, Row, Screen, Tag, type IconName } from '@/components/ui';

export default function ProgramDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const { signedIn } = useSession();
  const { isEnrolled } = useMyActivity();
  const actions = useActions();
  const program = state.programs.find((p) => p.id === id);

  if (!program)
    return (
      <Screen>
        <View style={{ paddingTop: insets.top + 60 }}>
          <EmptyState icon="alert-circle-outline" title="Program not found" body="It may have been removed." action="Back to programs" onAction={() => router.replace('/programs')} />
        </View>
      </Screen>
    );

  const c = getCategoryColor(program.category);
  const enrollment = isEnrolled(program.id);
  const full = program.enrolled >= program.capacity;
  const fill = program.enrolled / program.capacity;

  const enroll = () => {
    if (!signedIn) return router.push('/sign-in');
    const status = actions.enroll(program.id);
    router.push({
      pathname: '/confirm',
      params: {
        kind: 'program',
        title: status === 'active' ? "You're enrolled!" : "You're on the waitlist",
        subtitle: program.title,
        detail: `${program.schedule}\n${program.location}`,
        code: `ENR-${program.id.slice(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 8999)}`,
        note: `${program.lead} will reach out with everything you need before your first session.`,
      },
    });
  };

  const leave = () =>
    confirmAction('Leave this program?', `You'll lose your spot in ${program.title}.`, () => actions.unenroll(program.id), 'Leave');

  const facts: { icon: IconName; label: string; value: string }[] = [
    { icon: 'calendar-clear-outline', label: 'Schedule', value: program.schedule },
    { icon: 'location-outline', label: 'Where', value: program.location },
    { icon: 'people-outline', label: 'Who', value: program.ageGroup },
    { icon: 'person-circle-outline', label: 'Program lead', value: program.lead },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: palette.paper }}>
      <FocusStatusBar style="light" />
      <Screen padded={false} bottomInset={false} contentStyle={{ paddingBottom: 140 }}>
        <LinearGradient colors={[palette.night, palette.greenDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: insets.top + 8 }]}>
          <Row style={{ justifyContent: 'space-between' }}>
            <IconButton icon="chevron-back" tone="inverse" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/programs'))} />
            <Tag label={program.category} fg={palette.cream} bg="rgba(241,238,228,0.14)" />
          </Row>
          <FadeIn delay={40}>
            <View style={styles.heroIcon}>
              <Ionicons name={program.icon as IconName} size={30} color={palette.night} />
            </View>
            <Txt variant="hero" color={palette.cream} style={{ marginTop: 18 }}>
              {program.title}
            </Txt>
            <Txt variant="body" color="rgba(241,238,228,0.8)" style={{ marginTop: 10 }}>
              {program.summary}
            </Txt>
          </FadeIn>
        </LinearGradient>

        <View style={{ paddingHorizontal: space.xl }}>
          <FadeIn delay={120}>
            <Card style={{ marginTop: -28 }}>
              {facts.map((f, i) => (
                <Row key={f.label} gap={14} style={[styles.fact, i < facts.length - 1 && styles.factBorder]}>
                  <Ionicons name={f.icon} size={20} color={c.fg} />
                  <View style={{ flex: 1 }}>
                    <Txt variant="caption" muted>
                      {f.label}
                    </Txt>
                    <Txt variant="bodyStrong">{f.value}</Txt>
                  </View>
                </Row>
              ))}
            </Card>
          </FadeIn>

          {enrollment ? (
            <FadeIn>
              <View style={styles.enrolledBanner}>
                <Ionicons name="checkmark-circle" size={22} color={palette.green} />
                <View style={{ flex: 1 }}>
                  <Txt variant="bodyStrong" color={palette.greenDeep}>
                    {enrollment.status === 'active' ? "You're enrolled" : "You're on the waitlist"}
                  </Txt>
                  <Txt variant="caption" color={palette.green}>
                    Since {shortDate(enrollment.date)}
                  </Txt>
                </View>
              </View>
            </FadeIn>
          ) : null}

          <Txt variant="title" style={{ marginTop: 28, marginBottom: 10 }}>
            About this program
          </Txt>
          <Txt variant="body" muted>
            {program.description}
          </Txt>

          <Txt variant="title" style={{ marginTop: 28, marginBottom: 12 }}>
            What you'll get
          </Txt>
          {program.outcomes.map((o) => (
            <Row key={o} gap={12} style={{ marginBottom: 12 }}>
              <View style={[styles.check, { backgroundColor: c.bg }]}>
                <Ionicons name="checkmark" size={15} color={c.fg} />
              </View>
              <Txt variant="body" style={{ flex: 1 }}>
                {o}
              </Txt>
            </Row>
          ))}

          <Card style={{ marginTop: 16 }} flat>
            <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
              <Txt variant="label">Availability</Txt>
              <Txt variant="label" color={full ? palette.clay : palette.green}>
                {full ? 'Full — waitlist open' : `${program.capacity - program.enrolled} spots left`}
              </Txt>
            </Row>
            <GrowBar progress={fill} color={full ? palette.clay : c.fg} track={palette.paper2} height={10} />
            <Txt variant="caption" muted style={{ marginTop: 8 }}>
              {program.enrolled} of {program.capacity} participants enrolled
            </Txt>
          </Card>
        </View>
      </Screen>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        {enrollment ? (
          <Row gap={10}>
            <Button title="Leave program" variant="secondary" onPress={leave} style={{ flex: 1 }} />
            <Button title="My programs" icon="person" onPress={() => router.push('/account')} style={{ flex: 1 }} />
          </Row>
        ) : (
          <Button
            title={!signedIn ? 'Sign in to enroll' : full ? 'Join the waitlist' : 'Enroll now — it’s free'}
            icon={!signedIn ? 'log-in-outline' : 'arrow-forward'}
            onPress={enroll}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: space.xl, paddingBottom: 52, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  heroIcon: {
    marginTop: 26,
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: palette.mintBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fact: { paddingVertical: 12 },
  factBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line },
  check: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  enrolledBanner: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: palette.mintSoft,
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.xl,
    paddingTop: 12,
    backgroundColor: 'rgba(244,241,232,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.line,
  },
});
