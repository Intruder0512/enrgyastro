# EnrgyAstro

Personal astrology consultation platform — Kundli, Panchang, Kundli Matching, Palm Reading, and Vastu, with online/offline appointment booking. Built for a solo practitioner (single-admin model), inspired by AstroSage's feature set but scoped down for one person to run.

## Stack

- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (Mongoose)
- **Views:** EJS (server-rendered, no separate frontend build step)
- **Sessions:** express-session + connect-mongo
- **Astrology data:** [Prokerala API](https://api.prokerala.com/) (Panchang, Kundli, Dasha, Dosha, Guna Milan matching)
- **Hosting:** Hostinger (Git-based deploy, same pattern as the ICAS LMS project)

## Local setup

```bash
git clone https://github.com/Intruder0512/enrgyastro.git
cd enrgyastro
npm install
cp .env.example .env   # fill in MongoDB URI, Prokerala credentials, admin login, etc.
npm run dev
```

On first boot, the app auto-seeds:
- One **admin account** using `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`
- Six **starter services**: Free Kundli, Kundli Matching, General Consultation, Palm Reading, Vastu Consultation, Career Astrology

Visit `http://localhost:3000`. Log in as admin to manage appointments and services at `/admin`.

## Getting Prokerala API credentials

1. Sign up at https://api.prokerala.com/
2. Create a Client (OAuth2 client-credentials flow)
3. Copy the Client ID / Secret into `.env` as `PROKERALA_CLIENT_ID` / `PROKERALA_CLIENT_SECRET`
4. Free tier is enough for development; check their credit pricing before high-traffic launch

## Project structure

```
config/       MongoDB connection
controllers/  Route handlers (auth, booking, admin, astro/panchang)
middleware/   Session auth guards
models/       User, Service, Appointment, Report (cached API responses)
routes/       Express routers
utils/        Prokerala API client, DB seed script
views/        EJS templates (layouts, partials, pages)
public/       CSS, JS, uploaded images
```

## Deployment (Hostinger)

Same pattern as the ICAS LMS project:
1. Connect this repo via Hostinger's Git integration
2. Set environment variables in Hostinger's dashboard (mirror `.env.example`)
3. Bump `ASSET_VERSION` in `.env` on every deploy that changes CSS/JS, to bust Hostinger's CDN cache
4. Use Hostinger's built-in SMTP for `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS`

## Roadmap

**Phase 1 (this push) — done:**
- User registration/login, session auth
- Service catalog with admin toggle
- Appointment booking with live slot availability, birth-details capture
- Admin dashboard: appointment status management, service management
- Live daily Panchang widget on homepage (Prokerala API, cached by day)
- Free Kundli generator and Kundli Matching (Guna Milan) — raw data output

**Phase 2:**
- Designed Kundli chart visualization (North/South Indian chart styles) instead of raw JSON
- Designed Guna Milan scorecard (36-point breakdown table)
- Dasha & Dosha (Manglik/Kaal Sarp/Sade Sati) report pages
- Razorpay payment integration for paid bookings
- Email confirmations via Hostinger SMTP (nodemailer is already a dependency)
- Admin-configurable slot calendar (currently hardcoded daily slots)
- Palm Reading & Vastu intake forms (photo upload — `multer` already wired for this)

**Phase 3:**
- Hindi language toggle
- Blog / "Learn Astrology" content section
- Daily/weekly/monthly horoscope by zodiac sign
- WhatsApp booking reminders
