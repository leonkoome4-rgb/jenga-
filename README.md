# Moringa × Tawi

*Where your work branches out.*

Tawi is a permanent project bank and creator network for Moringa School students, so project work doesn't disappear after a cohort ends. Students showcase projects, discover others' work, connect to collaborate, and can optionally support the platform via M-Pesa ("Changia"). Admins manage cohorts and moderate content after the fact.

Full-stack: Flask + PostgreSQL backend, React + Redux Toolkit frontend.

## Structure

```
backend/    Flask API — models, JWT auth, ownership-enforced routes, AI Hub, M-Pesa
frontend/   React + Redux Toolkit + Tailwind
```

## Backend

```bash
cd backend
python3 -m venv venv && venv/bin/pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET_KEY, AI_API_KEY, etc.
createdb tawi_dev
FLASK_APP=run.py venv/bin/flask db upgrade
venv/bin/python seed.py       # seeds cohorts, categories, tech tags
venv/bin/python run.py        # http://localhost:5000
```

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

### Changia (M-Pesa)

`app/services/mpesa_service.py` is a complete Daraja (Lipa na M-Pesa Online / STK
Push) implementation, but needs real Safaricom sandbox credentials in `.env`
(`MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`) to actually run —
those aren't included. `MPESA_CALLBACK_URL` needs to be a publicly reachable URL
(e.g. via ngrok in dev) since Safaricom calls it directly.

## Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

Deployed via Vercel with root directory set to `frontend/`.

## Screens

- **Feed** (`/discover`) — full-screen, swipeable "For You" feed of projects
- **Explore** (`/explore`) — search and filter by category or cohort
- **Leaderboard** (`/top`) — top-liked projects, filterable to your own cohort
- **Project detail** (`/projects/:id`) — full write-up, like, tip, and "Connect"
- **Profile** (`/profile`, `/creators/:id`) — a student's builds, stats, and skills
- **Add project** (`/add-project`) — publish a build with image/video, tech stack, team
- **AI Hub** — categorize, describe, tag, skill-gap, team-match, README, debug
- **Changia** — support the platform via M-Pesa
- **Admin** (`/admin`, `/admin/cohorts`) — manage projects and cohorts
