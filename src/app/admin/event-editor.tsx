import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import type { EventCategory } from '@/data/types';
import { useActions, useStore } from '@/store/AppStore';
import { dark, palette, radius } from '@/theme';
import { dayNum, monthShort, weekday } from '@/utils/format';
import { notice } from '@/utils/confirm';
import { PressScale } from '@/components/Motion';
import { Txt } from '@/components/Txt';
import { Button, Card, Chip, ChipRow, Field, FocusStatusBar, Row, Screen, Stepper, ToggleRow } from '@/components/ui';
import { AdminHeader } from '@/components/admin';

const CATS: EventCategory[] = ['Community', 'Volunteer', 'Workshop', 'Fundraiser'];
const TIMES = ['09:00', '10:00', '11:00', '13:00', '15:00', '17:30', '18:00', '19:00'];
const DURATIONS = [60, 90, 120, 180, 240];

const label12 = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

export default function EventEditor() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { state } = useStore();
  const actions = useActions();
  const existing = state.events.find((e) => e.id === id);

  const days = useMemo(() => {
    const out: Date[] = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 1; i <= 60; i++) out.push(new Date(start.getTime() + i * 86400000));
    return out;
  }, []);

  const initialDate = existing ? new Date(existing.date) : days[2];
  const [title, setTitle] = useState(existing?.title ?? '');
  const [category, setCategory] = useState<EventCategory>(existing?.category ?? 'Community');
  const [day, setDay] = useState(() => {
    const d = new Date(initialDate);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });
  const [timeStr, setTimeStr] = useState(
    existing ? `${String(initialDate.getHours()).padStart(2, '0')}:${String(initialDate.getMinutes()).padStart(2, '0')}` : '10:00',
  );
  const [duration, setDuration] = useState(existing?.durationMins ?? 120);
  const [location, setLocation] = useState(existing?.location ?? '');
  const [address, setAddress] = useState(existing?.address ?? '');
  const [capacity, setCapacity] = useState(existing ? Math.round(existing.capacity / 10) : 5);
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
      date: when.toISOString(),
      durationMins: duration,
      location: location.trim(),
      address: address.trim() || location.trim(),
      description: description.trim() || 'Details coming soon.',
      capacity: capacity * 10,
      host: 'Riverbend Events Team',
      featured,
    };
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (existing) {
      actions.updateEvent(existing.id, payload);
      router.back();
    } else {
      actions.addEvent(payload);
      router.back();
      notice('Event published', `“${payload.title}” is now live in the member app and members were notified.`);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen header={<AdminHeader title={existing ? 'Edit event' : 'New event'} eyebrow="Events" />}>
        <FocusStatusBar style="light" />
        <Field label="Event title" value={title} onChangeText={(t) => { setTitle(t); setError(''); }} placeholder="e.g. Neighborhood Book Swap" maxLength={60} />

        <Txt variant="label" style={{ marginBottom: 8 }}>
          Category
        </Txt>
        <ChipRow>
          {CATS.map((c) => (
            <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </ChipRow>

        <Txt variant="label" style={{ marginTop: 18, marginBottom: 8 }}>
          Date
        </Txt>
        <ChipRow>
          {days.map((d) => {
            const on = d.getTime() === day;
            const iso = d.toISOString();
            return (
              <PressScale
                key={d.getTime()}
                haptic
                onPress={() => setDay(d.getTime())}
                style={{
                  width: 58,
                  paddingVertical: 10,
                  borderRadius: radius.md,
                  alignItems: 'center',
                  backgroundColor: on ? dark.accent : dark.surface,
                  borderWidth: 1,
                  borderColor: on ? dark.accent : dark.border,
                }}
              >
                <Txt variant="eyebrow" color={on ? palette.night : dark.muted} style={{ fontSize: 9.5 }}>
                  {monthShort(iso)}
                </Txt>
                <Txt variant="heading" color={on ? palette.night : dark.ink}>
                  {dayNum(iso)}
                </Txt>
                <Txt variant="caption" color={on ? palette.night : dark.muted} style={{ fontSize: 11 }}>
                  {weekday(iso)}
                </Txt>
              </PressScale>
            );
          })}
        </ChipRow>

        <Txt variant="label" style={{ marginTop: 18, marginBottom: 8 }}>
          Start time
        </Txt>
        <ChipRow>
          {TIMES.map((t) => (
            <Chip key={t} label={label12(t)} selected={timeStr === t} onPress={() => setTimeStr(t)} />
          ))}
        </ChipRow>

        <Txt variant="label" style={{ marginTop: 18, marginBottom: 8 }}>
          Duration
        </Txt>
        <ChipRow>
          {DURATIONS.map((d) => (
            <Chip key={d} label={d < 60 ? `${d}m` : `${d / 60}h`.replace('.5h', 'h 30m')} selected={duration === d} onPress={() => setDuration(d)} />
          ))}
        </ChipRow>

        <View style={{ height: 18 }} />
        <Field label="Location" value={location} onChangeText={(t) => { setLocation(t); setError(''); }} placeholder="e.g. Riverbend Commons Hall" />
        <Field label="Address (optional)" value={address} onChangeText={setAddress} placeholder="e.g. 45 Commons Way" />
        <Field label="Description" value={description} onChangeText={setDescription} placeholder="What should people know?" multiline maxLength={400} />

        <Card flat style={{ paddingVertical: 8 }}>
          <Row style={{ justifyContent: 'space-between', paddingVertical: 8 }}>
            <View>
              <Txt variant="bodyStrong">Capacity</Txt>
              <Txt variant="caption" muted>
                {capacity * 10} people
              </Txt>
            </View>
            <Stepper value={capacity} onChange={setCapacity} min={1} max={50} />
          </Row>
          <ToggleRow label="Feature on home screen" description="Highlights the event for members." value={featured} onChange={setFeatured} />
        </Card>

        {error ? (
          <Txt variant="label" color={palette.clay} style={{ marginTop: 14 }}>
            {error}
          </Txt>
        ) : null}

        <Button title={existing ? 'Save changes' : 'Publish event'} icon={existing ? 'checkmark' : 'paper-plane'} onPress={save} style={{ marginTop: 20 }} />
        <Button title="Cancel" variant="ghost" onPress={() => router.back()} style={{ marginTop: 4 }} />
      </Screen>
    </KeyboardAvoidingView>
  );
}
