# Plan: Projects & Job Sites Module

Implement the Projects and Job Sites management module.

## Objectives
- [x] Define Project and JobSite models in Prisma.
- [x] Create Backend API for Projects (CRUD).
- [x] Create Backend API for Job Sites (CRUD).
- [x] Create Frontend pages for Project listing and details.
- [x] Implement Job Site management in Project Details.
- [x] Implement Project-Contact association (assigning contacts to projects).

## Tasks
- [x] **Database**
    - [x] Add `Project` model to `schema.prisma`.
    - [x] Add `JobSite` model to `schema.prisma`.
    - [ ] Run migrations (once DB is available).
- [x] **Backend**
    - [x] Create `projectController.ts`.
    - [x] Create `projectRoutes.ts` and register it in `index.ts`.
    - [x] Create `jobSiteController.ts`.
    - [x] Create `jobSiteRoutes.ts` and register it in `index.ts`.
- [x] **Frontend**
    - [x] Create `Projects.tsx` page.
    - [x] Create `ProjectDetails.tsx` page.
    - [x] Implement Job Site CRUD in `ProjectDetails.tsx`.
    - [x] Add navigation link to `Layout.tsx`.
