# InsightOps Backend

Node.js backend for ingesting logs and API metrics, detecting reliability incidents, running service health checks, and streaming realtime updates to a React dashboard.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local environment file:

   ```bash
   copy .env.example .env
   ```

3. Create a PostgreSQL database, then update `DATABASE_URL` in `.env`.

4. Apply the Prisma schema:

   ```bash
   npx prisma migrate dev --name init
   ```

5. Run the API:

   ```bash
   npm run dev
   ```

The API starts on `http://localhost:4000`.

## Core Endpoints

- `GET /health`
- `POST /api/applications`
- `GET /api/applications`
- `GET /api/applications/:id`
- `POST /api/ingest/logs`
- `POST /api/ingest/metrics`
- `POST /api/health-checks/run`
- `GET /api/health-checks`
- `GET /api/metrics/summary`
- `GET /api/incidents`
- `PATCH /api/incidents/:id/resolve`

## Example Metric Ingest

```bash
curl -X POST http://localhost:4000/api/ingest/metrics ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: iops_your_application_api_key" ^
  -d "{\"route\":\"/api/orders\",\"method\":\"POST\",\"statusCode\":500,\"latencyMs\":1320}"
```

Application API keys are generated when an application is created. The raw key is returned once and only the hash is stored.

## Realtime Events

The dashboard can connect with Socket.IO and listen for:

- `metric:created`
- `log:created`
- `health-check:created`
- `incident:opened`
