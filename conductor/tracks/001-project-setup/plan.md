# Plan: Project Setup

Establish the foundation for the Contractor Foreman AI application.

## Objectives
- [x] Initialize backend with Node.js, Express, and Prisma.
- [x] Initialize frontend with React, TypeScript, and Tailwind CSS.
- [ ] Configure PostgreSQL database connection.
- [x] Create basic "Hello World" API and frontend page.

## Tasks
- [x] **Backend**
    - [x] `npm init` in `server/`
    - [x] Install dependencies: `express`, `prisma`, `@prisma/client`, `cors`, `dotenv`.
    - [x] Initialize Prisma: `npx prisma init`.
    - [x] Create basic Express server.
- [x] **Frontend**
    - [x] `npx create-react-app client --template typescript`. (Used Vite instead)
    - [x] Install Tailwind CSS.
    - [x] Set up basic routing.
- [x] **Orchestration**
    - [x] Add `package.json` in root to manage both client and server.
