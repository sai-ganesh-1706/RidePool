# 🚗 RidePool — hostel ride sharing

Post where you're going, get matched with students heading the same way, and once you're matched
the app shows **your auto driver's name and phone number with a one-tap call button**.

```
ridepool/
├── server/                     Node.js + Express + Prisma + Socket.io
│   ├── prisma/                 schema.prisma, seed.js
│   └── src/
│       ├── config/             env validation, prisma client
│       ├── middleware/         auth, validation, error handling
│       ├── utils/              ApiError, asyncHandler, JWT helpers
│       ├── jobs/               expire stale rides
│       └── modules/            auth · rides · drivers · locations · chat
│           └── <module>/       *.routes → *.controller → *.service (+ *.schema)
└── mobile/                     Expo (React Native) + expo-router
    ├── app/                    screens / routes  ((auth), (tabs), ride/*, driver/*)
    └── src/                    api · components · context · hooks · theme · utils
```

## How matching + driver assignment works

1. A student posts a ride (pickup → destination, time, max riders). Before posting, the app looks for
   open rides on the same route within ±30 min and offers to join one instead.
2. When a **second rider joins**, the ride becomes **MATCHED** and the server auto-assigns a verified driver
   (not already booked ±30 min, best rating first, then fewest rides).
3. Riders of a matched ride see the driver's name, vehicle and phone, plus a **Call** button.
   Driver phone numbers are never sent to non-riders.
4. The organiser can change the driver, complete the ride (enter total fare → equal split), and mark who paid.
5. After completion, riders can rate the driver. Riders get a group chat per ride.

If riders drop below 2, the ride goes back to OPEN and the driver is released.

## Admin access

Admins use the **same login screen** and land on an admin area (pending drivers → Verify / Reject, all drivers, profile).
To make someone an admin, put their email in `ADMIN_EMAILS` (server `.env` / Render) and have them sign up or log in again —
the role is synced on every login, so removing an email also removes admin access. Students never see the admin screens.

## 1 · Run the backend

```bash
cd server
npm install
npm run db:push     # creates tables in Neon
npm run db:seed     # locations + SAMPLE drivers (replace them, see below)
npm run dev         # http://localhost:4000  (GET /health)
```

`server/.env` is already filled in with your Neon URLs and a generated JWT secret.
Optional settings there: `ALLOWED_EMAIL_DOMAIN` (e.g. `iiits.in`) restricts sign-ups to college emails;
`ADMIN_EMAILS` makes those accounts admins (they can verify drivers added by students).

**Real drivers:** edit `server/prisma/seed.js` or sign up with an admin email and add drivers in the app.
Only *verified* drivers are auto-assigned. Delete the three "(sample)" drivers before sharing the app.

## 2 · Test in Expo Go

The phone can't reach `localhost`. Either use your computer's Wi-Fi IP, or deploy the API first (step 3).

```bash
cd mobile
cp .env.example .env        # set EXPO_PUBLIC_API_URL=http://<your-LAN-IP>:4000
npm install
npm run setup               # installs SDK-matched expo packages + axios + socket.io-client
npx expo start
```

Scan the QR code with Expo Go. Phone and computer must be on the same Wi-Fi (allow port 4000 in your firewall).
`package.json` targets **Expo SDK 55**. If your Expo Go is a different SDK, run
`npx expo install expo@^<sdk> --fix` (e.g. `^54.0.0`) before `npm run setup`.

## 3 · Deploy the API (Render, free tier)

1. Push this repo to GitHub → Render → **New → Blueprint** (uses `render.yaml`).
2. Set `DATABASE_URL` and `DIRECT_URL` (same values as `server/.env`), and optionally `ALLOWED_EMAIL_DOMAIN`, `ADMIN_EMAILS`.
3. Open `https://<service>.onrender.com/health` — should return `{"status":"ok"}`.

The free tier sleeps when idle; the first request can take ~30–50 s (the app waits up to 45 s).

## 4 · Build the APK

```bash
cd mobile
npm i -g eas-cli && eas login && eas init
# edit eas.json: set EXPO_PUBLIC_API_URL to your Render URL (must be https)
npm run build:apk           # eas build -p android --profile preview
```

EAS gives you a download link for the `.apk`. Add `icon` / `adaptiveIcon` to `app.json` when you have artwork.

## Before sharing with others

- **Rotate your Neon database password** (the connection string was shared in a chat) and update `.env` + Render.
- Never commit `server/.env` (it is git-ignored).
- Replace the sample drivers.

## Not in this MVP (planned in the design doc)

Email OTP verification, push notifications, map view, UPI payments, admin web panel.
Sign-up is restricted by email domain instead of OTP; chat is real-time while the screen is open.
