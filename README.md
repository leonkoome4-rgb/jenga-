# Moringa × Tawi

*Where your work branches out.*

Tawi is a permanent project bank and creator network for Moringa School students, so project work doesn't disappear after a cohort ends. Students showcase projects, discover others' work, and connect to collaborate. Admins manage cohorts and moderate content after the fact.

Full-stack: Flask + PostgreSQL backend, React + Redux Toolkit frontend.

## Structure

```
backend/    Flask API — models, JWT auth, ownership-enforced routes, AI Hub, CAPTCHA
frontend/   React + Redux Toolkit + Tailwind
```

## Backend

For local development, start both the backend and frontend from the repository
root with one command:

```bash
./scripts/dev.sh
```

The command keeps the services together: if either process stops, the other is
stopped too. The API is available at `http://127.0.0.1:5000` and the frontend
at `http://localhost:5173`.

```bash
cd backend
python3 -m venv venv && venv/bin/pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET_KEY, AI_API_KEY, TURNSTILE_*, etc.
createdb tawi_dev
FLASK_APP=run.py venv/bin/flask db upgrade
venv/bin/python seed.py       # seeds cohorts, categories, tech tags
venv/bin/python run.py        # http://127.0.0.1:5000
```

> On macOS, use `127.0.0.1:5000` rather than `localhost:5000` — the built-in
> AirPlay Receiver also listens on port 5000, and `localhost` can resolve to
> its IPv6 listener first, silently intercepting the request before it
> reaches Flask.

Run tests (spins up its own `tawi_test` database):

```bash
createdb tawi_test
venv/bin/python -m pytest tests/ -v
```

`tests/test_projects_ownership.py` is the one that matters most — it proves a user
can't PATCH or DELETE another user's project (403), and admins can moderate any
project regardless of ownership.

### AI Hub

7 features (categorize, description, tags, skill-gap, team-match, README, debug),
all sharing one `call_ai()` core in `app/services/ai_service.py`, via Groq's
OpenAI-compatible API. Every route requires a valid JWT and logs to `AI_HISTORY`.

### CAPTCHA (Cloudflare Turnstile)

Registration, login, and password reset are all gated by Cloudflare Turnstile,
verified server-side in `app/services/captcha_service.py` against Cloudflare's
`siteverify` API — the frontend widget alone proves nothing; a request without
a valid `captcha_token` is rejected by Flask before credentials are even
checked. `.env` ships with Cloudflare's published *always-passes* test keypair
(`TURNSTILE_SITE_KEY=1x00000000000000000000AA` /
`TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA`), fine for local
dev. Get real keys at https://dash.cloudflare.com/?to=/:account/turnstile for
production — the secret key must only ever live in the backend `.env`, never
in frontend code or `VITE_`-prefixed vars.

### Deploying the backend (Render)

`backend/render.yaml` is a Blueprint that provisions both the web service and
a free Postgres database in one go:

1. Push this repo to GitHub (already done if you're reading this from there).
2. On [Render](https://dashboard.render.com), click **New → Blueprint** and
   point it at this repo. Render reads `backend/render.yaml` automatically.
3. It'll ask for two secrets it can't infer on its own — `JWT_SECRET_KEY`
   (generate one with `openssl rand -hex 32`) and `AI_API_KEY` (your Groq
   key). Everything else (`DATABASE_URL`, `TURNSTILE_*`, `AI_MODEL`) is
   already filled in.
4. Deploy. The build step runs `flask db upgrade` and `python seed.py`
   automatically, so the schema and the Group 6 admin accounts are ready the
   moment it's live.
5. Copy the resulting service URL (`https://tawi-backend-xxxx.onrender.com`)
   into the frontend's `VITE_API_URL` and redeploy the frontend.

The free Postgres plan expires after 30 days — fine for a demo, upgrade the
database plan on Render's dashboard if this needs to stay up longer. The
Turnstile keys baked into `render.yaml` are Cloudflare's published
*always-passes* test keypair; swap them for real ones (see above) before
opening this up to real users instead of a demo audience.

## Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL, VITE_TURNSTILE_SITE_KEY
npm run dev   # http://localhost:5173
```

Vercel deploys directly from the repository root using the included
root-level `vercel.json`, which explicitly installs and builds the
`frontend/` app (`npm --prefix frontend ci` / `npm --prefix frontend run
build`) regardless of the project's dashboard Root Directory setting. This
matters because without it, Vercel's auto-deploy-on-push runs from a
directory with no `package.json` and fails instantly with `vite: command not
found` — that was silently broken for a while before this file was added.

## Production deployment

Two ways to run the full stack (frontend + backend + database) somewhere
real:

**Render** — `backend/render.yaml` is a Blueprint that provisions the API and
a free Postgres database in one step; see "Deploying the backend" above for
the exact steps. Pair it with the Vercel frontend deploy above by setting
`VITE_API_URL` to the Render service's URL.

**Docker Compose** — runs React, Flask, PostgreSQL, and migrations as one
stack, useful when you'd rather not split the frontend and backend across two
platforms:

```bash
cp deploy.env.example .env
# Edit .env and replace every placeholder secret.
docker compose up --build -d
```

If a Docker build fails because the machine ran out of space, remove only
Docker's unused build cache and retry (this preserves the `postgres_data`
database volume):

```bash
docker builder prune -af
docker compose up --build -d
```

The application is then available on port `8080`. Put it behind an HTTPS
reverse proxy or deploy the three services to a container host that provides
TLS. The backend runs Alembic migrations automatically on startup and the
PostgreSQL data is stored in the `postgres_data` volume. If you deploy the
frontend to Vercel instead of using the container's frontend, deploy just the
backend + PostgreSQL from this stack, set `VITE_API_URL` in Vercel to that
backend's public URL, and set `FRONTEND_ORIGIN` on the backend to the Vercel
URL.

## Screens

- **Landing** (`/`) — marketing page with login / get started
- **Login / Register** (`/login`, `/register`) — JWT auth, CAPTCHA-protected
- **Forgot / reset password** (`/forgot-password`, `/reset-password`) — CAPTCHA-protected
- **Feed** (`/discover`) — full-screen, swipeable "For You" feed of projects
- **Explore** (`/explore`) — search and filter by category or cohort
- **Leaderboard** (`/top`) — top-liked projects, filterable to your own cohort
- **Project detail** (`/projects/:id`) — full write-up, like, tip, and "Connect"
- **Profile** (`/profile`, `/creators/:id`) — a student's builds, stats, and skills
- **Add project** (`/add-project`) — publish a build with image/video, tech stack, team
- **AI Hub** (`/ai-hub`) — categorize, describe, tag, skill-gap, team-match, README, debug
- **Admin** (`/admin`, `/admin/cohorts`) — manage projects and cohorts
