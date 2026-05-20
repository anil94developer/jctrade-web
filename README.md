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
5. **Environment variables** (set before deploy; baked in at build time):
   - `EXPO_PUBLIC_API_URL` — e.g. `https://your-api.onrender.com/api`
   - `EXPO_PUBLIC_GOOGLE_CLIENT_ID` — same Web client ID as local
6. In **Google Cloud Console**, add your Render URL to **Authorized JavaScript origins**, e.g. `https://jctrade-web.onrender.com`

Or use the included `render.yaml` blueprint when creating the service.

## Build output

```bash
npm run build   # creates ./dist (static HTML/JS)
```

`dist/` is gitignored; Render builds it on each deploy.
