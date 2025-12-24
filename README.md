# Contractor Foreman AI

A modular, plan-first construction management web application built with a "Lego-block" architecture. This project aims to provide a robust yet simple framework for managing construction projects.

## 🧱 Lego-Block Architecture

This project follows a modular architecture where each feature is treated as an independent "Lego block."

- **Core (The Baseplate):** The shared foundation including Authentication, Layout, and Database configuration.
- **Modules (The Blocks):** Self-contained features like Contacts, Projects, or Estimates.
- **Interchangeability:** Each module is designed to be easily added, removed, or updated without affecting the core system.

### How to Add a New Module
1. **Database:** Update `server/prisma/schema.prisma` with new models.
2. **Backend:** 
   - Create a new controller in `server/src/controllers/`.
   - Create new routes in `server/src/routes/`.
   - Register routes in `server/src/index.ts`.
3. **Frontend:**
   - Create a new page in `client/src/pages/`.
   - Add the route to `client/src/App.tsx`.
   - Update `client/src/components/Layout.tsx` for navigation.

---

## 🚀 Iteration 1: Core Framework + Contacts Module

### Core Features
- **Frontend:** React + TypeScript + Tailwind CSS (Vite)
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** JWT-based secure authentication

### Contacts Module (CRUD)
- Manage subcontractors, clients, and suppliers.
- Detailed fields: Name, Email, Phone, Company, Role, and Notes.
- Search and filter capabilities.

---

## 🛠️ Getting Started (Beginner-Friendly)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (Installed and running)

### 2. Backend Setup
1. Open a terminal and navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup environment variables:
   - Create a file named `.env` in the `server` directory.
   - Copy the contents of `.env.example` into `.env`.
   - Update `DATABASE_URL` with your local PostgreSQL credentials.
4. Run database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`.

---

## 🚫 Non-Goals & Constraints

- **No Kubernetes:** Deployment is kept simple for now.
- **No Scope Creep:** Iteration 1 is strictly Core + Contacts.
- **Security:** Never commit your `.env` file. It is already added to `.gitignore`.
- **Modularity:** Avoid tight coupling between modules.

---

## 🗺️ Roadmap

- **Module 2:** Projects & Job Sites
- **Module 3:** Scheduling & Tasks
- **Module 4:** Estimates & Invoices
- **Module 5:** Time Tracking & Daily Logs