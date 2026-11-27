# Housemates frontend

React 18 + JavaScript + Vite.

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

The web app defaults to `http://localhost:5173` and reads the API base URL from `VITE_API_URL` (default: `http://localhost:8000/api`).

## Connected screens

- Home: live Abuja listings from the API, with city/area/budget search
- Find Home / Hostels: API-backed filters, listing cards and listing detail
- Find Housemates: seeker profile, explainable match cards, introductions, block and report
- Profile: seeker living preferences
- Provider workspace: create listings, view moderation status
- Enquiries: seeker/provider enquiry inbox
- Viewings: request inspections with next-of-kin details, confirm/decline/complete and record visit outcome
- Auth: signup/login with JWT storage and access-token refresh

The frontend does not include public chat, payment collection, map/SOS, push/email notifications or direct image upload yet.
