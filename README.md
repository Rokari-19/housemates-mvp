# Housemates MVP

A trust-first housing and housemate-discovery platform for Nigerian students, NYSC members, fresh graduates and young professionals.

**Positioning:** Find a place. Find your people. Move in with confidence.  
**Launch wedge:** Abuja-first, with selected campus and NYSC clusters.

## Stack

- Frontend: React 18 (JavaScript), Vite, React Router and Lucide
- Backend: Django 5.2, Django REST Framework and Simple JWT
- Development database: SQLite
- Production database target: PostgreSQL

## Implemented MVP journeys

### Find Home
- Public, searchable property listings with city, area, type and rent filters
- Listing details, amenities, availability, furnishing and provider attribution
- Itemised rent, deposit, agency, agreement, service and utility costs, plus move-in estimate
- Provider account roles and listing submission
- New listings enter moderation with status `review`; only `active` listings are publicly discoverable
- Listing evidence records distinguish provider identity, location, authority to let and physical inspection

### Find Housemates
- Seeker profiles for students, NYSC members, graduates and young professionals
- Budget, preferred areas, move-in date, cleanliness, sleep, guests, smoking, pets, work mode, noise and dealbreaker preferences
- Rules-based matching with hard constraints and plain-language agreement/difference explanations
- Introduction requests with recipient accept/decline
- User blocking and safety reporting
- Public match results do not expose phone numbers or email addresses

### Find Hostels
- Hostel listings with institution, academic session, bed-space availability, session price and hostel rules
- Hostel listings restricted to hostel-operator accounts and held for moderation before publication

### Enquiries and inspections
- Seeker-to-provider listing enquiries and provider status updates
- Viewing requests with preferred date/time and next-of-kin details
- Provider confirmation/decline/completion and seeker cancellation/outcome reporting

## Run locally

Requirements: Python 3.11+, Node.js 20+, npm.

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate --run-syncdb
python manage.py createsuperuser
python manage.py runserver
```

API: `http://localhost:8000/api/`  
Admin: `http://localhost:8000/admin/`

### 2. Frontend

In another terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Web app: `http://localhost:5173`.

The frontend reads `VITE_API_URL`; for local development its default is `http://localhost:8000/api`.

## Main API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health/` | API health check |
| POST | `/api/auth/signup/` | Create a seeker or provider account |
| POST | `/api/auth/login/` | Obtain access and refresh JWTs |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| GET | `/api/auth/me/` | Current account |
| GET/PATCH | `/api/auth/profile/` | Seeker living preferences |
| GET/POST | `/api/housing/listings/` | Search or submit accommodation |
| GET/PATCH/DELETE | `/api/housing/listings/:id/` | Listing details and owner management |
| GET | `/api/housing/listings/mine/` | Provider's own listings, including review status |
| GET/POST/PATCH | `/api/housing/enquiries/` | Listing enquiries and provider responses |
| GET/POST/PATCH | `/api/housing/viewings/` | Inspection requests and status/outcome updates |
| GET | `/api/matching/matches/` | Explainable housemate matches |
| GET/POST | `/api/matching/introductions/` | View or request introductions |
| POST | `/api/matching/introductions/:id/respond/` | Accept or decline an introduction |
| GET/POST | `/api/safety/blocks/` | View or block users |
| DELETE | `/api/safety/blocks/:user_id/` | Unblock a user |
| GET/POST | `/api/safety/reports/` | Create or review own safety reports |

JWT authentication uses `Authorization: Bearer <access-token>`. Listing filters include `search`, `city`, `area`, `listing_type`, `min_price`, `max_price`, `move_in_date`, `furnished` and `amenity`.

## Matching logic

Hard filters exclude candidates with disjoint fully specified budget ranges, no overlap in both users' selected areas, or move-in dates more than 30 days apart. Remaining profiles receive a weighted 0–100 preference score across budget, location, timing, cleanliness, sleep schedule, guest frequency, smoking, pets, work mode and noise. The API returns the reasons behind the score and preferences that differ. It is a discussion aid, not a prediction of whether two people will get along.

The system does not use protected characteristics to rank housing or housemate options.

## Trust, safety and limitations

- Verification is recorded per check type: provider identity, location presence, authority to let and physical inspection. A check has a status, date and evidence summary. There is no blanket "100% verified" or "scam-proof" status.
- New listings are reviewed by staff in Django Admin before activation. Staff can record verification checks there.
- Users can report a listing or person and block another user. Reports are available to moderators in Django Admin.
- Viewing requests include next-of-kin details. They are visible only to the seeker and listing provider through the authenticated viewing endpoint.
- No in-app payments, wallet, escrow, rent financing, public chat, push/email notifications, SOS dispatch or map/routing integration is implemented in this MVP.
- Listing photos currently use externally hosted image URLs. Upload processing and object storage are not configured.
- The platform does not collect raw NIN data.

## Before staging or public launch

This is a functional MVP foundation, not a production launch approval. The repository currently uses unmigrated Django apps; generate and commit initial migrations with `python manage.py makemigrations accounts housing matching safety` before deploying an existing production database, then run `python manage.py migrate`.

Set a strong `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=0`, production `DJANGO_ALLOWED_HOSTS`, CORS origins and a PostgreSQL `DATABASE_URL`. Add HTTPS, secure cookie/proxy configuration, managed object storage, database backups and restore tests, transactional email, monitoring, incident response, privacy notices, retention/deletion workflows and legal review. JWT logout currently clears tokens in the client; persisted refresh-token revocation/blacklisting is not configured.

Run automated backend/API and browser tests against the selected deployment environment before onboarding real users.
