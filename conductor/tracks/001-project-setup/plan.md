# Plan: Project Setup

Establish the foundation for the Contractor Foreman AI application.

## Objectives
- [x] Initialize backend with Node.js, Express, and Prisma.
- [x] Initialize frontend with React, TypeScript, and Tailwind CSS.
- [x] Configure PostgreSQL database connection. (Configuration complete in `prisma.config.ts`, requires running PostgreSQL server)
- [x] Create basic "Hello World" API and frontend page.
- [x] Implement Core Framework (Auth + Layout).
- [x] Implement Contacts Module (CRUD).

## Tasks
- [x] **Backend**
    - [x] `npm init` in `server/`
    - [x] Install dependencies: `express`, `prisma`, `@prisma/client`, `cors`, `dotenv`.
    - [x] Initialize Prisma: `npx prisma init`.
    - [x] Create basic Express server.
    - [x] Set up authentication (JWT).
    - [x] Create Contacts API (CRUD).
- [x] **Frontend**
    - [x] `npx create-react-app client --template typescript`. (Used Vite instead)
    - [x] Install Tailwind CSS.
    - [x] Set up basic routing.
    - [x] Create Login and Dashboard pages.
    - [x] Create Contacts CRUD page.
- [x] **Orchestration**
    - [x] Add `package.json` in root to manage both client and server.