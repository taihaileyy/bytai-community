import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import type { EventCategory } from '@/data/types';
import { EVENT_COVERS, type PhotoKey } from '@/data/photos';
import { useActions, useStore } from '@/store/AppStore';
import { color, font, gutter, radius } from '@/theme';
import { dayNum, monthShort, weekday } from '@/utils/format';
import { notice } from '@/utils/confirm';
import { PressScale } from '@/components/Motion';
import { Photo } from '@/components/Photo';
import { T } from '@/components/Text';
import { BottomBar, Button, Chip, ChipRow, Field, Row, Stepper, Toggle } from '@/components/ui';
import { AdminScreen, Panel } from '@/components/admin';

const CATS: EventCategory[] = ['Community', 'Volunteer', 'Workshop', 'Fundraiser'];
const TIMES = ['09:00', '10:00', '11:00', '13:00', '15:00', '17:30', '18:00', '19:00'];
const DURATIONS = [60, 90, 120, 180, 240];
const label12 = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
const durLabel = (d: number) => (d % 60 ? `${Math.floor(d / 60)}h ${d % 60}m` : `${d / 60}h`);

export default function EventEditor() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { state } = useStore();
  const actions = useActions();
  const existing = state.events.find((e) => e.id === id);

  const days = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 60 }, (_, i) => new Date(start.getTime() + (i + 1) * 86400000));
  }, []);

  const init = existing ? new Date(existing.date) : days[2];
  const [title, setTitle] = useState(existing?.title ?? '');
  const [category, setCategory] = useState<EventCategory>(existing?.category ?? 'Community');
  const [photo, setPhoto] = useState<PhotoKey>(existing?.photo ?? EVENT_COVERS[0]);
  const [day, setDay] = useState(() => {
    const d = new Date(init);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });
  const [timeStr, setTimeStr] = useState(existing ? `${String(init.getHours()).padStart(2, '0')}:${String(init.getMinutes()).padStart(2, '0')}` : '10:00');
  const [duration, setDuration] = useState(existing?.durationMins ?? 120);
  const [location, setLocation] = useState(existing?.location ?? '');
  const [address, setAddress] = useState(existing?.address ?? '');
  const [capacity, setCapacity] = useState(existing ? Math.max(1, Math.round(existing.capacity / 10)) : 5);
  const [description, setDescription] = useState(existing?.description ?? '');
  const [featured, setFeatured] = useState(existing?.featured ?? false);
  const [error, setError] = useState('');

  const save = () => {
    if (title.trim().length < 3) return setError('Give the event a title (at least 3 characters).');
    if (!location.trim()) return setError('Add a location.');
    const [h, m] = timeStr.split(':').map(Number);
    const when = new Date(day);
    when.setHours(h, m, 0, 0);
    const payload = {
      title: title.trim(),
      category,
      photo,
      date: when.toISOString(),
      durationMins: duration,
      location: location.trim(),
      address: address.trim() || location.trim(),
      description: description.trim() || 'Details coming soon.',
      capacity: capacity * 10,
      host: existing?.host ?? 'Riverbend Events Team',
      featured,
    };
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (existing) {
      actions.updateEvent(existing.id, payload);
      router.back();
    } else {
      actions.addEvent(payload);
      router.back();
      notice('Event published', `“${payload.title}” is live in the member app and members were notified.`);
    }
  };

  const Label = ({ children }: { children: string }) => (
    <T v="subhead" c={color.ink2} style={{ marginHorizontal: gutter, marginTop: 22, marginBottom: 10 }}>
      {children}
    </T>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AdminScreen
        title={existing ? 'Edit event' : 'New event'}
        eyebrow="Events"
        bottom={
          <BottomBar>
            {error ? (
              <T v="caption" c={color.danger} center style={{ marginBottom: 8 }} accessibilityLiveRegion="assertive">
                {error}
              </T>
            ) : null}
            <Button title={existing ? 'Save changes' : 'Publish event'} onPress={save} />
          </BottomBar>
        }
      >
        <View style={{ paddingHorizontal: gutter }}>
          <Field label="Title" value={title} onChangeText={(t) => { setTitle(t); setError(''); }} placeholder="e.g. Neighborhood Book Swap" maxLength={60} />
        </View>

        <Label>Cover photo</Label>
        <ChipRow>
          {EVENT_COVERS.map((k) => {
            const on = photo === k;
            return (
              <PressScale key={k} haptic onPress={() => setPhoto(k)} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`Cover option ${k}`}>
                <Photo photo={k} width={240} style={[styles.cover, on && styles.coverOn]} decorative>
                  {on ? (
                    <View style={styles.coverCheck}>
                      <Ionicons name="checkmark" size={14} color={color.white} />
                    </View>
                  ) : null}
                </Photo>
              </PressScale>
            );
          })}
        </ChipRow>

        <Label>Category</Label>
        <ChipRow>
          {CATS.map((c) => (
            <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </ChipRow>

        <Label>Date</Label>
        <ChipRow>
          {days.map((d) => {
            const on = d.getTime() === day;
            const iso = d.toISOString();
            return (
              <PressScale
                key={d.getTime()}
                haptic
                onPress={() => setDay(d.getTime())}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={d.toDateString()}
                style={[styles.date, on && styles.dateOn]}
              >
                <T v="caption" c={on ? 'rgba(255,255,255,0.7)' : color.muted} style={{ fontSize: 11 }}>
                  {weekday(iso)}
                </T>
                <T c={on ? color.white : color.ink} style={{ fontFamily: font.display, fontSize: 19, lineHeight: 23 }}>
                  {dayNum(iso)}
                </T>
                <T v="caption" c={on ? 'rgba(255,255,255,0.7)' : color.muted} style={{ fontSize: 10.5 }}>
                  {monthShort(iso)}
                </T>
              </PressScale>
            );
          })}
        </ChipRow>

        <Label>Start time</Label>
        <ChipRow>
          {TIMES.map((t) => (
            <Chip key={t} label={label12(t)} selected={timeStr === t} onPress={() => setTimeStr(t)} />
          ))}
        </ChipRow>

        <Label>Duration</Label>
        <ChipRow>
          {DURATIONS.map((d) => (
            <Chip key={d} label={durLabel(d)} selected={duration === d} onPress={() => setDuration(d)} />
          ))}
        </ChipRow>

        <View style={{ paddingHorizontal: gutter, marginTop: 24 }}>
          <Field label="Location" value={location} onChangeText={(t) => { setLocation(t); setError(''); }} placeholder="e.g. Riverbend Commons Hall" />
          <Field label="Address (optional)" value={address} onChangeText={setAddress} placeholder="e.g. 45 Commons Way" />
          <Field label="Description" value={description} onChangeText={setDescription} placeholder="What should people know?" multiline maxLength={400} />
        </View>

        <Panel style={{ paddingVertical: 6 }}>
          <Row style={{ justifyContent: 'space-between', paddingVertical: 10 }}>
            <View>
              <T v="bodyMedium">Capacity</T>
              <T v="caption" muted tabular>
                {capacity * 10} people
              </T>
            </View>
            <Stepper label="Capacity in tens" value={capacity} onChange={setCapacity} min={1} max={50} />
          </Row>
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: color.line }} />
          <Toggle label="Feature this event" description="Highlights it at the top of Events." value={featured} onChange={setFeatured} />
        </Panel>
      </AdminScreen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  cover: { width: 92, height: 92, borderRadius: radius.md },
  coverOn: { borderWidth: 3, borderColor: color.ink },
  coverCheck: { position: 'absolute', right: 6, bottom: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: color.ink, alignItems: 'center', justifyContent: 'center' },
  date: { width: 56, paddingVertical: 9, borderRadius: radius.md, alignItems: 'center', backgroundColor: color.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: color.lineStrong },
  dateOn: { backgroundColor: color.ink, borderColor: color.ink },
});
