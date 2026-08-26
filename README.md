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

## Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL, VITE_TURNSTILE_SITE_KEY
npm run dev   # http://localhost:5173
```

Vercel can deploy directly from the repository root using the included
`vercel.json`, which installs and builds the `frontend/` application. If you
prefer configuring it in the Vercel dashboard instead, set the project's Root
Directory to `frontend/`.

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
