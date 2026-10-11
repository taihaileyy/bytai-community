/**
 * Fictional sample data for the demo. Every person, organization, email and
 * event here is made up (neighborhood and park names are real New Orleans
 * places, used for flavor). Dates are relative to "today" so the demo never
 * looks stale.
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

export const SEED_VERSION = 3;

export const ORG = {
  name: 'Crescent City Community Alliance',
  short: 'BYTAI Community',
  tagline: 'Stronger People. Brighter Futures.',
  mission: 'Real support. Real opportunities. A stronger New Orleans.',
  city: 'New Orleans, LA',
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

export const DEMO_MEMBER_ID = 'm-taylor';
export const DEMO_ADMIN_ID = 'm-avery';

const members: Member[] = [
  { id: DEMO_MEMBER_ID, name: 'Taylor Reed', email: 'taylor.reed@example.org', phone: '(555) 014-2290', neighborhood: 'Tremé', joined: at(-410), role: 'member', avatarColor: '#301438', volunteerHours: 24 },
  { id: DEMO_ADMIN_ID, name: 'Avery Brooks', email: 'avery@crescentcity.example.org', phone: '(555) 010-0001', neighborhood: 'Mid-City', joined: at(-1500), role: 'admin', avatarColor: '#101115', volunteerHours: 212 },
  { id: 'm-2', name: 'Priya Raman', email: 'priya.r@example.org', phone: '(555) 013-4471', neighborhood: 'Gentilly', joined: at(-300), role: 'member', avatarColor: '#301438', volunteerHours: 22 },
  { id: 'm-3', name: 'Marcus Webb', email: 'mwebb@example.org', phone: '(555) 016-8802', neighborhood: 'Central City', joined: at(-260), role: 'member', avatarColor: '#222329', volunteerHours: 51 },
  { id: 'm-4', name: 'Sofia Alvarez', email: 'sofia.a@example.org', phone: '(555) 011-9035', neighborhood: 'Bywater', joined: at(-220), role: 'member', avatarColor: '#301438', volunteerHours: 17 },
  { id: 'm-5', name: 'Daniel Okafor', email: 'd.okafor@example.org', phone: '(555) 018-3316', neighborhood: 'Algiers', joined: at(-190), role: 'member', avatarColor: '#222329', volunteerHours: 64 },
  { id: 'm-6', name: 'Grace Lin', email: 'grace.lin@example.org', phone: '(555) 012-7724', neighborhood: 'Marigny', joined: at(-150), role: 'member', avatarColor: '#301438', volunteerHours: 9 },
  { id: 'm-7', name: 'Theo Marsh', email: 'theo.m@example.org', phone: '(555) 019-5560', neighborhood: 'Uptown', joined: at(-120), role: 'member', avatarColor: '#222329', volunteerHours: 30 },
  { id: 'm-8', name: 'Hannah Cole', email: 'hcole@example.org', phone: '(555) 015-2048', neighborhood: 'Mid-City', joined: at(-95), role: 'member', avatarColor: '#301438', volunteerHours: 12 },
  { id: 'm-9', name: 'Luis Ortega', email: 'luis.o@example.org', phone: '(555) 017-6671', neighborhood: 'Gentilly', joined: at(-70), role: 'member', avatarColor: '#222329', volunteerHours: 5 },
  { id: 'm-10', name: 'Amara Diallo', email: 'amara.d@example.org', phone: '(555) 014-9902', neighborhood: 'Tremé', joined: at(-44), role: 'member', avatarColor: '#301438', volunteerHours: 8 },
  { id: 'm-11', name: 'Ben Fischer', email: 'ben.f@example.org', phone: '(555) 012-3389', neighborhood: 'Bywater', joined: at(-21), role: 'member', avatarColor: '#222329', volunteerHours: 2 },
  { id: 'm-12', name: 'Naomi Park', email: 'naomi.p@example.org', phone: '(555) 016-1170', neighborhood: 'Algiers', joined: at(-9), role: 'member', avatarColor: '#301438', volunteerHours: 0 },
];

const programs: Program[] = [
  {
    id: 'p-mentor',
    title: 'Youth Mentorship',
    category: 'Youth',
    summary: 'Guiding the next generation through education, leadership and faith.',
    description:
      'Our mentorship program provides education, life skills and spiritual guidance to help young people in New Orleans reach their full potential. Every mentee is paired with a trained adult mentor from their own community.',
    schedule: 'Weekly sessions · Tue 5–7 PM',
    location: 'Tremé Community Center, New Orleans',
    ageGroup: 'Ages 10–18',
    capacity: 60,
    enrolled: 52,
    lead: 'Marcus Webb',
    icon: 'people',
    photo: 'youthMural',
    gallery: ['bonfireCircle', 'books'],
    featured: true,
    outcomes: [
      { label: 'Academic Support', icon: 'book-outline' },
      { label: 'Life Skills Training', icon: 'construct-outline' },
      { label: 'Leadership Development', icon: 'person-outline' },
      { label: 'Positive Community', icon: 'heart-outline' },
    ],
  },
  {
    id: 'p-housing',
    title: 'Sober Living Housing',
    category: 'Housing',
    summary: 'Safe, supportive housing for those on the path to recovery.',
    description:
      'Structured, substance-free homes in Mid-City with house managers on site, weekly peer meetings and help finding work. Residents build the routines and relationships that make recovery last.',
    schedule: 'Rolling admission',
    location: 'Mid-City, New Orleans',
    ageGroup: 'Adults 18+',
    capacity: 24,
    enrolled: 21,
    lead: 'Daniel Okafor',
    icon: 'home',
    photo: 'balcony',
    gallery: ['streetcar', 'campfire'],
    featured: true,
    outcomes: [
      { label: 'Safe Housing', icon: 'home-outline' },
      { label: 'Peer Support', icon: 'people-outline' },
      { label: 'Recovery Coaching', icon: 'leaf-outline' },
      { label: 'Job Readiness', icon: 'briefcase-outline' },
    ],
  },
  {
    id: 'p-arts',
    title: 'Arts & Creative Expression',
    category: 'Arts',
    summary: 'Empowering creativity through the arts.',
    description:
      'Music, painting, spoken word and performance in a studio run by working New Orleans artists. Students finish each season with a public showcase in the Marigny.',
    schedule: 'Thursdays · 6–8 PM',
    location: 'Marigny Arts Studio, New Orleans',
    ageGroup: 'All ages',
    capacity: 40,
    enrolled: 33,
    lead: 'Elena Petrov',
    icon: 'color-palette',
    photo: 'sax',
    gallery: ['trumpet', 'crowd'],
    featured: true,
    outcomes: [
      { label: 'Music Lessons', icon: 'musical-notes-outline' },
      { label: 'Visual Arts', icon: 'color-palette-outline' },
      { label: 'Performance', icon: 'mic-outline' },
      { label: 'Artist Mentors', icon: 'star-outline' },
    ],
  },
  {
    id: 'p-workforce',
    title: 'Workforce Development',
    category: 'Workforce',
    summary: 'Job training, career resources and real opportunities.',
    description:
      'A twelve-week path to steady work: résumé coaching, interview practice, digital skills and introductions to local employers who are hiring.',
    schedule: 'Mon & Wed · 6–8 PM',
    location: 'Central City Career Hub, New Orleans',
    ageGroup: 'Adults 18+',
    capacity: 30,
    enrolled: 22,
    lead: 'Jasmine Reed',
    icon: 'briefcase',
    photo: 'laptop',
    gallery: ['deskLaptop', 'toast'],
    featured: true,
    outcomes: [
      { label: 'Résumé Coaching', icon: 'document-text-outline' },
      { label: 'Job Training', icon: 'construct-outline' },
      { label: 'Interview Prep', icon: 'chatbubbles-outline' },
      { label: 'Employer Network', icon: 'business-outline' },
    ],
  },
  {
    id: 'p-brass',
    title: 'Brass Band Academy',
    category: 'Arts',
    summary: 'Learn the music of the city from second-line musicians.',
    description:
      'Free instruments, weekly lessons and the chance to march in a real second line. Taught by brass band musicians who grew up in Tremé.',
    schedule: 'Saturdays · 10 AM–12 PM',
    location: 'Tremé, New Orleans',
    ageGroup: 'Grades 6–12',
    capacity: 35,
    enrolled: 35,
    lead: 'Andre Baptiste',
    icon: 'musical-notes',
    photo: 'trumpet',
    gallery: ['sax', 'crowd'],
    featured: false,
    outcomes: [
      { label: 'Free Instrument', icon: 'musical-note-outline' },
      { label: 'Weekly Lessons', icon: 'calendar-outline' },
      { label: 'Second Line', icon: 'walk-outline' },
      { label: 'Band Family', icon: 'people-outline' },
    ],
  },
  {
    id: 'p-homework',
    title: 'After-School Homework Club',
    category: 'Youth',
    summary: 'A calm place to study with tutors, snacks and quiet space.',
    description:
      'Drop-in homework help for grades 1–8 with trained tutors, healthy snacks and a reading corner. Parents get a short weekly progress note.',
    schedule: 'Mon–Thu · 3:15–5:30 PM',
    location: 'Gentilly Library, New Orleans',
    ageGroup: 'Grades 1–8',
    capacity: 80,
    enrolled: 63,
    lead: 'Grace Lin',
    icon: 'book',
    photo: 'books',
    gallery: ['youthMural', 'garden'],
    featured: false,
    outcomes: [
      { label: 'Tutor Support', icon: 'school-outline' },
      { label: 'Healthy Snacks', icon: 'nutrition-outline' },
      { label: 'Reading Corner', icon: 'book-outline' },
      { label: 'Parent Updates', icon: 'mail-outline' },
    ],
  },
];

const events: CommunityEvent[] = [
  { id: 'e-pack', title: 'Pantry Packing Night', category: 'Volunteer', date: at(3, 17, 30), durationMins: 120, location: 'Central City', address: 'Central City Food Hub, New Orleans', description: 'Help pack 500 grocery boxes for Saturday’s pantry. No experience needed — red beans and rice provided.', capacity: 40, attending: 28, host: 'Food & Resources Team', photo: 'produce', tags: ['Family'], featured: false },
  { id: 'e-harvest', title: 'Fall Harvest Festival', category: 'Community', date: at(6, 11), durationMins: 300, location: 'Louis Armstrong Park', address: 'Louis Armstrong Park, New Orleans, LA', description: 'A day of food, music, resources and community. Join us for a celebration of service, culture and opportunity.', capacity: 400, attending: 286, host: 'BYTAI Community Events Team', photo: 'crowd', tags: ['Family'], featured: true },
  { id: 'e-budget', title: 'Family Budgeting 101', category: 'Workshop', date: at(9, 18), durationMins: 90, location: 'Virtual (Zoom)', address: 'Link sent after registration', description: 'A practical, judgment-free workshop on building a household budget and saving for emergencies.', capacity: 55, attending: 48, host: 'Crescent City Credit Union volunteers', photo: 'deskLaptop', featured: false },
  { id: 'e-cleanup', title: 'Community Clean-Up', category: 'Volunteer', date: at(15, 8), durationMins: 240, location: 'Bywater', address: 'Crescent Park entrance, Bywater', description: 'Gloves, bags and coffee provided. Help us clear the riverfront and neighborhood streets before the holidays.', capacity: 160, attending: 124, host: 'Green NOLA Volunteers', photo: 'river', featured: false },
  { id: 'e-gala', title: 'Crescent Lights Gala', category: 'Fundraiser', date: at(20, 18, 30), durationMins: 210, location: 'The Foundry, Warehouse District', address: '18 Tchoupitoulas St, New Orleans', description: 'An evening of dinner, live jazz and stories from our programs. Every dollar raised funds next year’s youth programs.', capacity: 180, attending: 131, host: 'Board of Directors', photo: 'lights', featured: true },
  { id: 'e-secondline', title: 'Second Line Sunday', category: 'Community', date: at(27, 13), durationMins: 180, location: 'Tremé', address: 'Starts at Tremé Community Center', description: 'March with the Brass Band Academy students in their first second line of the season. Everyone welcome.', capacity: 500, attending: 212, host: 'Brass Band Academy', photo: 'sax', tags: ['Family'], featured: false },
  // Past events (for the Past filter)
  { id: 'e-backpack', title: 'Back-to-School Backpack Drive', category: 'Volunteer', date: at(-24, 9), durationMins: 180, location: 'Gentilly', address: 'Gentilly Library, New Orleans', description: '600 backpacks filled and handed out to students across Gentilly and Mid-City.', capacity: 120, attending: 117, host: 'Youth Programs Team', photo: 'books', featured: false },
  { id: 'e-jazz', title: 'Summer Jazz Picnic', category: 'Fundraiser', date: at(-48, 17), durationMins: 180, location: 'City Park', address: 'City Park, New Orleans', description: 'Live music and a community picnic that raised $14,200 for the Arts program.', capacity: 300, attending: 274, host: 'Arts & Creative Expression', photo: 'trumpet', featured: false },
];

const announcements: Announcement[] = [
  { id: 'a-1', title: 'Pantry hours extended for the holidays', body: 'Starting next month the Central City pantry also opens Wednesday evenings from 5–7 PM. Thank you to the 40 new volunteers who made this possible.', date: at(-1, 9), pinned: true, tag: 'Update' },
  { id: 'a-2', title: '$25,000 matching gift this season', body: 'A local family foundation will match every donation up to $25,000 through year-end. Your gift goes twice as far.', date: at(-3, 14), pinned: false, tag: 'News' },
  { id: 'a-3', title: 'Thank you, summer volunteers!', body: 'Together you logged 3,140 hours this summer, packed 9,800 grocery boxes and mentored 120 students.', date: at(-8, 12), pinned: false, tag: 'Thank you' },
];

export const DONATION_FUNDS = [
  'Food & essential resources',
  'Youth programs',
  'Housing support',
  'Arts & cultural initiatives',
  'Community events',
];

function buildDonations(): Donation[] {
  const rand = rng(42);
  const list: Donation[] = [];
  const donors = members.filter((m) => m.role === 'member' && m.id !== DEMO_MEMBER_ID);
  for (let i = 0; i < 64; i++) {
    const daysAgo = Math.floor(rand() * 175) + 2;
    const donor = donors[Math.floor(rand() * donors.length)];
    const amounts = [10, 15, 25, 25, 50, 50, 75, 100, 100, 150, 250, 500];
    const amount = amounts[Math.floor(rand() * amounts.length)];
    const monthly = rand() < 0.3;
    list.push({
      id: `d-${i}`,
      memberId: donor.id,
      donorName: rand() < 0.15 ? 'Anonymous' : donor.name,
      amount,
      frequency: monthly ? 'monthly' : 'one-time',
      fund: DONATION_FUNDS[Math.floor(rand() * DONATION_FUNDS.length)],
      date: at(-daysAgo, 8 + Math.floor(rand() * 10)),
      receipt: `CCA-${(100200 + i).toString()}`,
    });
  }
  list.push(
    { id: 'd-t1', memberId: DEMO_MEMBER_ID, donorName: 'Taylor Reed', amount: 50, frequency: 'monthly', fund: 'Youth programs', date: at(-12, 9), receipt: 'CCA-100301' },
    { id: 'd-t2', memberId: DEMO_MEMBER_ID, donorName: 'Taylor Reed', amount: 50, frequency: 'monthly', fund: 'Youth programs', date: at(-42, 9), receipt: 'CCA-100288' },
    { id: 'd-t3', memberId: DEMO_MEMBER_ID, donorName: 'Taylor Reed', amount: 120, frequency: 'one-time', fund: 'Food & essential resources', date: at(-77, 15), receipt: 'CCA-100247' },
  );
  return list.sort((a, b) => b.date.localeCompare(a.date));
}

function buildEnrollments(): Enrollment[] {
  const rand = rng(7);
  const list: Enrollment[] = [
    { id: 'en-t1', memberId: DEMO_MEMBER_ID, programId: 'p-arts', date: at(-120), status: 'active' },
    { id: 'en-t2', memberId: DEMO_MEMBER_ID, programId: 'p-workforce', date: at(-30), status: 'active' },
  ];
  members.forEach((m, mi) => {
    if (m.id === DEMO_MEMBER_ID || m.role === 'admin') return;
    programs.forEach((p, pi) => {
      if (rand() < 0.3) list.push({ id: `en-${mi}-${pi}`, memberId: m.id, programId: p.id, date: at(-Math.floor(rand() * 200) - 1), status: 'active' });
    });
  });
  return list;
}

const registrations: Registration[] = [
  { id: 'r-t1', memberId: DEMO_MEMBER_ID, eventId: 'e-harvest', date: at(-5), guests: 2, confirmation: 'EVT-48213' },
  { id: 'r-t2', memberId: DEMO_MEMBER_ID, eventId: 'e-cleanup', date: at(-3), guests: 0, confirmation: 'EVT-48227' },
  { id: 'r-t3', memberId: DEMO_MEMBER_ID, eventId: 'e-jazz', date: at(-60), guests: 1, confirmation: 'EVT-47702' },
  { id: 'r-2', memberId: 'm-2', eventId: 'e-gala', date: at(-4), guests: 1, confirmation: 'EVT-48190' },
  { id: 'r-3', memberId: 'm-3', eventId: 'e-pack', date: at(-2), guests: 0, confirmation: 'EVT-48222' },
  { id: 'r-4', memberId: 'm-5', eventId: 'e-cleanup', date: at(-1), guests: 0, confirmation: 'EVT-48230' },
];

const notifications: Notification[] = [
  { id: 'n-1', memberId: DEMO_MEMBER_ID, title: 'Fall Harvest Festival is this week', body: 'You and 2 guests are registered. See you at Louis Armstrong Park!', date: at(-0.2, 8), read: false, icon: 'calendar-outline', link: '/event/e-harvest' },
  { id: 'n-2', memberId: DEMO_MEMBER_ID, title: 'Your monthly gift was received', body: 'Thank you! $50 to Youth programs funds a month of mentoring sessions.', date: at(-12, 9), read: false, icon: 'heart-outline' },
  { id: 'n-3', memberId: DEMO_MEMBER_ID, title: 'New studio night: Arts & Creative Expression', body: 'This Thursday: open mic and gallery walk. Bring a friend.', date: at(-2, 16), read: false, icon: 'color-palette-outline', link: '/program/p-arts' },
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

/**
 * Headline "sample" figures shown on Home, Impact and Admin. The live demo
 * data nudges them (new gifts, enrollments, RSVPs), starting from these.
 */
export const SAMPLE = {
  familiesSupported: 2232,
  mealsShared: 49054,
  volunteerHours: 12870,
  investedInNola: 188000,
  totalMembers: 1248,
  eventRegistrations: 286,
  donationsThisMonth: 12450,
  programEnrollments: 38,
};
