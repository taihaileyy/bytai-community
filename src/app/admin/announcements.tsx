import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Announcement } from '@/data/types';
import { useActions, useStore } from '@/store/AppStore';
import { color, gutter } from '@/theme';
import { confirmAction } from '@/utils/confirm';
import { FadeIn } from '@/components/Motion';
import { T } from '@/components/Text';
import { Button, Chip, ChipRow, Divider, Field, Row, SectionHeader, Toggle } from '@/components/ui';
import { AnnouncementItem } from '@/components/domain';
import { AdminScreen, Panel } from '@/components/admin';

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
      <AdminScreen title="Announcements" eyebrow="Communicate">
        <Panel>
          <T v="title3" style={{ marginBottom: 16 }}>
            New announcement
          </T>
          <Field label="Headline" value={title} onChangeText={setTitle} placeholder="e.g. Pantry closed Monday for the holiday" maxLength={80} />
          <Field label="Message" value={body} onChangeText={setBody} placeholder="Share the details with members…" multiline maxLength={400} />
          <T v="subhead" c={color.ink2} style={{ marginBottom: 10 }}>
            Label
          </T>
          <ChipRow style={{ marginHorizontal: -18 }}>
            {TAGS.map((t) => (
              <Chip key={t} label={t} selected={tag === t} onPress={() => setTag(t)} />
            ))}
          </ChipRow>
          <Toggle label="Pin to top" description="Pinned posts appear first on Home." value={pinned} onChange={setPinned} />
          <Button title="Publish to members" icon="paper-plane-outline" disabled={!valid} onPress={post} style={{ marginTop: 6 }} />
          {posted ? (
            <FadeIn>
              <T v="subhead" c={color.accent} center style={{ marginTop: 12 }} accessibilityLiveRegion="polite">
                Published — it’s live on the member Home screen.
              </T>
            </FadeIn>
          ) : null}
        </Panel>

        <SectionHeader title={`Posted · ${list.length}`} />
        <View style={{ paddingHorizontal: gutter }}>
          {list.map((a, i) => (
            <View key={a.id}>
              {i > 0 ? <Divider /> : null}
              <AnnouncementItem item={a} />
              <Row gap={8} style={{ marginBottom: 14 }}>
                <Button size="sm" variant="secondary" icon={a.pinned ? 'pin' : 'pin-outline'} title={a.pinned ? 'Unpin' : 'Pin'} onPress={() => actions.updateAnnouncement(a.id, { pinned: !a.pinned })} />
                <Button size="sm" variant="danger" icon="trash-outline" title="Delete" onPress={() => confirmAction('Delete announcement?', a.title, () => actions.deleteAnnouncement(a.id), 'Delete')} />
              </Row>
            </View>
          ))}
        </View>
      </AdminScreen>
    </KeyboardAvoidingView>
  );
}
