import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useActions, useMyActivity, useSession, useStore } from '@/store/AppStore';
import { gutter, palette, radius } from '@/theme';
import { ToneProvider } from '@/theme/ToneContext';
import { shortDate } from '@/utils/format';
import { confirmAction, notice } from '@/utils/confirm';
import { FadeIn } from '@/components/Motion';
import { Photo } from '@/components/Photo';
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
      <ToneProvider tone="light">
        <Screen>
          <EmptyState icon="alert-circle-outline" title="Program not found" body="It may have been removed." action="Back to programs" onAction={() => router.replace('/programs')} />
        </Screen>
      </ToneProvider>
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
        title: status === 'active' ? 'You’re Enrolled' : 'You’re on the Waitlist',
        subtitle: program.title,
        detail: `${program.schedule}\n${program.location}`,
        code: `ENR-${program.id.slice(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 8999)}`,
        note: `${program.lead} will reach out with everything you need before your first session.`,
        photo: program.photo,
      },
    });
  };

  const info: { icon: IconName; text: string }[] = [
    { icon: 'people-outline', text: program.ageGroup },
    { icon: 'calendar-outline', text: program.schedule },
    { icon: 'location-outline', text: program.location },
  ];

  return (
    <DetailLayout
      photo={program.photo}
      title={program.title}
      fallback="/programs"
      position="top"
      onShare={() => notice('Share (demo)', 'In the finished app this opens the share sheet with a link to this program.')}
      bottom={
        <ToneProvider tone="light">
          <BottomBar>
            {enrollment ? (
              <Row gap={10}>
                <Button title="Leave" variant="outline" onPress={() => confirmAction('Leave this program?', `You'll give up your spot in ${program.title}.`, () => actions.unenroll(program.id), 'Leave')} style={{ flex: 1 }} />
                <Button title="My Programs" variant="purple" iconRight="arrow-forward" onPress={() => router.push('/my-programs')} style={{ flex: 2 }} />
              </Row>
            ) : (
              <Button title={!signedIn ? 'Sign In to Enroll' : full ? 'Join the Waitlist' : 'Enroll Now'} variant="purple" iconRight="arrow-forward" onPress={enroll} />
            )}
          </BottomBar>
        </ToneProvider>
      }
    >
      <View style={{ paddingHorizontal: gutter }}>
        <FadeIn>
          <Row gap={6}>
            <Tag label={program.category} tone="gold" />
            {enrollment ? <Tag label={enrollment.status === 'active' ? 'Enrolled' : 'Waitlist'} tone="purple" icon="checkmark" /> : null}
          </Row>
          <T v="display" style={{ marginTop: 12 }} accessibilityRole="header">
            {program.title}
          </T>
          <T v="body" muted style={{ marginTop: 10 }}>
            {program.description}
          </T>
        </FadeIn>

        <View style={{ marginTop: 16, gap: 10 }}>
          {info.map((r) => (
            <Row key={r.text} gap={12}>
              <Ionicons name={r.icon} size={18} color={palette.purple} />
              <T v="calloutMedium" style={{ flex: 1 }}>
                {r.text}
              </T>
            </Row>
          ))}
        </View>

        {enrollment ? (
          <T v="caption" muted style={{ marginTop: 12 }}>
            {enrollment.status === 'active' ? 'Enrolled' : 'On the waitlist'} since {shortDate(enrollment.date)}
          </T>
        ) : null}

        {/* Gallery */}
        <Row gap={10} style={{ marginTop: 22 }}>
          {[program.photo, ...program.gallery].slice(1, 3).map((g) => (
            <Photo key={g} photo={g} width={500} style={styles.gallery} />
          ))}
        </Row>

        <T v="title1" style={{ marginTop: 26 }} accessibilityRole="header">
          What You’ll Gain
        </T>
        <View style={styles.gains}>
          {program.outcomes.map((o) => (
            <View key={o.label} style={styles.gain} accessible accessibilityLabel={o.label}>
              <Ionicons name={o.icon as IconName} size={24} color={palette.purple} />
              <T v="caption" center style={{ marginTop: 8, fontSize: 11.5, lineHeight: 14 }}>
                {o.label}
              </T>
            </View>
          ))}
        </View>

        <Divider style={{ marginVertical: 24 }} />

        <Row gap={14}>
          <Avatar name={program.lead} size={46} />
          <View style={{ flex: 1 }}>
            <T v="caption" muted>
              Program lead
            </T>
            <T v="title3">{program.lead}</T>
          </View>
          <Button title="Message" size="sm" variant="outline" icon="chatbubble-outline" onPress={() => notice('Message (demo)', 'Members can message program leads in the finished app.')} />
        </Row>

        <View style={{ marginTop: 24 }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <T v="calloutMedium">Availability</T>
            <T v="callout" muted tabular>
              {full ? 'Full · waitlist open' : `${left} of ${program.capacity} spots open`}
            </T>
          </Row>
          <Progress value={program.enrolled / program.capacity} height={6} />
        </View>
      </View>
    </DetailLayout>
  );
}

const styles = StyleSheet.create({
  gallery: { flex: 1, height: 110, borderRadius: radius.md },
  gains: { flexDirection: 'row', gap: 8, marginTop: 14 },
  gain: { flex: 1, paddingVertical: 14, paddingHorizontal: 4, borderRadius: radius.md, backgroundColor: palette.paper, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E3D8C6', alignItems: 'center' },
});
