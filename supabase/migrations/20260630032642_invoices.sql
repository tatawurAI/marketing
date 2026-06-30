-- Migration: 20260629_invoices
-- Creates the invoices table (admin-only; employees have no access).
-- billing_rate and total_amount are nullable — invoices may be created for
-- projects with no billable rate configured.

CREATE TABLE invoices (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  project_id   UUID NOT NULL REFERENCES projects(id),
  period_start DATE NOT NULL,
  period_end   DATE NOT NULL,
  total_hours  NUMERIC(6,2) NOT NULL,
  billing_rate NUMERIC(10,2),           -- snapshot of billable_rate at creation; nullable
  total_amount NUMERIC(10,2),           -- total_hours × billing_rate; nullable if no rate
  status       TEXT NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft', 'submitted', 'paid')),
  pdf_path     TEXT,                    -- Supabase Storage path; set on submit
  notes        TEXT,
  created_by   UUID NOT NULL REFERENCES employees(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  paid_at      TIMESTAMPTZ,
  paid_by      UUID REFERENCES employees(id)
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;

-- Admins have full access; employees have no access to invoices.
CREATE POLICY "inv_admin_all" ON invoices FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- Storage: invoice-pdfs bucket (private, admin-only)
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('invoice-pdfs', 'invoice-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Admins have full read/write access; employees have no access to invoice PDFs.
CREATE POLICY "invoice_pdfs_admin_all" ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'invoice-pdfs' AND is_admin())
  WITH CHECK (bucket_id = 'invoice-pdfs' AND is_admin());
