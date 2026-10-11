/**
 * App-wide demo store: React context + reducer, persisted on-device.
 * Screens use the typed hooks and actions below and never touch storage,
 * so the data source can be swapped for Supabase without UI changes.
 */
import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { createSeedState, SEED_VERSION } from '@/data/seed';
import type { CommunityEvent, DemoState, DonationFrequency, ID, Announcement } from '@/data/types';
import { localAdapter } from '@/services/storage';
import { paymentProvider, type ChargeRequest } from '@/services/payments';
import { demoSignIn, type DemoRole } from '@/services/auth';
import { code, uid } from '@/utils/format';
import { reducer } from './reducer';

type Ctx = { state: DemoState; ready: boolean; actions: ReturnType<typeof makeActions> };

const StoreContext = createContext<Ctx | null>(null);

function makeActions(dispatch: React.Dispatch<Parameters<typeof reducer>[1]>, getState: () => DemoState) {
  const me = () => getState().sessionMemberId;
  return {
    async signIn(role: DemoRole) {
      const memberId = await demoSignIn(role);
      dispatch({ type: 'signIn', memberId });
      return memberId;
    },
    signOut: () => dispatch({ type: 'signOut' }),
    resetDemo: () => dispatch({ type: 'reset' }),

    /** Returns 'active' or 'waitlist' so the confirmation screen can say which. */
    enroll(programId: ID) {
      const memberId = me();
      if (!memberId) throw new Error('Sign in first');
      const p = getState().programs.find((x) => x.id === programId);
      const status = p && p.enrolled >= p.capacity ? 'waitlist' : 'active';
      dispatch({ type: 'enroll', enrollment: { id: uid('en'), memberId, programId, date: new Date().toISOString(), status } });
      return status;
    },
    unenroll(programId: ID) {
      const memberId = me();
      if (memberId) dispatch({ type: 'unenroll', programId, memberId });
    },

    register(eventId: ID, guests: number) {
      const memberId = me();
      if (!memberId) throw new Error('Sign in first');
      const confirmation = code('EVT');
      dispatch({ type: 'register', registration: { id: uid('r'), memberId, eventId, guests, date: new Date().toISOString(), confirmation } });
      return confirmation;
    },
    cancelRegistration(eventId: ID) {
      const memberId = me();
      if (memberId) dispatch({ type: 'cancelRegistration', eventId, memberId });
    },

    async donate(req: Omit<ChargeRequest, 'frequency'> & { frequency: DonationFrequency }) {
      const result = await paymentProvider.charge(req);
      const state = getState();
      const member = state.members.find((m) => m.id === state.sessionMemberId);
      dispatch({
        type: 'donate',
        donation: {
          id: uid('d'),
          memberId: member?.id ?? null,
          donorName: member?.name ?? 'Guest donor',
          amount: req.amount,
          frequency: req.frequency,
          fund: req.fund,
          date: result.processedAt,
          receipt: result.receipt,
        },
      });
      return result;
    },

    readNotification: (id: ID) => dispatch({ type: 'readNotification', id }),
    readAllNotifications() {
      const memberId = me();
      if (memberId) dispatch({ type: 'readAllNotifications', memberId });
    },

    // Admin
    addEvent(event: Omit<CommunityEvent, 'id' | 'attending'>) {
      const id = uid('e');
      dispatch({ type: 'addEvent', event: { ...event, id, attending: 0 } });
      return id;
    },
    updateEvent: (id: ID, patch: Partial<CommunityEvent>) => dispatch({ type: 'updateEvent', id, patch }),
    deleteEvent: (id: ID) => dispatch({ type: 'deleteEvent', id }),
    addAnnouncement(a: Omit<Announcement, 'id' | 'date'>) {
      dispatch({ type: 'addAnnouncement', announcement: { ...a, id: uid('a'), date: new Date().toISOString() } });
    },
    updateAnnouncement: (id: ID, patch: Partial<Announcement>) => dispatch({ type: 'updateAnnouncement', id, patch }),
    deleteAnnouncement: (id: ID) => dispatch({ type: 'deleteAnnouncement', id }),
  };
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createSeedState);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    localAdapter.load().then((saved) => {
      if (saved && saved.version === SEED_VERSION) dispatch({ type: 'hydrate', state: saved });
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) localAdapter.save(state);
  }, [state, ready]);

  const actions = useMemo(() => makeActions(dispatch, () => stateRef.current), []);
  const value = useMemo(() => ({ state, ready, actions }), [state, ready, actions]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside AppStoreProvider');
  return ctx;
}

export const useActions = () => useStore().actions;

export function useSession() {
  const { state } = useStore();
  const member = state.members.find((m) => m.id === state.sessionMemberId) ?? null;
  return { member, isAdmin: member?.role === 'admin', signedIn: !!member };
}

export function useMyActivity() {
  const { state } = useStore();
  const id = state.sessionMemberId;
  return useMemo(() => {
    const enrollments = state.enrollments.filter((e) => e.memberId === id);
    const registrations = state.registrations.filter((r) => r.memberId === id);
    const donations = state.donations.filter((d) => d.memberId === id);
    const notifications = state.notifications.filter((n) => n.memberId === id);
    return {
      enrollments,
      registrations,
      donations,
      notifications,
      unread: notifications.filter((n) => !n.read).length,
      isEnrolled: (programId: ID) => enrollments.find((e) => e.programId === programId),
      isRegistered: (eventId: ID) => registrations.find((r) => r.eventId === eventId),
    };
  }, [state.enrollments, state.registrations, state.donations, state.notifications, id]);
}

/** Community-wide impact numbers shown on Home and in Admin. */
export function useImpact() {
  const { state } = useStore();
  return useMemo(() => {
    const raisedThisYear = state.donations
      .filter((d) => new Date(d.date).getFullYear() === new Date().getFullYear())
      .reduce((s, d) => s + d.amount, 0);
    const served = state.programs.reduce((s, p) => s + p.enrolled, 0);
    const volunteerHours = state.members.reduce((s, m) => s + m.volunteerHours, 0) + 12_400;
    return {
      familiesServed: 1_820 + served,
      mealsShared: 48_250 + state.donations.length * 12,
      volunteerHours,
      raisedThisYear: 182_000 + raisedThisYear,
      peopleInPrograms: served,
    };
  }, [state.donations, state.programs, state.members]);
}
