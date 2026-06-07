# Tatawur Team Portal — Implementation Plan

**Date:** 2026-06-06  
**Author:** Izuku (VP of Software Products)  
**Status:** Phase 1 complete — Phase 2 pending  
**Reviewed by:** security-engineer, data-engineer, backend-engineer, frontend-engineer

---

## 1. What We're Building

A password-protected internal portal at `tatawur.ai/portal` layered over the existing marketing site. Three phases, all in scope for this build:

| Phase | Scope |
|---|---|
| **1 — Auth + Employee Profile** | Supabase Google OAuth login, employee dashboard (position, salary rate) |
| **2 — Timesheets** | Weekly time entry — project, date, hours, notes; week navigation; lock indicators |
| **3 — Admin Panel** | Project CRUD, employee management, all-employee timesheet view, week locking, billing rate management |
| **Phase 4 (future)** | PDF invoice generation (billable rates) + payroll summary (salary rates) |

The marketing site at `/` is **completely untouched**.

---

## 2. Technology Decisions

| Concern | Decision | Rationale |
|---|---|---|
| Auth provider | Supabase Google OAuth (`@tatawur.ai` domain only) | Team uses Google Workspace; no external users |
| Session management | `@supabase/ssr` (Next.js App Router) | Server-side sessions; secure for protected Server Components |
| Database | Supabase Postgres (dedicated Tatawur project) | Same project as auth; clean separation from code-check |
| Row-level security | Supabase RLS + `app_metadata.role` JWT claim | Enforced at DB layer — not bypassable via client SDK |
| Role in JWT | Supabase auth hook sets `role` in JWT at sign-in | Avoids DB round-trip in middleware for admin checks |
| Billing rate isolation | Separate `employee_billing_rates` table (admin-only RLS) | Only a separate table enforces column isolation in Supabase |
| Per-project billing | Explicit `(employee_id, project_id)` pair — no default | Admin sets each pair; simplest schema, strictest control |
| Week locking | `locked_weeks` table — admin inserts/deletes rows | Atomic: one action locks entire week for all employees |
| Edit window | Any unlocked week is editable — no time restriction | `locked_weeks` is the sole control mechanism |
| Admin guard | JWT claim in middleware + independent DB check in admin layout | Middleware is fast; layout is authoritative (handles stale JWT) |
| Data mutations | Server Actions exclusively | Consistent `@supabase/ssr` cookie pattern via `next/headers`; Route Handlers have different cookie threading requirements |
| Containerization | Multi-stage Dockerfile for Next.js; Supabase CLI for local dev | Docker image is environment-agnostic; env vars swap the Supabase target |
| Styling | Existing SCSS Modules + ink/ivory/ochre brand tokens | Brand consistency with marketing site |

---

## 3. Database Schema

### 3.1 Migration Order

Tables must be created in dependency order:

1. `employees`
2. `projects`
3. `employee_billing_rates` (references both `employees` and `projects`)
4. `time_entries` (references both `employees` and `projects`)
5. `locked_weeks` (references `employees`)

### 3.2 Tables

```sql
-- 1. Employees — visible to the employee themselves + admins
CREATE TABLE employees (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL CHECK (email LIKE '%@tatawur.ai'),  -- domain enforced at DB + trigger level
  title       TEXT NOT NULL,
  department  TEXT,
  salary_rate NUMERIC(10,2) NOT NULL,    -- $/hr, visible to the employee
  role        TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee','admin')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  started_at  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()  -- tracks salary/role/title changes
);

-- 2. Projects — predefined list managed by admin
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  client_name TEXT,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Per-employee, per-project billable rate — admin only
--    No default rate; must be set explicitly for every (employee, project) pair
CREATE TABLE employee_billing_rates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  billable_rate NUMERIC(10,2) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, project_id)
);

-- 4. Time entries — one row per employee × project × work_date
CREATE TABLE time_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  project_id  UUID NOT NULL REFERENCES projects(id),
  work_date   DATE NOT NULL,
  hours       NUMERIC(4,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, project_id, work_date)
  -- Note: the UNIQUE key allows up to 24h per project per day.
  -- Total daily hours across all projects is NOT enforced at DB level
  -- (e.g., an employee could log 8h on project A and 8h on project B).
  -- Application layer should validate total daily hours if a cap is desired.
);

-- 5. Locked weeks — admin inserts a row to lock, deletes to unlock
--    week_start is always the Monday of the target week
CREATE TABLE locked_weeks (
  week_start  DATE PRIMARY KEY CHECK (EXTRACT(DOW FROM week_start) = 1),
  locked_by   UUID NOT NULL REFERENCES employees(id),
  locked_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.3 Indexes

The UNIQUE constraints on `employees.user_id` and `employee_billing_rates(employee_id, project_id)` already create implicit indexes — no explicit duplicate indexes needed.

```sql
-- time_entries: primary access patterns
CREATE INDEX idx_time_entries_employee_date ON time_entries(employee_id, work_date DESC);
CREATE INDEX idx_time_entries_project       ON time_entries(project_id);
CREATE INDEX idx_time_entries_work_date     ON time_entries(work_date);
-- work_date index retained: admin week queries (all entries in a locked week, across all employees)
-- require date-only lookups that the composite employee+date index cannot serve efficiently.
```

### 3.4 Helper Functions

All `SECURITY DEFINER` functions include `SET search_path = ''` to prevent search_path injection.

```sql
-- Is the current session user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT (auth.jwt()->'app_metadata'->>'role') = 'admin';
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';

