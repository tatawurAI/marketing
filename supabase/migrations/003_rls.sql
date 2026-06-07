-- Migration: 003_rls
-- Row Level Security policies for all tables.
-- Helper functions use SECURITY DEFINER + SET search_path = '' to prevent search_path injection.

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT (auth.jwt()->'app_metadata'->>'role') = 'admin';
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION week_is_locked(d DATE)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.locked_weeks
    WHERE week_start = date_trunc('week', d)::date
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';

-- Returns the employee id for the currently authenticated user.
-- Extracted as a stable function so RLS policies don't re-run the subquery per row.
CREATE OR REPLACE FUNCTION my_employee_id()
RETURNS UUID AS $$
  SELECT id FROM public.employees WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';

-- ---------------------------------------------------------------------------
-- employees
-- ---------------------------------------------------------------------------

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees FORCE ROW LEVEL SECURITY;

CREATE POLICY "emp_select" ON employees FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "emp_admin_all" ON employees FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- employee_billing_rates: admin only
-- ---------------------------------------------------------------------------

ALTER TABLE employee_billing_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_billing_rates FORCE ROW LEVEL SECURITY;

CREATE POLICY "billing_admin_only" ON employee_billing_rates FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- projects: authenticated read active; admin all
-- ---------------------------------------------------------------------------

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects FORCE ROW LEVEL SECURITY;

CREATE POLICY "proj_read" ON projects FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "proj_admin_all" ON projects FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- time_entries
-- ---------------------------------------------------------------------------

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries FORCE ROW LEVEL SECURITY;

CREATE POLICY "te_select" ON time_entries FOR SELECT
  USING (
    employee_id = my_employee_id()
    OR is_admin()
  );

CREATE POLICY "te_insert" ON time_entries FOR INSERT
  WITH CHECK (
    employee_id = my_employee_id()
    AND NOT week_is_locked(work_date)
  );

-- BOTH USING and WITH CHECK needed: USING controls which rows can be targeted,
-- WITH CHECK prevents changing work_date to a locked week.
CREATE POLICY "te_update" ON time_entries FOR UPDATE
  USING (
    employee_id = my_employee_id()
    AND NOT week_is_locked(work_date)
  )
  WITH CHECK (
    employee_id = my_employee_id()
    AND NOT week_is_locked(work_date)
  );

CREATE POLICY "te_delete" ON time_entries FOR DELETE
  USING (
    employee_id = my_employee_id()
    AND NOT week_is_locked(work_date)
  );

CREATE POLICY "te_admin_all" ON time_entries FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- locked_weeks: all authenticated read; admin write
-- ---------------------------------------------------------------------------

ALTER TABLE locked_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE locked_weeks FORCE ROW LEVEL SECURITY;

CREATE POLICY "lw_read" ON locked_weeks FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "lw_admin_all" ON locked_weeks FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());
