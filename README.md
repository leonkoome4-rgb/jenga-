# Tawi — by Moringa School

*Where your work branches out.*

Tawi is a project bank and discovery network for Moringa School students. Past and current students publish what they've built so it doesn't get forgotten after the cohort ends, discover what others have made, and connect to collaborate. Likes decide a cohort-filterable leaderboard, so publishing a project is also a way to compete and get noticed.

Frontend-only prototype for now — all data is mocked and seeded into the Redux store, shaped to match the eventual Flask/PostgreSQL API so swapping in a real backend later is a drop-in replacement, not a rewrite.

## Screens

- **Feed** (`/discover`) — full-screen, swipeable "For You" feed of projects, TikTok-style
- **Explore** (`/explore`) — search and filter by category or cohort
- **Leaderboard** (`/top`) — top-liked projects, filterable to your own cohort
- **Project detail** (`/projects/:id`) — full write-up, like, tip, and "Connect" to collaborate
- **Profile** (`/profile`, `/creators/:id`) — a student's builds, stats, and skills
- **Add project** (`/add-project`) — publish a build with image/video, tech stack, and team
- **Inbox** (`/inbox`) — likes and collaboration requests
- **Admin** (`/admin`, `/admin/cohorts`) — manage projects and cohorts

## Stack

- React 18 + Redux Toolkit
- React Router
- Tailwind CSS

## Getting started

```bash
npm install
npm run dev
```
