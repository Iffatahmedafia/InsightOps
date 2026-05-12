# InsightOps

InsightOps is a real-time reliability monitoring app for tracking application health, API metrics, logs, and incidents from one dashboard.

The project is split into two apps:

- `insightops-backend` - Node.js, Express, Socket.IO, Prisma, PostgreSQL, and Supabase Auth.
- `insightops-frontend` - Next.js, React, Tailwind CSS, Supabase Auth, and Socket.IO client.

## Features

- Register applications and issue per-application ingest API keys.
- Ingest logs and route-level API metrics.
- Detect incidents from error rate, latency, and service health signals.
- Run health checks against registered application health URLs.
- Stream new logs, metrics, health checks, and incidents to the dashboard in real time.
- Filter logs and incidents by application, status, severity, route, method, and level.

## Project Structure

```text
InsightOps/
  insightops-backend/
    prisma/              Prisma schema and migrations
    src/
      config/            Prisma and Supabase clients
      middleware/        Auth, API key, validation, and error middleware
      routes/            REST API routes
      services/          Incident detection logic
      utils/             API key helpers
      server.js          Express and Socket.IO entrypoint
  insightops-frontend/
    app/                 Next.js app routes
    components/          Dashboard UI components
    lib/                 API, auth, Supabase, and Socket.IO clients
```

## Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL database
- Supabase project with email/password auth enabled

## Environment Variables

Create backend and frontend environment files from the examples.

Backend:

```powershell
cd insightops-backend
copy .env.example .env
```

Required backend values:

```env
PORT=4000
DATABASE_URL="postgresql://postgres:password@localhost:5432/insightops?schema=public"
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLIENT_ORIGINS=http://localhost:3000
ERROR_RATE_THRESHOLD=0.1
P95_LATENCY_THRESHOLD_MS=1000
```

Frontend:

```powershell
cd insightops-frontend
copy .env.local.example .env.local
```

Required frontend values:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Local Development

Install backend dependencies and apply database migrations:

```powershell
cd insightops-backend
npm install
npx prisma migrate dev
npm run dev
```

The backend runs on `http://localhost:4000`.

In a second terminal, install frontend dependencies and start Next.js:

```powershell
cd insightops-frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`.

## Typical Workflow

1. Open `http://localhost:3000`.
2. Register or sign in with Supabase Auth.
3. Add an application from the dashboard.
4. Save the generated application API key. It is only returned once.
5. Send logs or metrics to the ingest endpoints with the `x-api-key` header.
6. Watch the dashboard update as telemetry and incidents arrive.

## API Overview

User-authenticated endpoints require a Supabase bearer token:

- `GET /health`
- `POST /api/applications`
- `GET /api/applications`
- `GET /api/applications/:id`
- `POST /api/applications/:id/api-key`
- `POST /api/health-checks/run`
- `GET /api/health-checks`
- `GET /api/metrics/summary`
- `GET /api/incidents`
- `PATCH /api/incidents/:id/resolve`
- `GET /api/logs`

Ingest endpoints require an application API key in the `x-api-key` header:

- `POST /api/ingest/logs`
- `POST /api/ingest/metrics`

Example metric ingest:

```powershell
curl -X POST http://localhost:4000/api/ingest/metrics `
  -H "Content-Type: application/json" `
  -H "x-api-key: iops_your_application_api_key" `
  -d "{\"route\":\"/api/orders\",\"method\":\"POST\",\"statusCode\":500,\"latencyMs\":1320}"
```

Example log ingest:

```powershell
curl -X POST http://localhost:4000/api/ingest/logs `
  -H "Content-Type: application/json" `
  -H "x-api-key: iops_your_application_api_key" `
  -d "{\"level\":\"error\",\"message\":\"Payment provider timed out\",\"service\":\"checkout\",\"route\":\"/api/orders\",\"method\":\"POST\"}"
```

## Realtime Events

The backend emits Socket.IO events consumed by the frontend:

- `connected`
- `metric:created`
- `log:created`
- `health-check:created`
- `incident:opened`

## Scripts

Backend:

```powershell
npm run dev
npm start
npm test
npm run migrate:deploy
```

Frontend:

```powershell
npm run dev
npm run build
npm start
npm run lint
```

## Troubleshooting

- If the frontend cannot reach the API, confirm the backend is running on `localhost:4000` and `NEXT_PUBLIC_API_URL` points to it.
- If authenticated API requests fail, confirm the Supabase URL and keys match the same Supabase project in both apps.
- If Prisma cannot connect, confirm `DATABASE_URL` points to a running PostgreSQL database and run `npx prisma migrate dev`.
- If browser requests are blocked by CORS, add the frontend origin to `CLIENT_ORIGINS`.
- If no health checks run, add a `healthUrl` when creating an application.
