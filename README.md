# ByTAI Community — portfolio demo app

A fully interactive nonprofit mobile app built by **builtbyTAI** (Tailored
Automation & Integrations) to show prospective clients what a custom mobile
app can look and feel like. It runs on iPhone and Android through **Expo Go**,
with no Mac, Xcode or Android Studio needed.

> **This is a demo.** Every person, organization, number and payment in the
> app is fictional. The app is labeled "ByTAI Demo" throughout, checkout is
> simulated (no card details are ever collected), and sign-in uses sample
> accounts.

- **Stack:** React Native 0.86 · Expo SDK 57 · Expo Router · TypeScript
- **No custom native code:** every dependency ships inside Expo Go.
- **Data:** realistic sample data in `src/data/seed.ts`, saved on the phone
  (AsyncStorage) so changes survive a reload. Reset any time from
  **More → Settings → Reset demo data**.

---

## 1. Run it from your iPad (GitHub Codespaces + Expo Go)

You need: your iPad (Safari), your iPhone, the free **Expo Go** app on the
iPhone ([App Store](https://apps.apple.com/app/expo-go/id982107779)), and a
free **Expo account** ([expo.dev/signup](https://expo.dev/signup)). Expo Go
only opens tunneled projects when the **same Expo account** is signed in on
the Codespace and on the phone.

### One-time setup

1. On the iPad, open **github.com/taihaileyy/bytai-community** in Safari.
2. Tap **Code → Codespaces → Create codespace on main**.
3. (That's it — there's nothing else to pick.)
4. Wait for the editor to open. The first start runs `npm install`
   automatically (see `.devcontainer/devcontainer.json`). It takes a few
   minutes; you'll see the terminal finish with "added … packages".
5. Sign in to Expo in the Codespace terminal (once per Codespace):

   ```bash
   npx expo login
   ```

   Type your Expo username/email and password (the password stays invisible
   while typing). It should say "Logged in as …".
6. On the iPhone, open Expo Go → profile icon → sign in with the **same**
   Expo account.

### Every time you want to test on your iPhone

1. In the Codespace, open the terminal (**☰ → Terminal → New Terminal**) and run:

   ```bash
   npm run tunnel
   ```

   `--tunnel` is required: your iPhone can't reach the Codespace directly, so
   Expo opens a secure public tunnel. Wait until you see a **QR code** and a
   line like `› Metro waiting on exp://xxxx-anonymous-8081.exp.direct`.

2. On the **iPhone**, open the **Camera** app and point it at the QR code on
   your iPad screen. Tap the **"Open in Expo Go"** banner. (When you're signed
   in on both sides, the project also appears in Expo Go under
   **Development servers**, so you can just tap it.)
   - No QR? Open Expo Go, tap **Enter URL manually**, and type the
     `exp://….exp.direct` address from the terminal.
3. The first load bundles the app (~30–60 s). After that, every file you save
   in the Codespace reloads the app on your phone in about a second.
4. Shake the iPhone to open the Expo menu (reload, performance monitor, etc.).

### Quick preview in Safari (no phone)

Run `npm run web` in the Codespace. When the "port 8081" pop-up appears, tap
**Open in Browser**. Good for fast layout checks; always do the final check on
the phone, because that's what clients see.

### Troubleshooting

| Problem | Fix |
|---|---|
| Expo Go: "You need to be signed in to Expo Go and Expo CLI" | Run `npx expo login` in the Codespace and sign in to Expo Go with the same account, then restart `npm run tunnel`. |
| Terminal shows "ERROR … React Native DevTools … libnspr4.so" | Harmless. The desktop debugger can't open in a Codespace; the app and Expo Go are unaffected. |
| Expo Go says the project needs a newer/older SDK | Update Expo Go from the App Store. This app uses SDK 57. |
| `npm run tunnel` hangs or says "ngrok tunnel took too long" | Press `Ctrl+C` and run it again. Tunnels occasionally fail to start. |
| "Port 8081 is being used" | Answer **Y** to use another port, or close the old terminal running Expo. |
| Phone shows an old version | Shake the phone → **Reload**. Or stop Expo and run `npx expo start --tunnel --clear`. |
| Codespace stopped | Codespaces sleep after ~30 min idle. Reopen it from github.com → Code → Codespaces, then run `npm run tunnel` again. |

Useful commands:

```bash
npm run tunnel      # start for Expo Go on a phone
npm run web         # browser preview
npm run typecheck   # TypeScript check
npm run doctor      # Expo's project health check
```

---

## 2. Demo script for client consultations (≈5 minutes)

1. **Home** — streetcar hero, “Stronger People. Brighter Futures.”, impact
   numbers (tap for Our Impact), What’s Happening, programs, map and news.
2. **Programs** — filter Youth / Housing / Arts / Workforce, open **Youth
   Mentorship**, tap **Sign In to Enroll** → **Taylor Reed** → **Enroll Now**
   → animated confirmation. The program now shows as enrolled.
3. **Events** — try Upcoming / My Events / Past and the calendar icon. Open
   **Family Budgeting 101**, add a guest with **+**, **Register Now** →
   check-in code.
4. **Give** — Monthly, pick an amount, choose what your gift supports →
   **Continue to Give** → clearly labeled **demo checkout** → thank-you.
5. **More (Profile)** — My Programs, My Events, My Donations, Notifications
   (new ones appeared for each action), then **Community Near You** (tap a
   gold marker) and **Our Impact**.
6. **Admin** — Settings → Sign out, sign in as **Avery Brooks (admin)**.
   Overview (switch This Month / This Year), Recent Activity, then Events →
   **Create Event** with a cover photo, and Announcements → publish. Back in
   the member app the new event and announcement are already there.
7. **More → Settings → Reset demo data** before the next meeting.

---

## 3. What's inside

```
.
├── .devcontainer/           # Codespaces setup (installs packages automatically)
├── app.json                 # Expo config (name, icon, splash, plugins)
├── src/
│   ├── app/                 # Screens. Every file is a route (Expo Router)
│   │   ├── _layout.tsx      # Fonts, splash, data provider, root stack
│   │   ├── (tabs)/          # Home · Programs · Events · Give · Profile
│   │   ├── program/[id].tsx # Program detail + enroll
│   │   ├── event/[id].tsx   # Event detail + RSVP
│   │   ├── checkout.tsx     # Simulated checkout (modal)
│   │   ├── confirm.tsx      # Shared animated confirmation screen
│   │   ├── sign-in.tsx      # Demo sign-in (modal)
│   │   ├── notifications.tsx, announcements.tsx, donations.tsx
│   │   └── admin/           # Separate dark-themed admin console
│   ├── components/          # UI kit (ui.tsx), cards & charts (domain.tsx), TabBar, Photo, motion
│   ├── data/                # Types, fictional seed data, photo library (photos.ts)
│   ├── services/            # auth.ts, payments.ts, storage.ts (swap points)
│   ├── store/               # App state: reducer + React context + hooks
│   ├── theme/               # Colors, type, spacing, radius, elevation tokens
│   └── utils/               # Formatting and dialogs
└── docs/BACKEND.md          # How to add Supabase + real payments later
```

**Design system** (`src/theme/index.ts`, `src/components/ui.tsx`): New
Orleans-inspired — midnight `#101115`, champagne gold `#E5B76B`, royal purple
`#301438`, warm ivory `#F8F3EB`, charcoal `#222329`. Playfair Display for
headings, Great Vibes script for flourishes ("Give Back to NOLA"), Inter for
reading, gold fleur-de-lis accents. Gold is the call-to-action on dark
screens, purple on ivory. Components read a light/dark tone from
`ToneProvider`, so the same kit renders the ivory member screens and the
midnight Programs, Map, Impact and Admin screens. Subtle motion throughout:
parallax photo headers, fade-ins, press feedback, sliding toggles, count-up
statistics, springy tab icons.

**Screens** (matching the 10-screen reference): Home · Programs · Program
Details · Events (Upcoming / My Events / Past, plus a calendar view) · Give ·
Profile ("More" tab) · Event Details · Community Map (`/map`) · Our Impact
(`/impact`) · Admin Dashboard (`/admin`), plus checkout, confirmations,
sign-in, notifications, news, My Programs, My Events, Settings and the admin
sub-pages (Members, Programs, Events, Reporting, Announcements, event editor).

**Community Map** is an illustrated demo map (`src/components/NolaMap.tsx`,
drawn with `react-native-svg`) with fictional locations from
`src/data/places.ts` — no map API or key required. It is labeled as a demo
on screen. A real map (react-native-maps / Mapbox) can replace it later.

**Photography** (`src/data/photos.ts`):
- The four New Orleans photos (streetcar, youth mural, French Quarter
  balcony, "Give Back to NOLA" sign) ship inside the app in
  `assets/photos/`. They were cropped from the design reference, so they are
  **preview resolution** — replace them with the full-size originals using
  the same file names and nothing else needs to change.
- The rest are [Unsplash](https://unsplash.com/license) photos (free to use)
  loaded from Unsplash's CDN with a blurhash preview (the phone needs
  internet). Swap any entry in `photos.ts` for a bundled image later.

**Sample figures**: impact and admin numbers start at the reference's sample
values (`SAMPLE` in `src/data/seed.ts`) and move as you enroll, register and
donate in the demo. They're labeled "sample data" in the app.

**How data flows:** screens never touch storage. They call hooks/actions from
`src/store/AppStore.tsx`, which go through `src/services/*`. Replacing the
local services with Supabase and Stripe is described in
[`docs/BACKEND.md`](docs/BACKEND.md).

## 4. Turning the demo into a real client app

See [`docs/BACKEND.md`](docs/BACKEND.md) for the Supabase schema, auth swap
and payment integration. For App Store / Play Store builds without a Mac, use
**EAS Build** (`npx eas-cli@latest build`), which builds in Expo's cloud.
