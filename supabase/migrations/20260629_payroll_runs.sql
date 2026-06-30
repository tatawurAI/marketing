-- Migration: 20260629_payroll_runs
-- Creates the payroll_runs table.
-- Admins have full access; employees can read their own rows (read-only).
-- UNIQUE(employee_id, period_start, period_end) prevents duplicate payroll runs
-- for the same employee and period.

CREATE TABLE payroll_runs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end   DATE NOT NULL,
  total_hours  NUMERIC(6,2) NOT NULL,
  hourly_rate  NUMERIC(10,2) NOT NULL,  -- snapshot of employees.salary_rate at creation
  total_amount NUMERIC(10,2) NOT NULL,  -- total_hours × hourly_rate
  status       TEXT NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft', 'submitted', 'paid')),
  pdf_path     TEXT,                    -- Supabase Storage path; set on submit
  notes        TEXT,
  created_by   UUID NOT NULL REFERENCES employees(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  paid_at      TIMESTAMPTZ,
  paid_by      UUID REFERENCES employees(id),
  UNIQUE(employee_id, period_start, period_end)
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_runs TO authenticated;

-- RLS
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs FORCE ROW LEVEL SECURITY;

-- Employees can read their own payroll runs; admins see all.
CREATE POLICY "pr_own_select" ON payroll_runs FOR SELECT
  USING (employee_id = my_employee_id() OR is_admin());

-- Admins have full write access; employees have no write access.
CREATE POLICY "pr_admin_all" ON payroll_runs FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- Storage: payroll-pdfs bucket (private)
-- Path convention: {employee_id}/{run_id}.pdf
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('payroll-pdfs', 'payroll-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Employees can download their own payslip PDFs.
-- Path convention {employee_id}/... means (foldername)[1] is the employee UUID.
CREATE POLICY "payroll_pdfs_own_select" ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payroll-pdfs'
    AND (storage.foldername(name))[1] = my_employee_id()::text
  );

-- Admins have full read/write access.
CREATE POLICY "payroll_pdfs_admin_all" ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'payroll-pdfs' AND is_admin())
  WITH CHECK (bucket_id = 'payroll-pdfs' AND is_admin());
