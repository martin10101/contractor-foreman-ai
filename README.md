# Contractor Foreman AI

A modular, plan-first construction management web application built with a "Lego-block" architecture.

## Lego-Block Philosophy

Each feature is designed as a self-contained module. This helps with:
- Scalability: add new modules without breaking others
- Maintainability: modules stay isolated and easier to debug
- Simplicity: clear building blocks and beginner-friendly structure

## Iteration 1 (MVP): Core + Contacts

### Core Framework (Baseplate)
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma ORM
- Auth: JWT-based authentication
- Frontend: React + TypeScript + Tailwind CSS + Vite

### Module 1: Contacts
- CRUD for project contacts (subcontractors, clients, suppliers)
- Fields: name, email, phone, company, role/type

## Setup (Beginner-Friendly)

Prereqs:
- Node.js (v18+)
- PostgreSQL running

Backend:
1. `cd server`
2. `npm install`
3. Create `server/.env` based on `server/.env.example` and set `DATABASE_URL`
4. `npx prisma migrate dev --name init`
5. `npm run dev`

Frontend:
1. `cd client`
2. `npm install`
3. `npm run dev`

## Non-Goals (for this iteration)

- No complex deployment (no Kubernetes)
- No secrets committed to git (use `.env`)
- No scope creep beyond Core + Contacts

## Next Modules (Roadmap)

- Projects
- Estimates
- Invoices
- Time Cards
- Reporting
- Documents
- Approvals
