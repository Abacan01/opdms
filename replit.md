# Workspace

## Overview

**OPDMS — Out-Patient Document Management System** for Don Juan Medical Center. A full-stack healthcare web portal for managing patient records, appointments, doctors, and health library articles.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── opdms/              # React + Vite frontend (OPDMS portal)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## OPDMS Features

- Landing page with hospital branding
- Authentication via **Firebase Auth** (email/password + Google OAuth)
- Dashboard redesigned: mini calendar, upcoming appointments, Latest News (DOH), Specialization cards
- Schedule page with calendar and appointment management
- Set Appointment modal + Reschedule modal
- Doctors page with redesigned View Details modal (photo, contact info, specialization desc, Why Me?)
- Records page with prescription document modal
- Health Library with category filter + full article read modal
- **Healthcare Appointment** page (9 services, paginated cards, View Details modal, Schedule a Service)
- **Settings** page (personal info, password change, profile photo)
- Firebase Firestore for appointments, notifications, user profiles, medical records
- Custom sidebar (no icon-turning-white bug) — mobile-responsive
- Toast notifications

## Firebase Config

Firebase credentials are stored in `artifacts/opdms/.env` as `VITE_FIREBASE_*` variables.
Project: `opdms-eb2a2`

## Stack (Updated)

- **Auth**: Firebase Authentication (email/password, Google)
- **Database**: Firebase Firestore (primary), PostgreSQL + Drizzle (legacy schema)
- **Frontend**: React + Vite + Tailwind CSS (no more Shadcn Sidebar for nav)
- **Sidebar**: Custom built sidebar (replaced collapsible Shadcn sidebar)

## Database Schema

- `users` — patient/staff accounts
- `appointments` — appointment bookings
- `doctors` — doctor profiles
- `medical_records` — prescriptions, lab results, consultation notes
- `articles` — health library articles
- `notifications` — user notifications

## API Routes (under /api)

- `GET /api/healthz` — health check
- `POST /api/auth/register` — register
- `POST /api/auth/login` — login
- `POST /api/auth/logout` — logout
- `GET /api/auth/me` — current user
- `GET/POST /api/appointments` — list/create appointments
- `GET/PATCH/DELETE /api/appointments/:id`
- `GET /api/doctors` — list all doctors
- `GET /api/doctors/:id`
- `GET /api/records` — patient records (auth required)
- `GET /api/records/:id`
- `GET /api/articles` — health library
- `GET/PATCH /api/notifications` — user notifications

## Dev Commands

- `pnpm --filter @workspace/opdms run dev` — frontend dev server
- `pnpm --filter @workspace/api-server run dev` — API server
- `pnpm --filter @workspace/db run push` — sync DB schema
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client
