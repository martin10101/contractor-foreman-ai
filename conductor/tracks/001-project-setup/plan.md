# Plan: Project Setup

Establish the foundation for the Contractor Foreman AI application.

## Objectives
- [ ] Initialize backend with Node.js, Express, and Prisma.
- [ ] Initialize frontend with React, TypeScript, and Tailwind CSS.
- [ ] Configure PostgreSQL database connection.
- [ ] Create basic "Hello World" API and frontend page.

## Tasks
- [ ] **Backend**
    - [ ] `npm init` in `server/`
    - [ ] Install dependencies: `express`, `prisma`, `@prisma/client`, `cors`, `dotenv`.
    - [ ] Initialize Prisma: `npx prisma init`.
    - [ ] Create basic Express server.
- [ ] **Frontend**
    - [ ] `npm create vite@latest client -- --template react-ts`.
    - [ ] Install Tailwind CSS.
    - [ ] Set up basic routing.
- [ ] **Orchestration**
    - [ ] Add `package.json` in root to manage both client and server.
