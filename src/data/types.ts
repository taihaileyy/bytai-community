/**
 * Domain types. These mirror the tables you would create in Supabase
 * (see docs/BACKEND.md), so swapping the local store for a real backend
 * doesn't change any screen code.
 */
export type ID = string;

export type ProgramCategory = 'Food' | 'Youth' | 'Learning' | 'Wellness' | 'Housing';

export interface Program {
  id: ID;
  title: string;
  category: ProgramCategory;
  summary: string;
  description: string;
  schedule: string;
  location: string;
  ageGroup: string;
  capacity: number;
  enrolled: number;
  lead: string;
  icon: string; // Ionicons glyph name
  featured: boolean;
  outcomes: string[];
}

export type EventCategory = 'Volunteer' | 'Fundraiser' | 'Workshop' | 'Community';

export interface CommunityEvent {
  id: ID;
  title: string;
  category: EventCategory;
  date: string; // ISO date-time
  durationMins: number;
  location: string;
  address: string;
  description: string;
  capacity: number;
  attending: number;
  host: string;
  featured: boolean;
  cancelled?: boolean;
}

export interface Announcement {
  id: ID;
  title: string;
  body: string;
  date: string;
  pinned: boolean;
  tag: 'News' | 'Update' | 'Urgent' | 'Thank you';
}

export type DonationFrequency = 'one-time' | 'monthly';

export interface Donation {
  id: ID;
  memberId: ID | null; // null = anonymous / guest
  donorName: string;
  amount: number;
  frequency: DonationFrequency;
  fund: string;
  date: string;
  receipt: string;
}

export interface Member {
  id: ID;
  name: string;
  email: string;
  phone: string;
  neighborhood: string;
  joined: string;
  role: 'member' | 'admin';
  avatarColor: string;
  volunteerHours: number;
}

export interface Enrollment {
  id: ID;
  memberId: ID;
  programId: ID;
  date: string;
  status: 'active' | 'waitlist';
}

export interface Registration {
  id: ID;
  memberId: ID;
  eventId: ID;
  date: string;
  guests: number;
  confirmation: string;
}

export interface Notification {
  id: ID;
  memberId: ID;
  title: string;
  body: string;
  date: string;
  read: boolean;
  icon: string;
  link?: string;
}

export interface DemoState {
  version: number;
  sessionMemberId: ID | null;
  members: Member[];
  programs: Program[];
  events: CommunityEvent[];
  announcements: Announcement[];
  donations: Donation[];
  enrollments: Enrollment[];
  registrations: Registration[];
  notifications: Notification[];
}
