# Real Estate CRM

Real Estate CRM is a full-stack web application for managing leads, clients, properties, agents, deals, and reporting in one place.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, React Hook Form, Recharts, Axios
- Backend: Node.js, Express, TypeScript
- Database: SQLite with `better-sqlite3`
- Authentication: JWT-based auth
- Deployment target: Vercel
- Maps: Google Maps JavaScript API and Geocoding API

## Features Implemented

- Authentication with protected routes
- Dashboard with KPIs and analytics cards
- Lead management
  - create, edit, delete, filter, search
  - status tracking
  - agent assignment
- Client management
  - create, edit, delete, filter, search
  - buyer/seller profile handling
- Property management
  - create, edit, delete, filter, search
  - amenities and agent assignment
  - Google Maps location pinning
- Deal pipeline
  - kanban-style stage view
  - create, edit, delete
  - stage movement across pipeline
  - commission and value tracking
- Agent management
  - list team performance
  - admin create, update, delete
- Reports and analytics
  - lead source chart
  - revenue and commission summary
  - top closer summary

## Current Scope

The core CRM modules are implemented and working for local development:

- leads
- clients
- properties
- deals
- agents
- reports
- dashboard

Advanced items not fully completed yet:

- document uploads
- SMS/email integrations
- reminder scheduler UI
- export to Excel/PDF
- production database migration from SQLite
- advanced Google Maps features such as autocomplete and route insights

## Project Structure

```txt
frontend/   React app
Backend/    Express API
api/        Vercel serverless entry
```

## Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

Backend currently works without a required `.env` file for local development because fallback values are present in code, but for production you should set:

```env
JWT_SECRET=your_jwt_secret
SEED_ADMIN_EMAIL=your_admin_email
SEED_ADMIN_PASSWORD=your_admin_password
SEED_ADMIN_NAME=your_admin_name
```

## Run Locally

Install dependencies from the repository root:

```bash
npm install
```

Start the backend:

```bash
cd Backend
npm install
npm run dev
```

Backend runs on:

```txt
http://localhost:5000
```

Start the frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

## Build

From the repository root:

```bash
npm run build
```

## Demo Access

The login page includes a demo access button for quick local entry.

Default seeded admin account:

```txt
Email: admin@demo.local
Password: 123test
```

## Deployment Notes

- Frontend is prepared for Vercel deployment
- API requests use `/api`
- Vercel serverless entry is provided in `api/index.ts`
- SQLite is acceptable for local development, but a production deployment should use a persistent hosted database such as PostgreSQL or MySQL
