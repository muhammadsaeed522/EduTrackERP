# EduTrack ERP (Local-Only)

**Smart Student Performance & Discipline Management System**

EduTrack runs entirely in the browser. All data (users, students, attendance, academics, discipline, houses, penalties, bonuses) is stored in **localStorage** under the key `edutrack_local_db`. No MongoDB or backend server is required.

## Architecture

```
edutrack/
├── client/              # React + Vite + Tailwind UI
│   └── src/
│       ├── components/  # Reusable UI
│       ├── pages/       # Route pages
│       ├── features/    # Feature modules
│       ├── context/     # Auth & theme
│       └── services/
│           ├── localDb.js   # localStorage schema & score logic
│           ├── localApi.js  # Axios-compatible in-process API
│           └── api.js       # Entry point (initDb + localApi)
└── server/              # Optional reference implementation (not required)
```

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, React Hook Form, Zod, Recharts |
| Data | localStorage (`edutrack_local_db`, `edutrack_user`, `edutrack_token`) |
| PDF | jsPDF (client-side reports) |

## Final Score Formula

```
Final Score = Academics (40%) + Discipline (35%) + Attendance (10%) + Bonuses − Penalties
```

Capped 0–100, auto-updated when related records change.

## Quick Start

### Prerequisites

- Node.js 18+

### Setup

```bash
# From repo root
npm run install:client

# Start the app
npm run dev
```

Open **http://localhost:5173**

On first load, demo data is seeded automatically in localStorage.

### Demo Credentials

| Role | Login | Password |
|------|-------|----------|
| Admin | admin@edutrack.com | admin123 |
| Teacher | teacher@edutrack.com | teacher123 |
| Student | STU001–STU005 (roll number) | student123 |

Teachers and admins can **sign up** at `/signup`; new accounts are saved locally on this device only.

## Resetting Data

Clear site data in the browser, or run in DevTools:

```js
localStorage.removeItem('edutrack_local_db');
localStorage.removeItem('edutrack_user');
localStorage.removeItem('edutrack_token');
location.reload();
```

## API (In-Process)

The client uses `localApi` with the same route shapes as the original REST API (`/students`, `/attendance/daily`, `/discipline/session/:id`, etc.). Responses follow:

```json
{ "data": { "success": true, "message": "...", "data": { ... } } }
```

## Optional Server

The `server/` folder contains the original MongoDB/Express implementation for reference. It is **not** used by the local-only client.

## License

Proprietary – EduTrack ERP