-- Is the week containing the given date locked?
CREATE OR REPLACE FUNCTION week_is_locked(d DATE)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.locked_weeks
    WHERE week_start = date_trunc('week', d)::date
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';
```

### 3.5 Row Level Security Policies

```sql
-- employees: read own row; admins read/write all
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "emp_select" ON employees FOR SELECT
  USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "emp_admin_all" ON employees FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- employee_billing_rates: admin only — employees have zero access
ALTER TABLE employee_billing_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_admin_only" ON employee_billing_rates FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- projects: all authenticated users read active projects; admins manage all
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects FORCE ROW LEVEL SECURITY;
CREATE POLICY "proj_read" ON projects FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);
CREATE POLICY "proj_admin_all" ON projects FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- time_entries: employees CRUD their own rows in unlocked weeks; admins manage all
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "te_select" ON time_entries FOR SELECT
  USING (
    employee_id = (SELECT id FROM employees WHERE user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "te_insert" ON time_entries FOR INSERT
  WITH CHECK (
    employee_id = (SELECT id FROM employees WHERE user_id = auth.uid())
    AND NOT week_is_locked(work_date)
  );

CREATE POLICY "te_update" ON time_entries FOR UPDATE
  USING (
    employee_id = (SELECT id FROM employees WHERE user_id = auth.uid())
    AND NOT week_is_locked(work_date)
  )
  WITH CHECK (
    employee_id = (SELECT id FROM employees WHERE user_id = auth.uid())
    AND NOT week_is_locked(work_date)
  );

CREATE POLICY "te_delete" ON time_entries FOR DELETE
  USING (
    employee_id = (SELECT id FROM employees WHERE user_id = auth.uid())
    AND NOT week_is_locked(work_date)
  );

CREATE POLICY "te_admin_all" ON time_entries FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- locked_weeks: all authenticated users read; admins write
ALTER TABLE locked_weeks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lw_read" ON locked_weeks FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "lw_admin_all" ON locked_weeks FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());
```

### 3.6 Auth Trigger — New User Sign-In

The trigger fires on both `INSERT` (new user) and `UPDATE` (email change) to prevent domain-bypass via post-creation email modification.

Both functions are `SECURITY DEFINER` with `SET search_path = ''`.

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Reject anyone without a @tatawur.ai email — no exceptions
  IF NEW.email NOT LIKE '%@tatawur.ai' THEN
    RAISE EXCEPTION 'Access restricted to @tatawur.ai accounts';
  END IF;

  -- Set default role in app_metadata
  UPDATE auth.users
    SET raw_app_meta_data = raw_app_meta_data || '{"role": "employee"}'::jsonb
    WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fires on first sign-in (INSERT)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Fires on email change (UPDATE) — prevents domain bypass
CREATE OR REPLACE FUNCTION handle_user_email_update()
RETURNS trigger AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    IF NEW.email NOT LIKE '%@tatawur.ai' THEN
      RAISE EXCEPTION 'Access restricted to @tatawur.ai accounts';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER on_auth_user_email_updated
  BEFORE UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_email_update();
```

### 3.7 Supabase Auth Hook — Role in JWT

Configure a Supabase Auth Hook (Database → Webhooks → Auth Hooks → `customize_access_token`) to embed `role` into the JWT at sign-in:

```sql
CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  claims := event->'claims';
  user_role := event->'claims'->'app_metadata'->>'role';
  IF user_role IS NULL THEN
    user_role := 'employee';
  END IF;
  claims := jsonb_set(claims, '{app_metadata,role}', to_jsonb(user_role));
  RETURN jsonb_set(event, '{claims}', claims);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

GRANT EXECUTE ON FUNCTION custom_access_token_hook TO supabase_auth_admin;
```

This ensures `role` is always available in the JWT so middleware can check it without a DB round-trip.

> **Admin promotion:** Set `app_metadata.role = "admin"` in Supabase dashboard → Authentication → Users. User must sign out and back in for the new JWT claim to take effect. Also create/update their `employees` row with `role = 'admin'`.

---

## 4. Environment Strategy

Two environments only — no staging. The Supabase CLI local stack is a sufficient test layer for an internal tool at this scale. Revisit staging when Phase 4 (invoice generation) ships.

| Environment | Next.js | Supabase | Purpose |
|---|---|---|---|
| **Local dev** | `bun run dev` or `docker compose up` | Supabase CLI (`supabase start`) on `localhost:54321` | Development and testing |
| **Production** | Docker container | One cloud project | Live |

### 4.1 Supabase CLI — Local Dev

The Supabase CLI spins up a full local stack (Postgres, Auth, Studio, Inbucket for email) in Docker automatically. Developers never manage Postgres directly.

```
supabase/
├── config.toml          # Supabase CLI project config (ports, auth settings)
└── migrations/
    ├── 001_tables.sql
    ├── 002_indexes.sql
    ├── 003_rls.sql
    ├── 004_triggers.sql
    └── 005_auth_hook.sql
```

Local dev workflow:
```bash
supabase start          # boots local Supabase stack (Docker required)
supabase db reset       # re-runs all migrations + seed data from scratch
bun run dev             # Next.js dev server pointing at localhost Supabase
supabase stop           # shut down when done
```

Local `.env.local` points to the CLI stack:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key-from-supabase-start-output>
```

Supabase Studio (local admin UI) is available at `http://localhost:54323` — useful for inspecting data and testing RLS during development.

### 4.2 Dockerfile — Production

Multi-stage build: dependencies installed in a builder stage, only the production output copied to the final image. Supabase target is controlled entirely by env vars at runtime.

```dockerfile
# Stage 1: install deps
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Stage 2: build
FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Stage 3: production runtime
FROM oven/bun:1-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
# standalone output places the entrypoint at server.js in the working directory
# after COPY --from=builder /app/.next/standalone ./
CMD ["bun", "server.js"]
```

> Requires `output: 'standalone'` in `next.config.js`.

### 4.3 Docker Compose — Local Full-Stack Testing

For validating the containerized Next.js app before deploying to prod:

```yaml
# docker-compose.yml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local      # points at local Supabase CLI stack
```

Run `supabase start` first (manages its own containers), then `docker compose up web`. This confirms the Docker image works correctly before a prod deploy.

### 4.4 `.dockerignore`

```
node_modules
.next
.git
.env*
*.md
supabase/.branches
supabase/.temp
```

---

## 5. Next.js App Router Structure

```
src/
├── app/
│   ├── page.tsx                              # Marketing site (unchanged)
│   ├── layout.tsx                            # Root layout (unchanged)
│   └── portal/
│       ├── login/
│       │   └── page.tsx                      # Login — "Sign in with Google"
│       ├── auth/callback/
│       │   └── route.ts                      # OAuth callback — MUST use NextResponse cookie threading
│       ├── layout.tsx                        # Protected layout — getUser() auth guard + PortalNav
│       ├── dashboard/
│       │   └── page.tsx                      # Employee home: name, title, salary rate, week summary
│       ├── timesheets/
│       │   └── page.tsx                      # Server Component — reads ?week= param, redirects to
│       │                                     # canonical URL if missing, fetches entries + lock status
│       └── admin/
│           ├── layout.tsx                    # Admin guard — JWT claim check + independent DB check
│           ├── page.tsx                      # Admin home — overview stats
│           ├── projects/
│           │   ├── page.tsx                  # Project list (active + inactive)
│           │   └── [id]/page.tsx             # Edit/create project
│           ├── employees/
│           │   ├── page.tsx                  # Employee list with salary rate
│           │   └── [id]/page.tsx             # Edit employee: rates, title, billing rates per project
│           ├── timesheets/
│           │   └── page.tsx                  # All-employee view — filter by week, employee, project
│           └── weeks/
│               └── page.tsx                  # Week lock/unlock management (last 12 weeks)
├── lib/
│   └── supabase/
│       ├── client.ts                         # createBrowserClient — Client Components only
│       ├── server.ts                         # createServerClient — Server Components + Server Actions
│       └── middleware.ts                     # refreshSession helper — threads NextResponse cookies correctly
├── components/
│   ├── portal/
│   │   ├── PortalNav.tsx + .module.scss      # Server Component — top nav
│   │   ├── TimesheetShell.tsx + .module.scss # 'use client' — owns modal state { open, day, entry }
│   │   ├── WeekPicker.tsx + .module.scss     # 'use client' — prev/next nav, router.push(?week=)
│   │   ├── DayColumn.tsx + .module.scss      # 'use client' — day cell, calls onAddClick(day)
│   │   ├── EntryForm.tsx + .module.scss      # 'use client' — modal (single instance, lifted to Shell)
│   │   └── LockBanner.tsx + .module.scss     # Server Component — "Week locked" banner (rendered once)
│   └── admin/
│       ├── AdminNav.tsx + .module.scss       # Server Component — sidebar nav
│       ├── ProjectForm.tsx + .module.scss    # 'use client' — create/edit project form
│       ├── EmployeeForm.tsx + .module.scss   # 'use client' — edit employee + billing rates table
│       ├── WeekLockToggle.tsx + .module.scss # 'use client' — Radix AlertDialog confirm before lock/unlock
│       └── AllTimesheets.tsx + .module.scss  # 'use client' — filters UI; data fetched server-side with pagination
└── middleware.ts                             # Next.js middleware — refreshes session, guards /portal/*
```

---

## 6. Auth Flow

```
GET /portal/*
    │
    ▼
middleware.ts
  - createServerClient with NextResponse cookie threading (session refresh)
  - If no session → redirect /portal/login
  - If /portal/admin/* AND JWT app_metadata.role ≠ 'admin' → redirect /portal/dashboard
    │
    ▼ (authenticated)
portal/layout.tsx  (Server Component)
  - supabase.auth.getUser()  ← hits Supabase Auth server; NOT getSession() (avoids trusting local JWT)
  - If no user → redirect /portal/login  (independent of middleware — authoritative guard)
  - Pass user to children as props
    │
    ▼ (for admin routes)
portal/admin/layout.tsx  (Server Component)
  - Reads employees row for current user to verify role = 'admin'  ← DB check, handles stale JWT
  - If not admin → redirect /portal/dashboard
```

**OAuth callback (`src/app/portal/auth/callback/route.ts`):**

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const response = NextResponse.redirect(`${origin}/portal/dashboard`)

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          // CRITICAL: set/remove must write to the response, not the store
          set: (name, value, options) => response.cookies.set(name, value, options),
          remove: (name, options) => response.cookies.set(name, '', options),
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      // Expired/reused code — redirect to login with error param rather than
      // silently landing an unauthenticated user on the dashboard
      return NextResponse.redirect(`${origin}/portal/login?error=auth_failed`)
    }
  }

  return response  // session cookie is now on the response
}
```

> **Critical:** The cookie adapter's `set`/`remove` must write to the `NextResponse` object — not to the incoming `cookieStore`. This is a common `@supabase/ssr` mistake that silently fails to persist the session.

---

## 7. Timesheet UX

**URL pattern:** `/portal/timesheets?week=2026-06-02` (Monday date). When `?week=` is absent, the Server Component computes the current Monday and issues a server-side redirect to the canonical URL — no client-side flash.

**Week view layout:**

```
[← Prev]  Week of June 2–8, 2026  🔒 LOCKED  [Next →]

          Mon 2   Tue 3   Wed 4   Thu 5   Fri 6   Sat 7   Sun 8
