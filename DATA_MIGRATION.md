# Data Migration Guide

How to move your D-Con data between hosting providers.

## What Lives Where

| Data                       | Location                   | Portable?         |
| -------------------------- | -------------------------- | ----------------- |
| Code                       | GitHub repo                | ✅ Works anywhere |
| Database (schedule, users) | Host's PostgreSQL          | ⚠️ Must export    |
| Static assets (logos, map) | `frontend/public/` in repo | ✅ Works anywhere |

## Export Data (From Current Host)

Run in the backend shell:

```bash
python manage.py dumpdata --natural-foreign --natural-primary -o backup.json
```

Download/save `backup.json` somewhere safe.

## Import Data (On New Host)

```bash
python manage.py migrate
python manage.py loaddata backup.json
```

## Fresh Start (Without Export)

If you don't need to preserve user accounts or live edits:

```bash
python manage.py migrate
python manage.py seed_schedule --clear
python manage.py createsuperuser
```

This recreates all 15 schedule events from `seed_schedule.py`.

## What You'd Lose Without Export

- User accounts and passwords
- Admin role assignments
- Events marked as done
- Schedule edits made through the website UI
- Any events added/modified via the admin panel
