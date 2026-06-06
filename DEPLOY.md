# Deployment guide

Three free-tier services. Total cost: **$0/month**.

```
┌─────────────────────┐      HTTPS       ┌──────────────────────┐
│  Vercel (frontend)  │ ───────────────▶ │  Render (backend)    │
│  Vite + React       │                  │  Express + Node 20   │
└─────────────────────┘                  └──────────┬───────────┘
                                                    │ Mongo wire
                                                    ▼
                                          ┌──────────────────────┐
                                          │  MongoDB Atlas (M0)  │
                                          └──────────────────────┘
```

---

## 0. Prereqs (5 min)

- GitHub account (you have this — `rishavtarway/Invoice-dashboard`)
- Vercel account — https://vercel.com (sign in with GitHub)
- Render account — https://render.com (sign in with GitHub)
- MongoDB Atlas account — https://www.mongodb.com/cloud/atlas (sign in with Google or GitHub)

---

## 1. MongoDB Atlas (free M0 cluster, ~5 min)

1. **Create a free cluster**
   - Sign in → **Build a Cluster** → pick **M0 FREE** → any region → name it (e.g. `invoice-dashboard`)
   - Click **Create Deployment**
2. **Create a database user**
   - Atlas prompts you to create a username + password. Save both.
3. **Allow access from anywhere**
   - **Database Access** is for the user. **Network Access** is for IPs.
   - Go to **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)
   - Required because Render's egress IPs rotate.
4. **Get the connection string**
   - **Database** → **Connect** → **Drivers** → copy the `mongodb+srv://...` string
   - Replace `<username>` and `<password>` with the user from step 2
   - Add the database name at the end: `...mongodb.net/invoice_dashboard?retryWrites=true&w=majority`

You now have `MONGO_URI`. Save it.

---

## 2. Render — Backend (free web service, ~7 min)

1. **New Web Service** → connect `rishavtarway/Invoice-dashboard`
2. **Settings**
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node src/scripts/seed.js && node server.js`
     > The seed runs on every deploy — fast (~2s on a warm cluster) and keeps the DB in sync with the dataset. For a production app you'd split this out, but for the assignment it's the simplest path.
   - **Instance Type:** Free
3. **Environment variables** (Advanced → Add Env Var)
   | Key              | Value                                                                                  |
   |------------------|----------------------------------------------------------------------------------------|
   | `NODE_ENV`       | `production`                                                                           |
   | `MONGO_URI`      | the Atlas connection string from step 1                                               |
   | `CORS_ORIGIN`    | leave empty for now — paste your Vercel URL after step 3, then redeploy                |
   | `PORT`           | *(Render injects this automatically — do not set)*                                    |
4. **Deploy** — wait for "Live"
5. **Copy the URL** — looks like `https://invoice-dashboard-api.onrender.com`
6. **Smoke test** in a browser: `https://<your-service>.onrender.com/api/health` → `{"status":"ok",...}`
7. **Test data is in** — the start command seeded Mongo on first boot

> ⚠️ **Free tier caveat:** Render free instances spin down after 15 min of inactivity. The first request after that takes ~30–60s. This is fine for the assignment; not for real production.

---

## 3. Vercel — Frontend (~3 min)

1. **Add New Project** → import `rishavtarway/Invoice-dashboard`
2. **Settings**
   - **Framework Preset:** Vite (auto-detected)
   - **Root Directory:** `frontend`  ← click Edit, change from `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. **Environment variables**
   | Key                  | Value                                                |
   |----------------------|------------------------------------------------------|
   | `VITE_API_BASE_URL`  | `https://<your-render-service>.onrender.com/api`     |
4. **Deploy**
5. **Copy the URL** — looks like `https://invoice-dashboard-xyz.vercel.app`

---

## 4. Wire up CORS (1 min)

The backend only accepts requests from origins in `CORS_ORIGIN`.

1. Go back to **Render** → your service → **Environment**
2. Set `CORS_ORIGIN` = your Vercel URL (e.g. `https://invoice-dashboard-xyz.vercel.app`)
3. Save → Render auto-redeploys

> To allow multiple origins (preview deploys), separate with commas: `https://prod.vercel.app,https://staging.vercel.app`

---

## 5. Verify

Visit your Vercel URL. You should see the Invoices list with 2,000 rows. Test:
- Search "Sara" → ~38 results
- Filter by status `Void` → 339 invoices
- Click a customer → profile loads
- Click **New invoice** → modal opens, fill it, save

---

## Local development (no deploy)

```bash
# 1. Start Mongo locally (Docker)
docker run -d --rm -p 27017:27017 --name invoice-mongo mongo:7

# 2. Backend
cd backend
cp .env.example .env       # already has mongodb://127.0.0.1:27017/...
npm install
npm run seed               # one-time: load 2,000 invoices
npm run dev                # http://localhost:4000

# 3. Frontend (in a new terminal)
cd frontend
cp .env.example .env       # already has http://localhost:4000/api
npm install
npm run dev                # http://localhost:5173
```

Open http://localhost:5173.

---

## Costs

| Service      | Tier  | Limit                              | Cost  |
|--------------|-------|------------------------------------|-------|
| Vercel       | Hobby | 100 GB bandwidth/mo, unlimited sites | $0    |
| Render       | Free  | 750 hr/mo, spins down after 15 min idle | $0    |
| MongoDB Atlas| M0    | 512 MB storage, shared CPU         | $0    |

Upgrade paths: Vercel Pro ($20/mo) for team features, Render Starter ($7/mo) for always-on, Atlas M10 ($57/mo) for serious load.