Project A  3.0h    —      2.5h    —       —       —       —
Project B  —      4.0h    2.0h    3.0h    —       —       —
[+ Add]   [+ Add] [+ Add] [+ Add] [+ Add] [+ Add] [+ Add]

Total     3.0h    4.0h    4.5h    3.0h    0h      0h      0h
Week total: 14.5h
```

Rendered as a semantic `<table>` with `<th scope="col">` for day headers and `<th scope="row">` for project names — required for screen reader keyboard navigation.

**Lock indicator:** A single `LockBanner` component above the grid. `WeekPicker` may show a small lock icon badge, but `LockBanner` is the authoritative display. Both receive `isLocked` as a prop passed down from `TimesheetShell` — this keeps lock state in one place and ensures both update together when `WeekLockToggle` fires a Server Action and triggers revalidation.

**Locked weeks:** `[+ Add]` buttons not rendered; entries are read-only.

**Entry form (modal):**
- Single `EntryForm` instance lifted to `TimesheetShell` — not one per cell
- `TimesheetShell` owns state: `{ open: boolean, day: Date | null, existingEntry: TimeEntry | null }`
- `DayColumn` calls `onAddClick(day)` / `onEditClick(entry)` — no modal state in `DayColumn`
- Fields: Project dropdown (active projects only), Hours (controlled input with `0.5` step — validates on blur, rejects values outside 0.5–24 range with explicit error message; stepper `+`/`-` buttons for mobile must include `aria-label="Increase hours"` / `aria-label="Decrease hours"` since they are icon-only), Notes textarea
- Submits via Server Action

---

## 8. Admin Panel UX

### `/portal/admin` — Dashboard
Quick stats: employees active, projects active, entries this week, weeks not yet locked.

### `/portal/admin/projects` — Project Management
Table: name, client, status. Actions: new project, edit, toggle active/inactive.

### `/portal/admin/employees` — Employee Management
Table: name, title, salary rate, active. Click employee → edit page.

Employee edit page:
- Name, title, department, salary_rate, started_at
- Billing rates section: table of `(project, billable_rate)` pairs — add/edit/remove per project

### `/portal/admin/timesheets` — All Timesheets
- Filters: week picker, employee dropdown, project dropdown (server-side — filter params in URL)
- Paginated server-side — fetch N rows at a time, not the full dataset client-side
- CSV export is a Server Action that streams the full filtered dataset — not a client-side blob
- Table: employee, project, date, hours, notes

### `/portal/admin/weeks` — Week Lock Management
Last 12 weeks listed. Each row: week range, entry count, lock status, action button.
- **Lock:** Inserts into `locked_weeks`. Opens Radix `AlertDialog` first — confirm button is not default-focused.
- **Unlock:** Deletes from `locked_weeks`. AlertDialog copy: "This will allow employees to edit or delete entries for this week, including entries that may already have been used for payroll. This cannot be automatically reversed. Are you sure?" Confirm button is destructive-styled (ivory on ochre), not default-focused.

---

## 9. Environment Variables

`.env.local` (never commit — in `.gitignore`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

`.env.example` (commit this):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

> `NEXT_PUBLIC_` prefix is safe for the anon/publishable key — it is not a secret. Any service role key (if ever needed for privileged operations) must be in a non-`NEXT_PUBLIC_` var and accessed only in Server Components or Server Actions.

---

## 10. UI Design Principles

Portal uses the same brand tokens — no new design language:

| Token | Usage in portal |
|---|---|
| `var(--ink)` | Page background |
| `var(--ivory)` | Body text, entry values |
| `var(--ochre)` | Sparse accents — portal nav CTA, lock icon |
| `--font-outfit` | UI labels, nav |
| `--font-dm-sans` | Form fields, table cells |
| `--font-jetbrains-mono` | Hour values, totals |

The portal is a separate page surface from the marketing site — it has its own 3-slot ochre budget.

---

## 11. Execution Plan

### Phase 1A — Foundation (Parallel, ~1–2 days)

| Workstream | Teammate | Files Owned |
|---|---|---|
| DB Schema | `data-engineer` | `supabase/migrations/001_tables.sql`, `002_indexes.sql`, `003_rls.sql`, `004_triggers.sql`, `005_auth_hook.sql`, `supabase/config.toml`, `supabase/seed.sql` |
| Auth + Middleware | `backend-engineer` | `src/middleware.ts`, `src/lib/supabase/`, `src/app/portal/auth/callback/route.ts`, `src/app/portal/login/page.tsx`, `next.config.js` (standalone output) |
| Employee Dashboard | `frontend-engineer` | `src/app/portal/layout.tsx`, `src/app/portal/dashboard/page.tsx`, `src/components/portal/PortalNav.*` |
| Docker + CI | `devops-infrastructure-engineer` | `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `.env.example` (updated with local keys), `README.md` (dev setup instructions) |

