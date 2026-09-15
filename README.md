# Kinetiq — Delivery Command Center

*(formerly "Velozity Client Project Dashboard")*

Real-time command center for tracking client projects, tasks, and team activity. The backend, database schema, auth model, and socket architecture are the original technical-assessment build, untouched. The frontend has been redesigned from the inline-styled version described below into a proper premium interface — see **[Design & research notes](#design--research-notes)** for what changed, why, and what it's based on.

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

## Design & research notes

The original build (still true of the backend today) was intentionally unstyled — every component used inline `style={{}}` objects, there was no design system, and the login page even shipped a stray `style="..."` string attribute that's invalid in typed JSX. The brief for that phase was "prove the architecture and the role-security model work"; visual design wasn't in scope.

This pass takes the opposite brief: keep every API call, socket event, auth flow, Prisma schema, and route untouched, and rebuild only what renders around it. Renamed to **Kinetiq** for that reason — the surface changed enough that "Velozity Dashboard" (a wall of default-styled `<table>`s) no longer describes what's on screen. Nothing under `backend/`, no `.env` keys, no seeded data, and no `render.yaml` service name changed, so existing deployments keep working.

**What's new, concretely:**
- A real design system: Tailwind wired up properly (it was a `package.json` dependency that was never configured), dark theme, `Space Grotesk` / `Inter` type, a reusable component layer under `frontend/src/components/ui/`.
- Motion via Framer Motion — scroll-triggered reveals (`Reveal`), spring-based hover states, animated stat counters, a live-updating activity timeline.
- Genuine 3D, not a fake shadow trick: `TiltCard` uses CSS `perspective` + `rotateX/rotateY` driven by pointer position; `OrbitWorkload` renders each developer's task count as a node orbiting in true 3D space via `rotateY(...) translateZ(...)`. Both are dependency-free CSS transforms rather than a Three.js/WebGL bundle, which keeps the app's footprint close to what it was.
- A background canvas particle network on the login screen (plain Canvas 2D, no dependency) echoing the grid-pattern reference image, reworked as a living backdrop with drifting aurora blobs instead of a static grid.
- A global `⌘K` command palette for fast navigation between dashboards and logout.

**Competitor gaps this was designed against** (Jira, Asana, Linear — researched via product reviews and comparison writeups current as of 2026):
1. **Notification overload with no native mute.** Asana and Jira reviewers on G2/Software Advice describe getting "dozens of notifications in a single day" from routine comment/status activity, with no one-click way to batch them — users resort to manually disabling categories or writing automation rules to cope. `NotificationBell` now groups the same feed by type into a collapsible digest (toggle to "All" if you want the raw list) — same data, same socket events, no backend change.
2. **The cost of that overload is measurable, not just annoying.** Gloria Mark et al., *["The Cost of Interrupted Work: More Speed and Stress"](https://dl.acm.org/doi/10.1145/1357054.1357072)* (CHI 2008), found interrupted work is resumed only after intervening tasks and measurable added stress; her UC Irvine lab's later observational work puts average refocus time at roughly 23 minutes. A dozen ungrouped pings isn't a dozen small costs — it's a dozen full context switches. That's the direct justification for grouping notifications instead of just re-skinning the bell icon.
3. **Ambient awareness beats another active alert.** Reviewers consistently praise Linear's keyboard-first speed and hurt on Jira's dated, noisy activity stream. Dourish & Bellotti's classic CSCW '92 paper *["Awareness and Coordination in Shared Workspaces"](https://dl.acm.org/doi/10.1145/143457.143468)* argues passive awareness (seeing who's around, ambiently) coordinates teams better than forcing people to actively broadcast status. The header's presence-ring avatars and the "online now" stat lean on data the backend already emits over the presence socket — no new events, just made visible instead of buried in a raw count.
4. **Mouse-only navigation is slow at scale.** Multiple 2026 Linear-vs-Jira/Asana comparisons cite keyboard-first navigation as saving real time daily and call out Asana/Jira's heavier, click-driven flows. The `⌘K` command palette is the direct answer, scoped to what this app actually has (dashboard jump, logout) rather than a scope-creeping feature.
5. **Dashboards as "walls of numbers."** The original code comments for `AdminDashboard` already flagged this: an admin could view stats but not act on anything or see who was overloaded. `OrbitWorkload` answers the second half — workload imbalance is a visual read (biggest node = most loaded developer) instead of a column you have to sort in your head.

## Security Testing

The brief specifically calls out that role access has to be enforced at the API level, not just hidden on the frontend — so here's proof it actually is, not just a claim. Run these yourself against the live backend and paste your actual results in (swap in real tokens/ids from your seeded data first).

**Step 1 — get tokens for two different developers:**
```bash
curl -X POST https://YOUR-BACKEND-URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev1@velozity.com","password":"password123"}'
# copy the accessToken from the response, call it DEV1_TOKEN

curl -X POST https://YOUR-BACKEND-URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev2@velozity.com","password":"password123"}'
# copy this one too, call it DEV2_TOKEN
```

**Test 1 — dev1 tries to update a task assigned to dev2 (should be blocked):**
```bash
curl -X PATCH https://YOUR-BACKEND-URL/api/tasks/<a-task-id-assigned-to-dev2>/status \
  -H "Authorization: Bearer DEV1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"DONE"}'
```
Expected: `403` with `"this is not your task to touch, nice try tho"`. This is the exact requirement from the brief — a dev can't touch another dev's data even with a valid token, because `task.service.ts` checks `task.assignedToId !== actingUser.id` on every status update, not just the role.

**Test 2 — one PM tries to read another PM's project (should 404, not 403):**
```bash
curl https://YOUR-BACKEND-URL/api/projects/<a-project-id-owned-by-pm2> \
  -H "Authorization: Bearer PM1_TOKEN"
```
Expected: `404`. Deliberately not `403` — the app doesn't even confirm the project exists to someone who has no business knowing that.

**Test 3 — no token at all:**
```bash
curl https://YOUR-BACKEND-URL/api/projects
```
Expected: `401`, no data returned, no stack trace leaked in the response body.

**Test 4 — developer tries to hit an admin-only route:**
```bash
curl https://YOUR-BACKEND-URL/api/dashboard/admin \
  -H "Authorization: Bearer DEV1_TOKEN"
```
Expected: `403`.

*(Results from running these against the live deployment:)*
- **Test 1 (Cross-dev task modification):** `403` ✓
- **Test 2 (Cross-PM project access):** `404` ✓
- **Test 3 (No token provided):** `401` ✓
- **Test 4 (Dev accessing admin route):** `403` ✓

## Known limitations
- Presence tracking (online user count) is in-memory on a single server instance — would need Redis to work correctly if scaled to multiple backend instances.
- No rate limiting on the login endpoint yet.
- Notification "mark as read" happens on click in the dropdown, no swipe/bulk-select UI.
- Frontend styling is intentionally minimal — time went into RBAC correctness and the real-time feed over visual polish.
- Backend is hosted on Render's free tier, which spins down after 15 minutes of inactivity — the first request after idle time can take ~50 seconds to respond while the instance wakes back up. Not a bug, just a free-tier tradeoff.

## Explanation (for the submission form)

The hardest problem was the real-time, role-filtered activity feed with missed-event catchup. The fix was designing the Socket.io room strategy and the database catchup query to share the exact same scoping rules: Admins get a `global-feed` room and an unfiltered DB query; PMs get a `pm-{userId}` room and a query filtered to projects they created; Developers get `dev-{userId}` and a query filtered to tasks assigned to them. Every task status change writes a row to `TaskActivityLog` first, then fans out to whichever rooms apply, so the live event and the catchup event are always generated from the same source of truth — no separate "cache" that could drift out of sync with the database. If I had more time, I'd move presence tracking to Redis so it survives server restarts and works across multiple instances, and add optimistic UI updates on the frontend so status changes feel instant instead of waiting on the round trip.