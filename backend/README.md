# Housemates Django API

## Quickstart

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate --run-syncdb
python manage.py createsuperuser
python manage.py runserver
```

The API is served from `/api/`; Django Admin is at `/admin/`.

## Apps

- `accounts`: custom user roles, JWT login/signup and seeker profiles
- `housing`: listings, hostel metadata, listing photos, enquiries, viewing requests and verification evidence
- `matching`: explainable rules-based matches and consent-based introductions
- `safety`: user blocks and safety reports

Provider listings are created in `review` status and are not returned to anonymous search until a staff moderator changes them to `active`. Moderators can add itemised verification checks through Django Admin.

Use PostgreSQL and committed initial migrations for staging/production. Set secret/environment values, HTTPS, restrictive CORS, backups and monitoring before launch. No payments, escrow or lending functionality is included.
