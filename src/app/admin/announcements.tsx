import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Announcement } from '@/data/types';
import { useActions, useStore } from '@/store/AppStore';
import { palette } from '@/theme';
import { confirmAction } from '@/utils/confirm';
import { FadeIn } from '@/components/Motion';
import { Txt } from '@/components/Txt';
import { Button, Card, Chip, ChipRow, Field, FocusStatusBar, Row, Screen, SectionHeader, ToggleRow } from '@/components/ui';
import { AnnouncementCard } from '@/components/domain';
import { AdminHeader } from '@/components/admin';

const TAGS: Announcement['tag'][] = ['News', 'Update', 'Urgent', 'Thank you'];

export default function AdminAnnouncements() {
  const { state } = useStore();
  const actions = useActions();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tag, setTag] = useState<Announcement['tag']>('News');
  const [pinned, setPinned] = useState(false);
  const [posted, setPosted] = useState(false);

  const list = [...state.announcements].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date));
  const valid = title.trim().length >= 3 && body.trim().length >= 5;

  const post = () => {
    actions.addAnnouncement({ title: title.trim(), body: body.trim(), tag, pinned });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setTitle('');
    setBody('');
    setPinned(false);
    setPosted(true);
    setTimeout(() => setPosted(false), 2600);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen header={<AdminHeader title="Announcements" eyebrow="Communicate" />}>
        <FocusStatusBar style="light" />
        <Card flat>
          <Txt variant="heading" style={{ marginBottom: 14 }}>
            Post an announcement
          </Txt>
          <Field label="Headline" value={title} onChangeText={setTitle} placeholder="e.g. Pantry closed Monday for the holiday" maxLength={80} />
          <Field label="Message" value={body} onChangeText={setBody} placeholder="Share the details with members…" multiline maxLength={400} />
          <Txt variant="label" style={{ marginBottom: 8 }}>
            Label
          </Txt>
          <ChipRow>
            {TAGS.map((t) => (
              <Chip key={t} label={t} selected={tag === t} onPress={() => setTag(t)} />
            ))}
          </ChipRow>
          <ToggleRow label="Pin to top" description="Pinned posts appear first on Home." value={pinned} onChange={setPinned} />
          <Button title="Publish to members" icon="megaphone" disabled={!valid} onPress={post} style={{ marginTop: 8 }} />
          {posted ? (
            <FadeIn>
              <Txt variant="label" color={palette.mintBright} center style={{ marginTop: 12 }}>
                ✓ Published — it’s live on the member Home screen.
              </Txt>
            </FadeIn>
          ) : null}
        </Card>

        <SectionHeader title={`Posted (${list.length})`} />
        {list.map((a) => (
          <View key={a.id} style={{ marginBottom: 6 }}>
            <AnnouncementCard item={a} compact />
            <Row gap={8} style={{ marginTop: -4, marginBottom: 10 }}>
              <Button size="sm" variant="secondary" icon={a.pinned ? 'pin' : 'pin-outline'} title={a.pinned ? 'Unpin' : 'Pin'} onPress={() => actions.updateAnnouncement(a.id, { pinned: !a.pinned })} />
              <Button size="sm" variant="danger" icon="trash-outline" title="Delete" onPress={() => confirmAction('Delete announcement?', a.title, () => actions.deleteAnnouncement(a.id), 'Delete')} />
            </Row>
          </View>
        ))}
      </Screen>
    </KeyboardAvoidingView>
  );
}
