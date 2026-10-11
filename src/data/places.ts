/**
 * Fictional locations for the Community Map demo. Coordinates are positions
 * on the illustrated map (0–1), not real GPS points.
 */
import type { PhotoKey } from './photos';

export type PlaceKind = 'Programs' | 'Events' | 'Resources';

export interface Place {
  id: string;
  kind: PlaceKind;
  name: string;
  tags: string[];
  miles: number;
  x: number;
  y: number;
  photo: PhotoKey;
  /** Route to open, if the place maps to a program or event. */
  href?: string;
  hours?: string;
}

export const PLACES: Place[] = [
  { id: 'pl-1', kind: 'Programs', name: 'Tremé Community Center', tags: ['Programs', 'Mentorship', 'Events'], miles: 1.2, x: 0.47, y: 0.47, photo: 'youthMural', href: '/program/p-mentor', hours: 'Mon–Sat · 9 AM–8 PM' },
  { id: 'pl-2', kind: 'Programs', name: 'Marigny Arts Studio', tags: ['Arts', 'Music', 'Workshops'], miles: 2.0, x: 0.63, y: 0.44, photo: 'sax', href: '/program/p-arts', hours: 'Tue–Sun · 12–9 PM' },
  { id: 'pl-3', kind: 'Programs', name: 'Central City Career Hub', tags: ['Workforce', 'Job training'], miles: 2.4, x: 0.36, y: 0.63, photo: 'laptop', href: '/program/p-workforce', hours: 'Mon–Fri · 9 AM–7 PM' },
  { id: 'pl-4', kind: 'Programs', name: 'Gentilly Library', tags: ['Youth', 'Homework Club'], miles: 3.1, x: 0.58, y: 0.2, photo: 'books', href: '/program/p-homework', hours: 'Mon–Thu · 3–6 PM' },
  { id: 'pl-5', kind: 'Events', name: 'Louis Armstrong Park', tags: ['Fall Harvest Festival'], miles: 1.4, x: 0.5, y: 0.52, photo: 'crowd', href: '/event/e-harvest' },
  { id: 'pl-6', kind: 'Events', name: 'Crescent Park, Bywater', tags: ['Community Clean-Up'], miles: 2.7, x: 0.75, y: 0.5, photo: 'river', href: '/event/e-cleanup' },
  { id: 'pl-7', kind: 'Events', name: 'Central City Food Hub', tags: ['Pantry Packing Night'], miles: 2.2, x: 0.31, y: 0.67, photo: 'produce', href: '/event/e-pack' },
  { id: 'pl-8', kind: 'Resources', name: 'Riverside Food Pantry', tags: ['Food', 'Essentials'], miles: 1.8, x: 0.42, y: 0.74, photo: 'produce', hours: 'Sat · 9 AM–12 PM' },
  { id: 'pl-9', kind: 'Resources', name: 'Algiers Family Clinic', tags: ['Health', 'Free screenings'], miles: 3.6, x: 0.6, y: 0.86, photo: 'elder', hours: 'Mon–Fri · 8 AM–5 PM' },
  { id: 'pl-10', kind: 'Resources', name: 'Mid-City Housing Desk', tags: ['Housing', 'Recovery support'], miles: 2.9, x: 0.28, y: 0.4, photo: 'balcony', href: '/program/p-housing', hours: 'Mon–Fri · 10 AM–6 PM' },
];
