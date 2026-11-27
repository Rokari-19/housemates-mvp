# Housemates Django API

## Quickstart

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API routes: `/api/health/`; auth `/api/auth/signup`, `/login`, `/logout`, `/me`, `/profile`; housing `/api/housing/listings/`, `/enquiries/`; matching `/api/matching/matches/`; safety `/api/safety/reports/`. New provider listings are queued for review. Matching uses disclosed household preferences, not protected attributes. Use PostgreSQL in production, configure environment secrets, HTTPS, backups and restricted access before launch.
