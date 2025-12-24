# Contractor Foreman AI

A modular, plan-first construction management web app (Lego-block modules) with a React frontend and an Express + Prisma backend.

## What this is

- Core framework: auth, layout shell, database layer, REST API structure
- Modules: contacts, projects/job sites, scheduling/tasks (more later)
- Planning: persistent Conductor plans live under `conductor/tracks/`

## Quick start (Windows)

1. Make sure Postgres is running.
2. In `server/.env`, set `DATABASE_URL` and `JWT_SECRET` (see `server/.env.example`).
3. Double-click `start-dev.ps1`.

This starts:
- API server: `http://localhost:5000/api/health`
- Web UI: `http://localhost:5173/login`

## Manual start (any OS)

Backend:
- `cd server`
- `npm install`
- `npm run dev`

Frontend:
- `cd client`
- `npm install`
- `npm run dev`

## Notes

- Secrets are not committed. `server/.env` is ignored by git.
- Conductor plans are in `conductor/tracks/` and tracked in `conductor/tracks.md`.
