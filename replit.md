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
- Authentication (login/register with localStorage demo auth)
  - Demo patient: `patient@demo.com` / `demo123`
  - Demo staff: `staff@demo.com` / `demo123`
- Dashboard with upcoming appointments, notifications, quick actions
- Schedule page with calendar and appointment cards
- Set Appointment modal (date, time, type, service, doctor, symptoms)
- Reschedule modal
- Doctors page with specialization cards and details modal
- Records page with document modal (prescription view like capstone screenshots)
- Health Library with categorized articles
- Toast notifications for confirmations
- Mobile-responsive with collapsible sidebar

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