### Phase 1B — Quality Gate (Sequential after 1A)

| Workstream | Teammate | Scope |
|---|---|---|
| Security Review | `security-engineer` | RLS policies, triggers, auth hook, env var audit, admin route guard, `search_path` verification |

### Phase 2 — Timesheets (Parallel, ~2 days) — NEXT UP

> Phase 1 shipped in PR #7. Phase 2 will begin in a follow-on session.

| Workstream | Teammate | Files Owned |
|---|---|---|
| Timesheet Server Layer | `backend-engineer` | `src/app/portal/timesheets/page.tsx`, Server Actions for time entry CRUD |
| Timesheet UI | `frontend-engineer` | `src/components/portal/TimesheetShell.*`, `WeekPicker.*`, `DayColumn.*`, `EntryForm.*`, `LockBanner.*` |

### Phase 3 — Admin Panel (Parallel, ~3 days)

| Workstream | Teammate | Files Owned |
|---|---|---|
| Admin data layer | `backend-engineer` | `src/app/portal/admin/**/page.tsx` (Server Components + data fetch), Server Actions for all admin CRUD |
| Admin UI | `frontend-engineer` | `src/components/admin/AdminNav.*`, `ProjectForm.*`, `EmployeeForm.*`, `WeekLockToggle.*`, `AllTimesheets.*` |

