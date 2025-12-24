# Plan: Scheduling & Tasks Module

Implement the Scheduling and Tasks management module to track project progress and assignments.

## Objectives
- [x] Define Task and Event models in Prisma.
- [x] Create Backend API for Tasks (CRUD).
- [x] Create Backend API for Events (CRUD).
- [x] Create Frontend pages for Task management.
- [x] Implement Task assignment to Users.

## Tasks
- [x] **Database**
    - [x] Add `Task` model to `schema.prisma`.
    - [x] Add `Event` model to `schema.prisma`.
    - [ ] Run migrations (once DB is available).
- [x] **Backend**
    - [x] Create `taskController.ts`.
    - [x] Create `taskRoutes.ts` and register it in `index.ts`.
    - [x] Create `eventController.ts`.
    - [x] Create `eventRoutes.ts` and register it in `index.ts`.
    - [x] Create `userRoutes.ts` to list users for assignment.
- [x] **Frontend**
    - [x] Create `Tasks.tsx` page.
    - [x] Implement Task CRUD and assignment.
    - [x] Add navigation link to `Layout.tsx`.
    - [x] Update Dashboard to show Task stats.
