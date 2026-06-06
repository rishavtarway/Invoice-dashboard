# Invoice Management Dashboard

A production-quality full-stack invoice management dashboard built for the PowerPlay Full-Stack Developer Internship assignment.

**Stack:** Node.js 20 · Express · MongoDB 7 (Mongoose) · React 18 · Vite · Tailwind CSS · TanStack Query · Zod · Recharts

---

## Features

- **Invoices list** — 2,000 invoices, paginated, sortable, filterable by status / tax rate / date range, full-text search across invoice ID and customer name. URL-state filters (bookmarkable).
- **Create / edit invoice modal** — React Hook Form + Zod, server-validated, auto-computes tax and total, auto-generates unique `INV-xxxxxxx` IDs.
- **Customer profile** — single-pipeline aggregation for metrics (Total Billed, Total Tax, Outstanding, # Invoices), status breakdown bar + donut chart, full invoice history.
- **Summary / analytics** — overall KPIs and top 5 customers by value (excludes Void invoices).
- **RESTful API** — Zod-validated, fully tested with Jest + Supertest.
- **Containerized** — one-command `docker compose up` brings up Mongo, backend, and frontend.

---

## Quick start (Docker)

```bash
# from the project root
docker compose up --build
```

- Frontend → http://localhost:8080
- Backend API → http://localhost:4000/api
- MongoDB → localhost:27017

To seed the database (only needed once if the volume is empty):

```bash
docker compose exec backend node src/scripts/seed.js
```

---

## Local development (without Docker)

### Prerequisites

- Node.js 20+
- A running MongoDB instance (local or Atlas)

### 1. Backend

```bash
cd backend
cp .env.example .env       # edit MONGO_URI if needed
npm install
npm run seed               # one-time — loads seed-data.json into Mongo
npm run dev                # http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env       # VITE_API_BASE_URL=http://localhost:4000/api
npm install
npm run dev                # http://localhost:5173
```

### 3. Tests

```bash
cd backend
npm test
```

---

## API reference

Base URL: `/api`

| Method | Endpoint                    | Description                                       |
|--------|-----------------------------|---------------------------------------------------|
| GET    | `/invoices`                 | List invoices (paginated, filtered, sorted)       |
| GET    | `/invoices/:id`             | Get a single invoice                              |
| POST   | `/invoices`                 | Create an invoice (auto-generates `invoiceId`)    |
| PUT    | `/invoices/:id`             | Update an invoice (recomputes tax/total)          |
| DELETE | `/invoices/:id`             | Delete an invoice                                 |
| GET    | `/customers`                | List all customers                                |
| GET    | `/customers/top5`           | Top 5 customers by total billed (excludes Void)   |
| GET    | `/customers/:id`            | Customer profile: metrics, status breakdown, history |

All query parameters, response shapes, and validation rules are documented inline in the controllers.

---

## Project structure

```
invoice-dashboard/
├── backend/        # Express + Mongoose API
├── frontend/       # React + Vite dashboard
├── seed-data.json  # 2,000-invoice source dataset
├── docker-compose.yml
└── README.md
```

See the per-folder `README`/comments for details.

---

## License

Assignment submission — all rights reserved by the author.
