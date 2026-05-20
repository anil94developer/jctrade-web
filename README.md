# JCTRADE User App

Mobile-first web app (max 430px) matching JCTRADE UI.

## Run

1. Start API: `cd ../server && npm start`
2. Start app: `npm run web`

## Features

- Splash screen with JCTRADE branding
- Gmail login (Google OAuth or dev email login)
- Home: admin-set USDT price, balance
- Sell USDT form (hash, name, value, UPI ID)
- Wallet history & transaction history with details
- Editable profile (name, phone, UPI ID)

## Env

Copy `.env` and set:

- `EXPO_PUBLIC_API_URL` — API base (default `http://localhost:4000/api`)
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth web client ID (optional; without it, dev Gmail login is shown)
# jctrade-web
