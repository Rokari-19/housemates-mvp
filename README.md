# Housemates MVP

A trust-first housing and housemate discovery MVP for students, NYSC members and young professionals. Product direction: Find Home, Find Housemates and Find Hostels, with Abuja as the initial launch market.

## Stack
- Frontend: React (JavaScript), Vite, React Router, Lucide
- Backend: Django + Django REST Framework
- Development database: SQLite (production should use PostgreSQL)

## Run
Frontend: `cd frontend && npm install && npm run dev`
Backend: `cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && python manage.py migrate && python manage.py runserver`

## Current MVP slice
- Responsive housing discovery, location/budget filters, listing detail and move-in cost breakdown
- Housemate discovery concept with preference-match explanation
- Hostel discovery cards
- Django custom user roles and seeker preferences
- Listings, photos, hostel metadata, enquiries
- Explainable housemate scoring service
- Reporting endpoint and staff review in Django Admin

## API
- GET `/api/health/`
- POST `/api/auth/signup/`, POST `/api/auth/login/`, POST `/api/auth/logout/`
- GET `/api/auth/me/`, GET/PATCH `/api/auth/profile/`
- GET/POST `/api/housing/listings/`, listing detail and owner `mine/` endpoint
- `/api/housing/enquiries/`
- GET `/api/matching/matches/`
- POST `/api/safety/reports/`

Demo listing/person/hostel content on the frontend is static seed data. The frontend has not yet been connected to the API. Authentication, photo upload, real provider enquiry notifications, blocking, and moderation workflow UX remain unfinished. This repository is an active MVP foundation, not a production-ready housing marketplace.

## Product safety boundaries
No escrow, wallet or lending. Listing verification signals represent individual checks and must not be presented as a guarantee. Matching is rules-based, explainable and should never use protected characteristics.
