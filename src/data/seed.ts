/**
 * Fictional sample data for the demo. Every person, organization, email and
 * address here is made up. Dates are generated relative to "today" so the
 * demo never looks stale.
 */
import type {
  Announcement,
  CommunityEvent,
  DemoState,
  Donation,
  Enrollment,
  Member,
  Notification,
  Program,
  Registration,
} from './types';

export const SEED_VERSION = 1;

export const ORG = {
  name: 'Riverbend Community Alliance',
  short: 'Riverbend',
  mission:
    'We connect neighbors to food, learning and opportunity so every family in Riverbend can thrive.',
  founded: 2014,
  city: 'Riverbend',
};

const DAY = 24 * 60 * 60 * 1000;

function at(daysFromNow: number, hour = 10, minute = 0): string {
  const d = new Date(Date.now() + daysFromNow * DAY);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** Small deterministic PRNG so seeded analytics look the same every reset. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const DEMO_MEMBER_ID = 'm-jordan';
export const DEMO_ADMIN_ID = 'm-avery';

const members: Member[] = [
  { id: DEMO_MEMBER_ID, name: 'Jordan Ellis', email: 'jordan.ellis@example.org', phone: '(555) 014-2290', neighborhood: 'Maple Heights', joined: at(-410), role: 'member', avatarColor: '#2F7A63', volunteerHours: 38 },
  { id: DEMO_ADMIN_ID, name: 'Avery Brooks', email: 'avery@riverbend.example.org', phone: '(555) 010-0001', neighborhood: 'Downtown', joined: at(-1500), role: 'admin', avatarColor: '#131310', volunteerHours: 212 },
  { id: 'm-2', name: 'Priya Raman', email: 'priya.r@example.org', phone: '(555) 013-4471', neighborhood: 'Eastside', joined: at(-300), role: 'member', avatarColor: '#4F7FA8', volunteerHours: 22 },
  { id: 'm-3', name: 'Marcus Webb', email: 'mwebb@example.org', phone: '(555) 016-8802', neighborhood: 'Riverside', joined: at(-260), role: 'member', avatarColor: '#C4674F', volunteerHours: 51 },
  { id: 'm-4', name: 'Sofia Alvarez', email: 'sofia.a@example.org', phone: '(555) 011-9035', neighborhood: 'Maple Heights', joined: at(-220), role: 'member', avatarColor: '#8A6BB0', volunteerHours: 17 },
  { id: 'm-5', name: 'Daniel Okafor', email: 'd.okafor@example.org', phone: '(555) 018-3316', neighborhood: 'Northgate', joined: at(-190), role: 'member', avatarColor: '#A0782A', volunteerHours: 64 },
  { id: 'm-6', name: 'Grace Lin', email: 'grace.lin@example.org', phone: '(555) 012-7724', neighborhood: 'Eastside', joined: at(-150), role: 'member', avatarColor: '#2F7A63', volunteerHours: 9 },
  { id: 'm-7', name: 'Theo Marsh', email: 'theo.m@example.org', phone: '(555) 019-5560', neighborhood: 'Downtown', joined: at(-120), role: 'member', avatarColor: '#4F7FA8', volunteerHours: 30 },
  { id: 'm-8', name: 'Hannah Cole', email: 'hcole@example.org', phone: '(555) 015-2048', neighborhood: 'Riverside', joined: at(-95), role: 'member', avatarColor: '#C4674F', volunteerHours: 12 },
  { id: 'm-9', name: 'Luis Ortega', email: 'luis.o@example.org', phone: '(555) 017-6671', neighborhood: 'Northgate', joined: at(-70), role: 'member', avatarColor: '#8A6BB0', volunteerHours: 5 },
  { id: 'm-10', name: 'Amara Diallo', email: 'amara.d@example.org', phone: '(555) 014-9902', neighborhood: 'Maple Heights', joined: at(-44), role: 'member', avatarColor: '#A0782A', volunteerHours: 8 },
  { id: 'm-11', name: 'Ben Fischer', email: 'ben.f@example.org', phone: '(555) 012-3389', neighborhood: 'Eastside', joined: at(-21), role: 'member', avatarColor: '#2F7A63', volunteerHours: 2 },
  { id: 'm-12', name: 'Naomi Park', email: 'naomi.p@example.org', phone: '(555) 016-1170', neighborhood: 'Riverside', joined: at(-9), role: 'member', avatarColor: '#4F7FA8', volunteerHours: 0 },
];

const programs: Program[] = [
  {
    id: 'p-pantry',
    title: 'Neighborhood Fresh Pantry',
    category: 'Food',
    summary: 'Weekly groceries and fresh produce for families, no paperwork required.',
    description:
      'Every week our volunteers stock a free, market-style pantry with produce from local farms, pantry staples and household basics. Families choose what they need, with dignity and without paperwork. Members can also sign up for home delivery during winter months.',
    schedule: 'Saturdays · 9:00 AM – 12:00 PM',
    location: 'Riverbend Commons Hall',
    ageGroup: 'All ages',
    capacity: 220,
    enrolled: 184,
    lead: 'Marisol Vega',
    icon: 'basket-outline',
    featured: true,
    outcomes: ['Weekly fresh produce box', 'Winter home delivery option', 'Seasonal cooking demos'],
  },
  {
    id: 'p-stem',
    title: 'Future Builders STEM Lab',
    category: 'Youth',
    summary: 'Hands-on robotics, coding and design for students in grades 5–9.',
    description:
      'Students work in small teams with volunteer mentors to build robots, write their first programs and design solutions to real neighborhood problems. Every season ends with a showcase night for families.',
    schedule: 'Tue & Thu · 4:00 – 6:00 PM',
    location: 'Riverbend Library, Lab B',
    ageGroup: 'Grades 5–9',
    capacity: 40,
    enrolled: 36,
    lead: 'Dr. Kenji Moore',
    icon: 'hardware-chip-outline',
    featured: true,
    outcomes: ['Build and program a robot', '1:1 volunteer mentor', 'End-of-season showcase'],
  },
  {
    id: 'p-esl',
    title: 'English Conversation Circles',
    category: 'Learning',
    summary: 'Friendly, small-group practice for adults learning English.',
    description:
      'Relaxed conversation groups led by trained volunteers. Practice everyday English for work, school meetings, doctor visits and more. Free childcare is available during evening sessions.',
    schedule: 'Mon & Wed · 6:30 – 8:00 PM',
    location: 'Community Center, Room 3',
    ageGroup: 'Adults 18+',
    capacity: 60,
    enrolled: 41,
    lead: 'Elena Petrov',
    icon: 'chatbubbles-outline',
    featured: false,
    outcomes: ['Small groups of 6–8', 'Free childcare evenings', 'Certificate of participation'],
  },
  {
    id: 'p-career',
    title: 'Career Launch Workshops',
    category: 'Learning',
    summary: 'Résumés, interview practice and job-search coaching for adults.',
    description:
      'A six-week series covering résumé writing, interview practice, digital skills and job-search strategy, with one-on-one coaching from local hiring managers who volunteer their time.',
    schedule: 'Thursdays · 6:00 – 7:30 PM',
    location: 'Riverbend Commons Hall',
    ageGroup: 'Adults 18+',
    capacity: 30,
    enrolled: 22,
    lead: 'Marcus Webb',
    icon: 'briefcase-outline',
    featured: true,
    outcomes: ['Polished résumé', 'Mock interviews', 'Employer meet-and-greet'],
  },
  {
    id: 'p-seniors',
    title: 'Golden Hour Wellness',
    category: 'Wellness',
    summary: 'Gentle movement, health checks and social time for older adults.',
    description:
      'Chair yoga, walking groups, free blood-pressure checks from volunteer nurses and a warm lunch together. Transportation can be arranged for members who need it.',
    schedule: 'Fridays · 10:00 AM – 1:00 PM',
    location: 'Community Center, Main Hall',
    ageGroup: 'Adults 60+',
    capacity: 50,
    enrolled: 47,
    lead: 'Nurse Patricia Hale',
    icon: 'heart-outline',
    featured: false,
    outcomes: ['Weekly movement class', 'Free health screenings', 'Shared lunch'],
  },
  {
    id: 'p-homework',
    title: 'After-School Homework Club',
    category: 'Youth',
    summary: 'A calm place to study with tutors, snacks and quiet space.',
    description:
      'Drop-in homework help for grades 1–8 with trained tutors, healthy snacks and a quiet reading corner. Parents receive a short weekly progress note.',
    schedule: 'Mon – Thu · 3:15 – 5:30 PM',
    location: 'Riverbend Elementary, Room 12',
    ageGroup: 'Grades 1–8',
    capacity: 80,
    enrolled: 63,
    lead: 'Jasmine Reed',
    icon: 'book-outline',
    featured: false,
    outcomes: ['Daily tutor support', 'Healthy snacks', 'Weekly parent updates'],
  },
  {
    id: 'p-housing',
    title: 'Home Repair Corps',
    category: 'Housing',
    summary: 'Free safety repairs for seniors and families who own their homes.',
    description:
      'Volunteer crews make small but critical repairs: grab bars, smoke detectors, weather-stripping and ramps. Requests are reviewed weekly and scheduled within a month.',
    schedule: 'Scheduled by request',
    location: 'In your home',
    ageGroup: 'Homeowners',
    capacity: 35,
    enrolled: 19,
    lead: 'Daniel Okafor',
    icon: 'hammer-outline',
    featured: false,
    outcomes: ['Free safety assessment', 'Repairs within 30 days', 'Follow-up check-in'],
  },
];

const events: CommunityEvent[] = [
  { id: 'e-harvest', title: 'Fall Harvest Festival', category: 'Community', date: at(6, 11), durationMins: 300, location: 'Riverbend Park Pavilion', address: '200 Riverside Dr.', description: 'Live music, a farmers market, pumpkin carving and free family activities. Bring the whole neighborhood!', capacity: 400, attending: 286, host: 'Riverbend Events Team', featured: true },
  { id: 'e-gala', title: 'Lights of Riverbend Gala', category: 'Fundraiser', date: at(20, 18, 30), durationMins: 210, location: 'The Grand Foundry', address: '18 Mill Street', description: 'An evening of dinner, stories from our programs and a silent auction. Every dollar raised funds next year’s youth programs.', capacity: 180, attending: 131, host: 'Board of Directors', featured: true },
  { id: 'e-pack', title: 'Pantry Packing Night', category: 'Volunteer', date: at(3, 17, 30), durationMins: 120, location: 'Riverbend Commons Hall', address: '45 Commons Way', description: 'Help pack 500 grocery boxes for Saturday’s pantry. No experience needed — pizza provided.', capacity: 40, attending: 28, host: 'Marisol Vega', featured: false },
  { id: 'e-budget', title: 'Family Budgeting 101', category: 'Workshop', date: at(9, 18), durationMins: 90, location: 'Community Center, Room 3', address: '12 Elm Avenue', description: 'A practical, judgment-free workshop on building a household budget and saving for emergencies.', capacity: 35, attending: 17, host: 'Riverbend Credit Union volunteers', featured: false },
  { id: 'e-cleanup', title: 'Riverside Cleanup Day', category: 'Volunteer', date: at(13, 9), durationMins: 180, location: 'Riverside Trailhead', address: 'Trail Lot B', description: 'Gloves, bags and coffee provided. Help us clear two miles of riverbank before winter.', capacity: 80, attending: 44, host: 'Green Riverbend', featured: false },
  { id: 'e-showcase', title: 'STEM Lab Showcase Night', category: 'Community', date: at(27, 18), durationMins: 120, location: 'Riverbend Library', address: '300 Library Lane', description: 'Students from Future Builders demo their robots and present community design projects.', capacity: 150, attending: 72, host: 'Future Builders STEM Lab', featured: false },
  { id: 'e-coat', title: 'Winter Coat Drive', category: 'Volunteer', date: at(34, 10), durationMins: 240, location: 'Riverbend Commons Hall', address: '45 Commons Way', description: 'Sort and distribute donated winter coats, hats and gloves to families across Riverbend.', capacity: 60, attending: 19, host: 'Riverbend Volunteers', featured: false },
];

const announcements: Announcement[] = [
  { id: 'a-1', title: 'Pantry hours extended for the holidays', body: 'Starting next month the Fresh Pantry will also open Wednesday evenings from 5–7 PM. Thank you to the 40 new volunteers who made this possible.', date: at(-1, 9), pinned: true, tag: 'Update' },
  { id: 'a-2', title: '$25,000 matching gift this season', body: 'A local family foundation will match every donation up to $25,000 through year-end. Your gift goes twice as far.', date: at(-3, 14), pinned: false, tag: 'News' },
  { id: 'a-3', title: 'Thank you, summer volunteers!', body: 'Together you logged 3,140 hours this summer, packed 9,800 grocery boxes and mentored 120 students.', date: at(-8, 12), pinned: false, tag: 'Thank you' },
];

const FUNDS = ['Where needed most', 'Fresh Pantry', 'Youth Programs', 'Home Repair Corps'];

function buildDonations(): Donation[] {
  const rand = rng(42);
  const list: Donation[] = [];
  const donors = members.filter((m) => m.role === 'member');
  for (let i = 0; i < 64; i++) {
    const daysAgo = Math.floor(rand() * 175) + 2;
    const donor = donors[Math.floor(rand() * donors.length)];
    const amounts = [10, 15, 25, 25, 50, 50, 75, 100, 100, 150, 250, 500];
    const amount = amounts[Math.floor(rand() * amounts.length)];
    const monthly = rand() < 0.3;
    list.push({
      id: `d-${i}`,
      memberId: donor.id === DEMO_MEMBER_ID ? null : donor.id,
      donorName: rand() < 0.15 ? 'Anonymous' : donor.name,
      amount,
      frequency: monthly ? 'monthly' : 'one-time',
      fund: FUNDS[Math.floor(rand() * FUNDS.length)],
      date: at(-daysAgo, 8 + Math.floor(rand() * 10)),
      receipt: `RCA-${(100200 + i).toString()}`,
    });
  }
  // Jordan's own (demo member) giving history.
  list.push(
    { id: 'd-j1', memberId: DEMO_MEMBER_ID, donorName: 'Jordan Ellis', amount: 50, frequency: 'monthly', fund: 'Fresh Pantry', date: at(-12, 9), receipt: 'RCA-100301' },
    { id: 'd-j2', memberId: DEMO_MEMBER_ID, donorName: 'Jordan Ellis', amount: 50, frequency: 'monthly', fund: 'Fresh Pantry', date: at(-42, 9), receipt: 'RCA-100288' },
    { id: 'd-j3', memberId: DEMO_MEMBER_ID, donorName: 'Jordan Ellis', amount: 120, frequency: 'one-time', fund: 'Youth Programs', date: at(-77, 15), receipt: 'RCA-100247' },
  );
  return list.sort((a, b) => b.date.localeCompare(a.date));
}

function buildEnrollments(): Enrollment[] {
  const rand = rng(7);
  const list: Enrollment[] = [
    { id: 'en-j1', memberId: DEMO_MEMBER_ID, programId: 'p-pantry', date: at(-120), status: 'active' },
    { id: 'en-j2', memberId: DEMO_MEMBER_ID, programId: 'p-career', date: at(-30), status: 'active' },
  ];
  members.forEach((m, mi) => {
    if (m.id === DEMO_MEMBER_ID || m.role === 'admin') return;
    programs.forEach((p, pi) => {
      if (rand() < 0.28) list.push({ id: `en-${mi}-${pi}`, memberId: m.id, programId: p.id, date: at(-Math.floor(rand() * 200) - 1), status: 'active' });
    });
  });
  return list;
}

const registrations: Registration[] = [
  { id: 'r-j1', memberId: DEMO_MEMBER_ID, eventId: 'e-harvest', date: at(-5), guests: 2, confirmation: 'EVT-48213' },
  { id: 'r-2', memberId: 'm-2', eventId: 'e-gala', date: at(-4), guests: 1, confirmation: 'EVT-48190' },
  { id: 'r-3', memberId: 'm-3', eventId: 'e-pack', date: at(-2), guests: 0, confirmation: 'EVT-48222' },
  { id: 'r-4', memberId: 'm-5', eventId: 'e-cleanup', date: at(-1), guests: 0, confirmation: 'EVT-48230' },
];

const notifications: Notification[] = [
  { id: 'n-1', memberId: DEMO_MEMBER_ID, title: 'Harvest Festival is this week', body: 'You and 2 guests are registered. We’ll save you a spot at the pumpkin patch!', date: at(-0.2, 8), read: false, icon: 'calendar-outline', link: '/event/e-harvest' },
  { id: 'n-2', memberId: DEMO_MEMBER_ID, title: 'Your monthly gift was received', body: 'Thank you! $50 to the Fresh Pantry helps feed four families this month.', date: at(-12, 9), read: false, icon: 'heart-outline' },
  { id: 'n-3', memberId: DEMO_MEMBER_ID, title: 'New session: Career Launch week 4', body: 'This Thursday: mock interviews with local hiring managers. Bring your résumé.', date: at(-2, 16), read: true, icon: 'briefcase-outline', link: '/program/p-career' },
];

export function createSeedState(): DemoState {
  return {
    version: SEED_VERSION,
    sessionMemberId: null,
    members,
    programs,
    events,
    announcements,
    donations: buildDonations(),
    enrollments: buildEnrollments(),
    registrations,
    notifications,
  };
}

export const DONATION_FUNDS = FUNDS;
