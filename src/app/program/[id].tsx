import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useActions, useMyActivity, useSession, useStore } from '@/store/AppStore';
import { color, gutter, radius } from '@/theme';
import { shortDate } from '@/utils/format';
import { confirmAction, notice } from '@/utils/confirm';
import { FadeIn } from '@/components/Motion';
import { T } from '@/components/Text';
import { DetailLayout } from '@/components/DetailLayout';
import { Avatar, BottomBar, Button, Divider, EmptyState, Progress, Row, Screen, Tag, type IconName } from '@/components/ui';

export default function ProgramDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useStore();
  const { signedIn } = useSession();
  const { isEnrolled } = useMyActivity();
  const actions = useActions();
  const program = state.programs.find((p) => p.id === id);

  if (!program)
    return (
      <Screen>
        <EmptyState icon="alert-circle-outline" title="Program not found" body="It may have been removed." action="Back to programs" onAction={() => router.replace('/programs')} />
      </Screen>
    );

  const enrollment = isEnrolled(program.id);
  const full = program.enrolled >= program.capacity;
  const left = Math.max(0, program.capacity - program.enrolled);

  const enroll = () => {
    if (!signedIn) return router.push('/sign-in');
    const status = actions.enroll(program.id);
    router.push({
      pathname: '/confirm',
      params: {
        kind: 'program',
        title: status === 'active' ? "You're enrolled" : "You're on the waitlist",
        subtitle: program.title,
        detail: `${program.schedule}\n${program.location}`,
        code: `ENR-${program.id.slice(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 8999)}`,
        note: `${program.lead} will reach out with everything you need before your first session.`,
        photo: program.photo,
      },
    });
  };

  const facts: { icon: IconName; label: string; value: string }[] = [
    { icon: 'time-outline', label: 'When', value: program.schedule },
    { icon: 'location-outline', label: 'Where', value: program.location },
    { icon: 'people-outline', label: 'Who', value: program.ageGroup },
    { icon: 'pricetag-outline', label: 'Cost', value: 'Free' },
  ];

  return (
    <DetailLayout
      photo={program.photo}
      title={program.title}
      fallback="/programs"
      onShare={() => notice('Share (demo)', 'In the finished app this opens the native share sheet with a link to this program.')}
      bottom={
        <BottomBar>
          {enrollment ? (
            <Row gap={10}>
              <Button
                title="Leave"
                variant="secondary"
                onPress={() => confirmAction('Leave this program?', `You'll give up your spot in ${program.title}.`, () => actions.unenroll(program.id), 'Leave')}
                style={{ flex: 1 }}
              />
              <Button title="View in profile" onPress={() => router.navigate('/account')} style={{ flex: 2 }} />
            </Row>
          ) : (
            <Row gap={16}>
              <View style={{ flex: 1 }}>
                <T v="title3">Free</T>
                <T v="caption" c={full ? color.danger : color.muted}>
                  {full ? 'Full · waitlist open' : `${left} spots left`}
                </T>
              </View>
              <Button
                title={!signedIn ? 'Sign in to enroll' : full ? 'Join waitlist' : 'Enroll'}
                onPress={enroll}
                style={{ flex: 1.6 }}
              />
            </Row>
          )}
        </BottomBar>
      }
    >
      <View style={{ paddingHorizontal: gutter }}>
        <FadeIn>
          <Row gap={6}>
            <Tag label={program.category} />
            {program.featured ? <Tag label="Featured" tone="accent" /> : null}
          </Row>
          <T v="largeTitle" style={{ marginTop: 12 }} accessibilityRole="header">
            {program.title}
          </T>
          <T v="body" muted style={{ marginTop: 8 }}>
            {program.summary}
          </T>
        </FadeIn>

        {enrollment ? (
          <FadeIn>
            <Row gap={12} style={styles.enrolled}>
              <Ionicons name="checkmark-circle" size={22} color={color.accent} />
              <View style={{ flex: 1 }}>
                <T v="headline" c={color.accent}>
                  {enrollment.status === 'active' ? "You're enrolled" : "You're on the waitlist"}
                </T>
                <T v="caption" muted>
                  Since {shortDate(enrollment.date)}
                </T>
              </View>
            </Row>
          </FadeIn>
        ) : null}

        <View style={styles.facts}>
          {facts.map((f) => (
            <View key={f.label} style={styles.fact} accessible accessibilityLabel={`${f.label}: ${f.value}`}>
              <Ionicons name={f.icon} size={18} color={color.ink} />
              <T v="caption" muted style={{ marginTop: 10 }}>
                {f.label}
              </T>
              <T v="calloutMedium" style={{ marginTop: 2 }}>
                {f.value}
              </T>
            </View>
          ))}
        </View>

        <Divider style={{ marginVertical: 24 }} />

        <T v="title3" accessibilityRole="header">
          About
        </T>
        <T v="body" c={color.ink2} style={{ marginTop: 8 }}>
          {program.description}
        </T>

        <T v="title3" style={{ marginTop: 28 }} accessibilityRole="header">
          What's included
        </T>
        <View style={{ marginTop: 12, gap: 12 }}>
          {program.outcomes.map((o) => (
            <Row key={o} gap={12}>
              <View style={styles.check}>
                <Ionicons name="checkmark" size={14} color={color.accent} />
              </View>
              <T v="body" style={{ flex: 1 }}>
                {o}
              </T>
            </Row>
          ))}
        </View>

        <Divider style={{ marginVertical: 24 }} />

        <Row gap={14}>
          <Avatar name={program.lead} size={48} />
          <View style={{ flex: 1 }}>
            <T v="caption" muted>
              Program lead
            </T>
            <T v="headline">{program.lead}</T>
          </View>
          <Button title="Message" size="sm" variant="secondary" icon="chatbubble-outline" onPress={() => notice('Message (demo)', 'In the finished app members can message program leads directly.')} />
        </Row>

        <View style={{ marginTop: 28 }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <T v="calloutMedium">Availability</T>
            <T v="callout" muted tabular>
              {program.enrolled} / {program.capacity} enrolled
            </T>
          </Row>
          <Progress value={program.enrolled / program.capacity} tone={full ? 'danger' : 'accent'} height={6} />
        </View>
      </View>
    </DetailLayout>
  );
}

const styles = StyleSheet.create({
  enrolled: { marginTop: 18, padding: 14, borderRadius: radius.md, backgroundColor: color.accentSoft },
  facts: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 22, gap: 10 },
  fact: {
    width: '48%',
    flexGrow: 1,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.line,
  },
  check: { width: 24, height: 24, borderRadius: 12, backgroundColor: color.accentSoft, alignItems: 'center', justifyContent: 'center' },
});
