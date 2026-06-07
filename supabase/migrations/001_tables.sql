-- Migration: 001_tables
-- Creates core tables in FK dependency order.

-- 1. employees
CREATE TABLE employees (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL CHECK (email LIKE '%@tatawur.ai'),
  title       TEXT NOT NULL,
  department  TEXT,
  salary_rate NUMERIC(10,2) NOT NULL,
  role        TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee','admin')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  started_at  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. projects
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  client_name TEXT,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. employee_billing_rates (references employees + projects)
CREATE TABLE employee_billing_rates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  billable_rate NUMERIC(10,2) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, project_id)
);

-- 4. time_entries
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
);

-- 5. locked_weeks
CREATE TABLE locked_weeks (
  week_start  DATE PRIMARY KEY CHECK (EXTRACT(DOW FROM week_start) = 1),
  locked_by   UUID NOT NULL REFERENCES employees(id),
  locked_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
