# Contractor Foreman AI

A modular, plan-first construction management web app (Lego-block modules) with a React frontend and an Express + Prisma backend.

## What this is

- Core framework: auth, layout shell, database layer, REST API structure
- Modules: contacts, projects/job sites, tasks, estimates, invoices/payments, documents, reports
- Scheduling: calendar events
- Admin: org invites + role-based access control (RBAC)
- Planning: persistent Conductor plans live under `conductor/tracks/`

## Quick start (Windows)

1. Double-click `start-dev.ps1`.
2. Log in with the seeded admin account:
   - `admin@fastbuild.local`
   - `Admin123!`
3. (Optional) Create an invite in Settings and redeem at `http://localhost:5173/accept-invite`.

This starts:
- API server: `http://localhost:5000/api/health`
- Web UI: `http://localhost:5173/login`

The script also auto-runs `server` database setup (`npm run db:setup`) so you don't need to touch Prisma manually.

## Manual start (any OS)

Backend:
- `cd server`
- `npm install`
- `npm run db:setup`
- `npm run dev`

Frontend:
- `cd client`
- `npm install`
- `npm run dev`

## Notes

- Secrets are not committed. `server/.env` is ignored by git.
- Default local DB is SQLite via driver adapter (`server/.env.example` uses `file:./prisma/dev.db`).
- File uploads are stored locally under `server/uploads/` (ignored by git).
- Conductor plans are in `conductor/tracks/` and tracked in `conductor/tracks.md`.
