# JCTRADE User App

Mobile-first web app (max 430px) matching JCTRADE UI.

## Run locally

1. Start API: `cd ../server && npm start`
2. Start app: `npm run web`
3. Open **http://localhost:8081** (required for Google login)

## Features

- Splash screen with JCTRADE branding
- Gmail login (Google OAuth)
- Home: admin-set USDT price, balance
- Sell USDT, wallet & transaction history, profile edit, support tab

## Env (local)

Copy `.env.example` to `.env`:

- `EXPO_PUBLIC_API_URL` — API base (default `http://localhost:4000/api`)
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth web client ID

## Deploy on Render (Static Site)

1. **Service type:** Static Site (not Web Service)
2. **Build command:** `npm install && npm run build`
3. **Publish directory:** `dist`
4. **Node version:** `20` (Dashboard → Environment → `NODE_VERSION=20`)
5. **Environment variables** (set **before** each build — they are compiled into JS):
   - `EXPO_PUBLIC_API_URL` — **must** include `/api`, e.g. `https://jctrade-server-1.onrender.com/api`
   - `EXPO_PUBLIC_GOOGLE_CLIENT_ID` — same Web client ID as local  

   This repo includes **`.env.production`** with the production API URL (`https://jctrade-server-1.onrender.com/api`). The `build` script sets **`NODE_ENV=production`** so Expo loads `.env` then overlays `.env.production` values (Render **Environment** variables override file-based ones if present).
6. **HTTP headers (Google popup):** For path `/*`, set `Cross-Origin-Opener-Policy: same-origin-allow-popups` and `Cross-Origin-Embedder-Policy: unsafe-none`. Repo `render.yaml` includes these for Blueprint deployments; otherwise add them under Static Site → **Headers** in the Render dashboard.

7. In **Google Cloud Console**, under your Web OAuth client → **Authorized JavaScript origins**, add your live URL, e.g. `https://jctrade-web.onrender.com`.

**Blueprint:** sync the repo and use included `render.yaml` so headers and routing stay in sync.

## Troubleshooting

| Issue | Cause |
|--------|--------|
| **React hydration #418** on login | GSI iframe vs static HTML mismatch — fixed by mounting `GoogleLogin` only after mount (included in codebase). Redeploy. |
| **COOP / postMessage** warnings | Hosted HTML must send `Cross-Origin-Opener-Policy: same-origin-allow-popups` (see headers above). `metro.config.js` only applies to `expo start`, not production `dist/`. |
| **`localhost:4000` ERR_CONNECTION_REFUSED** on deployed site | Production URL not in bundle: add **`EXPO_PUBLIC_API_URL`** in Render env **or** keep **`.env.production`** (`https://jctrade-server-1.onrender.com/api`). Use `npm run build` (forces `NODE_ENV=production`). **Redeploy.** |
| **GSI initialize multiple times** | Harmless in React Strict Mode (dev). Production should log once. |


## Build output

```bash
npm run build   # NODE_ENV=production + clears Metro cache so EXPO_PUBLIC_* is fresh
```

`dist/` is gitignored; Render builds it on each deploy. If you change API URL in `.env.production` and the bundle still calls `localhost`, run `npm run build` again (the script uses `--clear`).






npx expo export --platform web