### Phase 4 — Invoicing (Future session)

- Invoice PDF: customer, date range, itemized rows (employee × project × hours × billable_rate). Will surface missing `employee_billing_rates` pairs before generating.
- Payroll summary PDF: hours × salary_rate per employee.
- Library TBD at Phase 4 planning.

---

## 12. Manual Setup (Tarek — Before Execution Starts)

### Supabase (one project only)

1. **Create one Supabase project** — `tatawur-portal` at supabase.com. This is the production project. No staging project needed at this scale.
2. **Enable Google OAuth** — Auth → Providers → Google. Requires a Google Cloud OAuth 2.0 client ID + secret (create under the tatawur.ai Google Workspace).
3. **Add redirect URLs** to Auth → URL Configuration:
   - `https://tatawur.ai/portal/auth/callback`
   - `http://localhost:3000/portal/auth/callback`
4. **Configure Auth Hook** — Database → Webhooks → Auth Hooks → `customize_access_token` → `custom_access_token_hook` (deployed via migration `005_auth_hook.sql`).
5. **Get credentials** — Supabase Settings → API → copy project URL + anon key.

### Local dev setup

6. **Install Supabase CLI**: `brew install supabase/tap/supabase`. Docker Desktop must be running.
7. **Create `.env.local`** — local Supabase values come from `supabase start` output:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from `supabase start` output>
   ```
8. **Create `.env.prod`** (never committed) with the cloud project credentials — used when running the Docker container against prod.

### After first deploy

9. **Promote yourself to admin** — Supabase dashboard → Authentication → Users → find your user → edit `app_metadata` → add `{"role": "admin"}`. Sign out and back in for the new JWT claim to take effect.

---

## 13. Decisions Resolved

| Question | Decision |
|---|---|
| Dedicated Supabase project? | Yes — new dedicated project for Tatawur |
| External emails? | No — `@tatawur.ai` only, enforced in auth trigger (INSERT + UPDATE) |
| Edit window? | Any unlocked week — `locked_weeks` is the only gate |
| Default billable rate? | No — explicit per employee-project pair only |
| Phase 3 in scope? | Yes — fully included in this build |
| Server Actions vs Route Handlers? | Server Actions exclusively for all mutations |
| Daily hours cap across projects? | Not enforced at DB level — application layer validates if needed |
| Admin SELECT on inactive projects? | Intentional — `proj_admin_all FOR ALL` includes SELECT; admins manage the full project list |
| `idx_time_entries_work_date` kept? | Yes — admin week queries filter by date across all employees; composite index cannot serve this |

---

## 14. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Google OAuth / Auth Hook setup delay | Medium | Tarek does this before sprint starts — blocks Phase 1A auth work |
| OAuth callback cookie not persisted | Low | Explicit `NextResponse` cookie threading pattern documented in plan + code review gate |
| Stale JWT after admin demotion | Low | Admin layout does independent DB check; stale JWT only bypasses middleware redirect, not layout guard |
| Billing rate missing for invoice | Low | Phase 4 surfaces missing pairs before PDF generation |
| `AllTimesheets` performance | Low | Server-side pagination from day one; CSV export via Server Action |
| Brand drift in portal UI | Low | Same SCSS token system; enforced in code review |
| `standalone` output missing from `next.config.js` | Low | `devops-infrastructure-engineer` sets this in Phase 1A; Docker build fails fast if missing |
