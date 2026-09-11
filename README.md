# Velozity Client Project Dashboard

Real-time dashboard for tracking client projects, tasks, and team activity, built for the Velozity technical assessment.

## Stack
- **Frontend:** React + TypeScript + Vite, Zustand for auth state, Socket.io-client for real-time
- **Backend:** Node.js + Express + TypeScript
- **DB:** PostgreSQL via Prisma
- **Real-time:** Socket.io (see "Architectural decisions" below for why)
- **Background jobs:** node-cron

## Local setup (Docker for Postgres, everything else runs locally)

```bash
# 1. clone the repo, then from the root:
cp .env.example backend/.env      # fill in real secrets for JWT_ACCESS_SECRET / JWT_REFRESH_SECRET
cp frontend/.env.example frontend/.env

# 2. spin up postgres
docker-compose up -d

# 3. backend
cd backend
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev          # runs on :5000

# 4. frontend (new terminal)
cd frontend
npm install
npm run dev           # runs on :5173
```

Login with any of the seeded users (password `password123` for all):
- `admin@velozity.com` — Admin
- `pm1@velozity.com` / `pm2@velozity.com` — Project Managers
- `dev1@velozity.com` through `dev4@velozity.com` — Developers

## Database schema

```
User ─┬─< Project (createdById)
      ├─< Task (assignedToId)
      ├─< TaskActivityLog (userId)
      ├─< Notification (userId)
      └─< RefreshToken (userId)

Client ─< Project ─< Task ─┬─< TaskActivityLog
                            └─< Notification (relatedTaskId)
```

**Indexes and why:**
- `Task(projectId)`, `Task(assignedToId)`, `Task(status)`, `Task(priority)`, `Task(dueDate)` — every filter-bar query and both the PM/Developer dashboards hit these columns constantly
- `TaskActivityLog(taskId, createdAt)` composite — the activity feed and catchup endpoint always query "logs for X ordered by time"
- `Project(createdById)` — PM ownership scoping runs on every project/task list request
- `Notification(userId, isRead)` composite — the unread-count badge query runs on essentially every page load

## Architectural decisions

- **Socket.io over raw WebSocket:** needed room-based broadcasting (per-project, per-role) plus automatic reconnection handling. Native `ws` would mean hand-rolling both of those.
- **node-cron over Bull:** the only scheduled job is "flip overdue tasks every 5 minutes" — no retries, no distributed workers needed, so a full job queue would be overkill.
- **Refresh token in an HttpOnly cookie, access token in memory:** the refresh token is invisible to client-side JS, which closes off the usual XSS-token-theft path. The access token lives in Zustand state (not localStorage) and is short-lived (15 min), so even if it leaked the exposure window is small.
- **Role middleware vs. ownership scoping kept as two separate layers:** `requireRole()` only checks "is this a PM." Whether a PM owns *this specific* project is enforced with a `WHERE createdById = req.user.id` clause inside the service functions — mixing these two checks is a common way real apps end up leaking one PM's data to another.

## Known limitations
- Presence tracking (online user count) is in-memory on a single server instance — would need Redis to work correctly if scaled to multiple backend instances.
- No rate limiting on the login endpoint yet.
- Notification "mark as read" happens on click in the dropdown, no swipe/bulk-select UI.
- Frontend styling is intentionally minimal — time went into RBAC correctness and the real-time feed over visual polish.

## Explanation (for the submission form)

The hardest problem was the real-time, role-filtered activity feed with missed-event catchup. The fix was designing the Socket.io room strategy and the database catchup query to share the exact same scoping rules: Admins get a `global-feed` room and an unfiltered DB query; PMs get a `pm-{userId}` room and a query filtered to projects they created; Developers get `dev-{userId}` and a query filtered to tasks assigned to them. Every task status change writes a row to `TaskActivityLog` first, then fans out to whichever rooms apply, so the live event and the catchup event are always generated from the same source of truth — no separate "cache" that could drift out of sync with the database. If I had more time, I'd move presence tracking to Redis so it survives server restarts and works across multiple instances, and add optimistic UI updates on the frontend so status changes feel instant instead of waiting on the round trip.
