# Adding a real backend later

The demo is wired so a real backend replaces three small files, not the
screens:

| Concern | Demo today | Production swap |
|---|---|---|
| Data | `src/services/storage.ts` (on-device AsyncStorage) | Supabase Postgres via `@supabase/supabase-js` |
| Sign-in | `src/services/auth.ts` (picks a sample account) | Supabase Auth (email magic link or password) |
| Payments | `src/services/payments.ts` (`demoPaymentProvider`) | Stripe via a Supabase Edge Function |

The domain types in `src/data/types.ts` already match the tables below.

## 1. Supabase tables

```sql
create table members (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  email text not null,
  phone text,
  neighborhood text,
  role text not null default 'member' check (role in ('member','admin')),
  volunteer_hours int not null default 0,
  joined timestamptz not null default now()
);

create table programs (
  id text primary key,
  title text not null, category text not null, summary text, description text,
  schedule text, location text, age_group text, lead text, icon text,
  capacity int not null, enrolled int not null default 0,
  featured boolean not null default false, outcomes text[] not null default '{}'
);

create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null, category text not null, date timestamptz not null,
  duration_mins int not null default 60, location text, address text,
  description text, capacity int not null, attending int not null default 0,
  host text, featured boolean not null default false, cancelled boolean not null default false
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null, body text not null,
  tag text not null check (tag in ('News','Update','Urgent','Thank you')),
  pinned boolean not null default false, date timestamptz not null default now()
);

create table enrollments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members on delete cascade,
  program_id text not null references programs on delete cascade,
  status text not null default 'active' check (status in ('active','waitlist')),
  date timestamptz not null default now(),
  unique (member_id, program_id)
);

create table registrations (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members on delete cascade,
  event_id uuid not null references events on delete cascade,
  guests int not null default 0 check (guests between 0 and 4),
  confirmation text not null,
  date timestamptz not null default now(),
  unique (member_id, event_id)
);

create table donations (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members on delete set null,
  donor_name text not null, amount numeric(10,2) not null,
  frequency text not null check (frequency in ('one-time','monthly')),
  fund text not null, receipt text not null,
  stripe_payment_id text,              -- written only by the Edge Function
  date timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members on delete cascade,
  title text not null, body text not null, icon text, link text,
  read boolean not null default false, date timestamptz not null default now()
);
```

### Row Level Security (turn it on for every table)

```sql
alter table members enable row level security;  -- repeat for each table

create function is_admin() returns boolean language sql stable security definer
set search_path = public as $$
  select exists (select 1 from members where id = auth.uid() and role = 'admin')
$$;

-- Everyone signed in can read the public catalog
create policy "read programs" on programs for select to authenticated using (true);
create policy "read events"   on events   for select to authenticated using (true);
create policy "read news"     on announcements for select to authenticated using (true);

-- Members see and change only their own rows
create policy "own enrollments" on enrollments for all to authenticated
  using (member_id = auth.uid()) with check (member_id = auth.uid());
create policy "own registrations" on registrations for all to authenticated
  using (member_id = auth.uid()) with check (member_id = auth.uid());
create policy "own notifications" on notifications for all to authenticated
  using (member_id = auth.uid()) with check (member_id = auth.uid());
create policy "own donations" on donations for select to authenticated
  using (member_id = auth.uid());

-- Admins manage everything
create policy "admin all events" on events for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all news"   on announcements for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin read members" on members for select to authenticated using (is_admin() or id = auth.uid());
create policy "admin read donations" on donations for select to authenticated using (is_admin());
create policy "admin read enrollments" on enrollments for select to authenticated using (is_admin());
```

Seat counts (`programs.enrolled`, `events.attending`) should be kept in sync
with triggers or computed in a view, not written by the app.

## 2. Wiring it in

1. `npx expo install @supabase/supabase-js react-native-url-polyfill`
   (both work in Expo Go).
2. Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to a
   `.env` file (never the service-role key — it must stay server-side).
3. Create `src/services/supabase.ts` with `createClient(url, anonKey, { auth: { storage: AsyncStorage, persistSession: true, detectSessionInUrl: false } })`.
4. **Auth:** replace `demoSignIn` in `src/services/auth.ts` with
   `supabase.auth.signInWithOtp({ email })` and map `auth.uid()` to `members.id`.
5. **Data:** in `src/store/AppStore.tsx`, load initial state with `select`
   queries instead of `localAdapter.load()`, and make each action call
   Supabase (e.g. `enroll` → `insert into enrollments`) before dispatching.
   Screens stay the same.

## 3. Payments (Stripe)

- Never collect card numbers in the app UI. Use Stripe's hosted Checkout
  (open with `expo-web-browser`) or Stripe's React Native SDK in a
  development build.
- A Supabase Edge Function creates the Checkout Session / PaymentIntent with
  the secret key, and a Stripe webhook function writes the `donations` row
  after payment succeeds.
- Implement `PaymentProvider` in `src/services/payments.ts` with a
  `stripePaymentProvider` and point `paymentProvider` at it.
- Apple requires donations to registered nonprofits to go through approved
  flows (Apple Pay or an external web page). Check App Store Review
  Guideline 3.2.1(vi) before shipping.
