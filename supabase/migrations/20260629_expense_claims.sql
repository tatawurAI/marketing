-- Migration: 20260629_expense_claims
-- Creates the expense_claims table.
-- Employees can submit and edit their own pending claims.
-- Admins have full access (approve, reimburse, reject).

CREATE TABLE expense_claims (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id    UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  expense_date   DATE NOT NULL,
  amount         NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  description    TEXT NOT NULL,
  receipt_path   TEXT,                  -- Supabase Storage path; nullable (receipt optional)
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'reimbursed', 'rejected')),
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by    UUID REFERENCES employees(id),
  reviewed_at    TIMESTAMPTZ,
  review_comment TEXT,
  reimbursed_at  TIMESTAMPTZ,
  reimbursed_by  UUID REFERENCES employees(id)
);

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.expense_claims TO authenticated;

-- RLS
ALTER TABLE expense_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_claims FORCE ROW LEVEL SECURITY;

-- Employees can read their own claims; admins see all.
CREATE POLICY "ec_own_select" ON expense_claims FOR SELECT
  USING (employee_id = my_employee_id() OR is_admin());

-- Employees can submit claims on their own behalf only.
CREATE POLICY "ec_own_insert" ON expense_claims FOR INSERT
  WITH CHECK (employee_id = my_employee_id());

-- Employees can edit only their own pending claims (description/receipt before approval).
-- USING filters which rows can be targeted; WITH CHECK prevents re-assigning to another employee.
CREATE POLICY "ec_own_update" ON expense_claims FOR UPDATE
  USING (employee_id = my_employee_id() AND status = 'pending')
  WITH CHECK (employee_id = my_employee_id());

-- Admins have full access (approve, reimburse, reject, delete).
CREATE POLICY "ec_admin_all" ON expense_claims FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- Storage: expense-receipts bucket (private)
-- Path convention: {employee_id}/{timestamp}-{filename}
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-receipts', 'expense-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Employees can upload and read receipts under their own path prefix.
-- (foldername)[1] is the employee_id segment.
CREATE POLICY "expense_receipts_own_select" ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'expense-receipts'
    AND (storage.foldername(name))[1] = my_employee_id()::text
  );

CREATE POLICY "expense_receipts_own_insert" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'expense-receipts'
    AND (storage.foldername(name))[1] = my_employee_id()::text
  );

-- Admins have full read/write access.
CREATE POLICY "expense_receipts_admin_all" ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'expense-receipts' AND is_admin())
  WITH CHECK (bucket_id = 'expense-receipts' AND is_admin());
