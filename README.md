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

## Data model

The dataset is split into **two collections** instead of one denormalized `invoices` blob.

### Why two collections?

- **1:1 customer-company mapping is enforced by the data.** The 2,000 invoices collapse to 61 unique `(name, company)` pairs. Storing `customer` and `company` on every invoice row would be 2,000 × 2 = 4,000 redundant string fields, and a typo on one row would create a "phantom" customer.
- **Server-side aggregation needs the customer dimension.** The top-5 query is `group by customerId → sum(total) → sort desc → limit 5`. A denormalized blob would force a string-compare on 2,000 rows on every page load; a normalized schema does it on 61.
- **Pagination, filters, and sorts are cheaper on indexed customer FKs.** The compound index `{ customerId: 1, status: 1, dueDate: 1 }` makes the common query (this customer's Draft and Unpaid invoices, sorted by due date) a covered scan.

### `customers` collection

| Field      | Type     | Notes                                |
|------------|----------|--------------------------------------|
| `_id`      | ObjectId | auto                                 |
| `name`     | string   | required, indexed                    |
| `company`  | string   | required, unique with `name`         |

Unique compound index on `(name, company)` enforces the 1:1 mapping at the database level — the seed script pre-derives this and the API never lets it drift.

### `invoices` collection

| Field       | Type     | Notes                                                              |
|-------------|----------|--------------------------------------------------------------------|
| `_id`       | ObjectId | auto                                                               |
| `invoiceId` | string   | `INV-xxxxxxxx` (auto-gen, unique)                                  |
| `customerId`| ObjectId | ref → `customers._id`, indexed                                     |
| `amount`    | number   | pre-tax, ≥ 0                                                       |
| `taxRate`   | number   | enum: 0, 3, 5, 18, 28                                              |
| `tax`       | number   | **server-computed** (`amount × taxRate / 100`)                     |
| `total`     | number   | **server-computed** (`amount + tax`)                               |
| `status`    | string   | enum: Draft, Sent, Paid, Unpaid, Overdue, Void                     |
| `issueDate` | Date     | ISO 8601                                                           |
| `dueDate`   | Date     | ISO 8601, must be ≥ issueDate                                      |
| `createdAt` | Date     | auto                                                               |
| `updatedAt` | Date     | auto                                                               |

### Indexes

- `customers`: `{ name: 1, company: 1 }` unique
- `invoices`: `{ invoiceId: 1 }` unique
- `invoices`: `{ customerId: 1, status: 1, dueDate: 1 }` — covers the customer-profile "give me this customer's invoices by status, sorted by due" path
- `invoices`: `{ status: 1, issueDate: -1 }` — covers the dashboard list sorted by newest
- `invoices`: `{ customerId: 1, total: -1 }` — covers the top-5 aggregation
- `invoices`: `{ invoiceId: 'text', 'customerSnapshot.name': 'text' }` — search

### What the server owns (never trust the client)

- `tax` and `total` are always recomputed on POST and PUT — the client sends `amount` and `taxRate`, the server returns the authoritative numbers.
- `invoiceId` is always server-generated to guarantee uniqueness and a consistent prefix.
- `customerSnapshot.name` and `customerSnapshot.company` are denormalized onto the invoice at create time so the list endpoint doesn't need a `$lookup` for every row. The seed script does the same; this trades a tiny write-time cost for a much cheaper read path.

---

## Assumptions

- **Currency is INR.** All `formatCurrency` calls render the `₹` symbol. The dataset contains no currency field, so no conversion logic exists.
- **Tax is a percentage, not a decimal.** A row with `taxRate: 18` and `amount: 1000` has `tax: 180`, not `18.00`.
- **`tax` and `total` are always derived from `amount` + `taxRate`.** Even if a client sends them, the server overwrites them.
- **1 customer = 1 company.** Enforced by a unique compound index; the API does not expose a way to assign the same customer to a second company.
- **`dueDate` must be on or after `issueDate`.** Enforced in the Zod refinement; the database doesn't know "on or after" without a custom validator.
- **Past `issueDate` is allowed.** The seed contains 2025-06 dates paired with 2026-06 due dates. The form allows free choice.
- **Deletion is hard.** No soft-delete column; the API does `findByIdAndDelete`.
- **No authentication / authorization.** Out of scope for the assignment; the API is fully open.
- **Render free-tier cold starts can take 30-60s.** The frontend axios instance is configured with a 60s timeout and a single retry on timeout/Network Error so the first request after the service spins down succeeds transparently.

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

## Deployment

Free-tier guide for **Vercel** (frontend) + **Render** (backend) + **MongoDB Atlas** (database) — see [DEPLOY.md](./DEPLOY.md).

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
| GET    | `/summary`                  | Global totals: Total billed, Total tax, # Invoices, # Customers |

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

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for the full text.

Copyright © 2026 rishavtarway
