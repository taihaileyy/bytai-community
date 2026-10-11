import type {
  Announcement,
  CommunityEvent,
  DemoState,
  Donation,
  Enrollment,
  ID,
  Notification,
  Registration,
} from '@/data/types';
import { createSeedState, DEMO_MEMBER_ID } from '@/data/seed';
import { uid } from '@/utils/format';

export type Action =
  | { type: 'hydrate'; state: DemoState }
  | { type: 'reset' }
  | { type: 'signIn'; memberId: ID }
  | { type: 'signOut' }
  | { type: 'enroll'; enrollment: Enrollment }
  | { type: 'unenroll'; programId: ID; memberId: ID }
  | { type: 'register'; registration: Registration }
  | { type: 'cancelRegistration'; eventId: ID; memberId: ID }
  | { type: 'donate'; donation: Donation }
  | { type: 'readNotification'; id: ID }
  | { type: 'readAllNotifications'; memberId: ID }
  | { type: 'addEvent'; event: CommunityEvent }
  | { type: 'updateEvent'; id: ID; patch: Partial<CommunityEvent> }
  | { type: 'deleteEvent'; id: ID }
  | { type: 'addAnnouncement'; announcement: Announcement }
  | { type: 'updateAnnouncement'; id: ID; patch: Partial<Announcement> }
  | { type: 'deleteAnnouncement'; id: ID };

const notify = (memberId: ID, n: Omit<Notification, 'id' | 'memberId' | 'date' | 'read'>): Notification => ({
  id: uid('n'),
  memberId,
  date: new Date().toISOString(),
  read: false,
  ...n,
});

export function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'reset':
      return { ...createSeedState(), sessionMemberId: state.sessionMemberId };
    case 'signIn':
      return { ...state, sessionMemberId: action.memberId };
    case 'signOut':
      return { ...state, sessionMemberId: null };

    case 'enroll': {
      const { enrollment } = action;
      const program = state.programs.find((p) => p.id === enrollment.programId);
      return {
        ...state,
        enrollments: [enrollment, ...state.enrollments],
        programs: state.programs.map((p) =>
          p.id === enrollment.programId && enrollment.status === 'active' ? { ...p, enrolled: p.enrolled + 1 } : p,
        ),
        notifications: program
          ? [
              notify(enrollment.memberId, {
                title: enrollment.status === 'active' ? `You're enrolled in ${program.title}` : `You're on the waitlist for ${program.title}`,
                body: `${program.schedule} at ${program.location}. ${program.lead} will reach out before your first session.`,
                icon: 'school-outline',
                link: `/program/${program.id}`,
              }),
              ...state.notifications,
            ]
          : state.notifications,
      };
    }
    case 'unenroll': {
      const existing = state.enrollments.find((e) => e.programId === action.programId && e.memberId === action.memberId);
      return {
        ...state,
        enrollments: state.enrollments.filter((e) => e !== existing),
        programs: state.programs.map((p) =>
          p.id === action.programId && existing?.status === 'active' ? { ...p, enrolled: Math.max(0, p.enrolled - 1) } : p,
        ),
      };
    }

    case 'register': {
      const { registration } = action;
      const event = state.events.find((e) => e.id === registration.eventId);
      return {
        ...state,
        registrations: [registration, ...state.registrations],
        events: state.events.map((e) =>
          e.id === registration.eventId ? { ...e, attending: e.attending + 1 + registration.guests } : e,
        ),
        notifications: event
          ? [
              notify(registration.memberId, {
                title: `RSVP confirmed: ${event.title}`,
                body: `Confirmation ${registration.confirmation}. ${registration.guests ? `+${registration.guests} guest${registration.guests > 1 ? 's' : ''}. ` : ''}See you at ${event.location}!`,
                icon: 'calendar-outline',
                link: `/event/${event.id}`,
              }),
              ...state.notifications,
            ]
          : state.notifications,
      };
    }
    case 'cancelRegistration': {
      const existing = state.registrations.find((r) => r.eventId === action.eventId && r.memberId === action.memberId);
      if (!existing) return state;
      return {
        ...state,
        registrations: state.registrations.filter((r) => r !== existing),
        events: state.events.map((e) =>
          e.id === action.eventId ? { ...e, attending: Math.max(0, e.attending - 1 - existing.guests) } : e,
        ),
      };
    }

    case 'donate': {
      const { donation } = action;
      return {
        ...state,
        donations: [donation, ...state.donations],
        notifications: donation.memberId
          ? [
              notify(donation.memberId, {
                title: donation.frequency === 'monthly' ? 'Monthly gift set up — thank you!' : 'Thank you for your gift!',
                body: `$${donation.amount} to ${donation.fund}. Receipt ${donation.receipt} (demo).`,
                icon: 'heart-outline',
              }),
              ...state.notifications,
            ]
          : state.notifications,
      };
    }

    case 'readNotification':
      return { ...state, notifications: state.notifications.map((n) => (n.id === action.id ? { ...n, read: true } : n)) };
    case 'readAllNotifications':
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.memberId === action.memberId ? { ...n, read: true } : n)),
      };

    case 'addEvent': {
      // In the demo, the sample member gets a push-style notice for new events.
      return {
        ...state,
        events: [...state.events, action.event],
        notifications: [
          notify(DEMO_MEMBER_ID, {
            title: `New event: ${action.event.title}`,
            body: `${action.event.location}. RSVP is open now.`,
            icon: 'sparkles-outline',
            link: `/event/${action.event.id}`,
          }),
          ...state.notifications,
        ],
      };
    }
    case 'updateEvent':
      return { ...state, events: state.events.map((e) => (e.id === action.id ? { ...e, ...action.patch } : e)) };
    case 'deleteEvent':
      return {
        ...state,
        events: state.events.filter((e) => e.id !== action.id),
        registrations: state.registrations.filter((r) => r.eventId !== action.id),
      };

    case 'addAnnouncement':
      return { ...state, announcements: [action.announcement, ...state.announcements] };
    case 'updateAnnouncement':
      return {
        ...state,
        announcements: state.announcements.map((a) => (a.id === action.id ? { ...a, ...action.patch } : a)),
      };
    case 'deleteAnnouncement':
      return { ...state, announcements: state.announcements.filter((a) => a.id !== action.id) };
  }
}
