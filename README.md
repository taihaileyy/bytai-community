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
  **Me → Reset demo data**.

---

## 1. Run it from your iPad (GitHub Codespaces + Expo Go)

You need: your iPad (Safari), your iPhone, and the free **Expo Go** app on the
iPhone ([App Store](https://apps.apple.com/app/expo-go/id982107779)).

### One-time setup

1. On the iPad, open **github.com/taihaileyy/bytai-community** in Safari.
2. Tap **Code → Codespaces → Create codespace on main**.
3. (That's it — there's nothing else to pick.)
4. Wait for the editor to open. The first start runs `npm install`
   automatically (see `.devcontainer/devcontainer.json`). It takes a few
   minutes; you'll see the terminal finish with "added … packages".

### Every time you want to test on your iPhone

1. In the Codespace, open the terminal (**☰ → Terminal → New Terminal**) and run:

   ```bash
   npm run tunnel
   ```

   `--tunnel` is required: your iPhone can't reach the Codespace directly, so
   Expo opens a secure public tunnel. Wait until you see a **QR code** and a
   line like `› Metro waiting on exp://xxxx-anonymous-8081.exp.direct`.

2. On the **iPhone**, open the **Camera** app and point it at the QR code on
   your iPad screen. Tap the **"Open in Expo Go"** banner.
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

1. **Home** — personalized greeting, mission, animated impact numbers,
   featured programs carousel, upcoming events, announcements.
2. **Programs** — search ("STEM"), filter by category, open a program.
   Tap **Sign in to enroll** → pick **Jordan Ellis** → **Enroll now** →
   animated confirmation. Back on the program, it now shows "You're enrolled".
3. **Events** — switch to **Calendar**, tap a day with a dot, open an event,
   add a guest with **+**, **RSVP** → confirmation with a check-in code.
4. **Give** — choose Monthly, type a custom amount, pick a fund →
   **Continue** → clearly labeled **demo checkout** → thank-you screen.
5. **Me** — profile, enrolled programs, registered events, giving history and
   notifications (new ones appeared for each action above).
6. **Admin** — sign out, sign in as **Avery Brooks (admin)**. Show the
   dashboard charts, expand a member, filter donations, **create an event**
   and **post an announcement**, then go back to the member app: the new event
   and announcement are already on Home.
7. **Me → Reset demo data** before the next meeting.

---

## 3. What's inside

```
.
├── .devcontainer/           # Codespaces setup (installs packages automatically)
├── app.json                 # Expo config (name, icon, splash, plugins)
├── src/
│   ├── app/                 # Screens. Every file is a route (Expo Router)
│   │   ├── _layout.tsx      # Fonts, splash, data provider, root stack
│   │   ├── (tabs)/          # Home · Programs · Events · Give · Me
│   │   ├── program/[id].tsx # Program detail + enroll
│   │   ├── event/[id].tsx   # Event detail + RSVP
│   │   ├── checkout.tsx     # Simulated checkout (modal)
│   │   ├── confirm.tsx      # Shared animated confirmation screen
│   │   ├── sign-in.tsx      # Demo sign-in (modal)
│   │   ├── notifications.tsx, announcements.tsx, donations.tsx
│   │   └── admin/           # Separate dark-themed admin console
│   ├── components/          # UI kit (ui.tsx), cards & charts (domain.tsx), motion
│   ├── data/                # Types (types.ts) and fictional seed data (seed.ts)
│   ├── services/            # auth.ts, payments.ts, storage.ts (swap points)
│   ├── store/               # App state: reducer + React context + hooks
│   ├── theme/               # Colors, fonts, spacing; light app / dark admin
│   └── utils/               # Formatting and dialogs
└── docs/BACKEND.md          # How to add Supabase + real payments later
```

**Design system:** Fraunces headlines, Work Sans body, IBM Plex Mono labels
(the builtbyTAI type set). The member app uses a warm paper palette with
muted greens; the admin console uses the dark builtbyTAI palette so it feels
like a separate tool.

**How data flows:** screens never touch storage. They call hooks/actions from
`src/store/AppStore.tsx`, which go through `src/services/*`. Replacing the
local services with Supabase and Stripe is described in
[`docs/BACKEND.md`](docs/BACKEND.md).

## 4. Turning the demo into a real client app

See [`docs/BACKEND.md`](docs/BACKEND.md) for the Supabase schema, auth swap
and payment integration. For App Store / Play Store builds without a Mac, use
**EAS Build** (`npx eas-cli@latest build`), which builds in Expo's cloud.
