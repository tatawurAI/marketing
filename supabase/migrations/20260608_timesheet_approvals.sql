CREATE TABLE timesheet_approvals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  week_start      DATE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'denied')),
  reviewed_by     UUID REFERENCES employees(id),
  review_comment  TEXT,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at     TIMESTAMPTZ,
  UNIQUE (employee_id, week_start)
);

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.timesheet_approvals TO authenticated;

-- RLS
ALTER TABLE timesheet_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_approvals FORCE ROW LEVEL SECURITY;

CREATE POLICY "ta_own_select" ON timesheet_approvals FOR SELECT
  USING (employee_id = my_employee_id() OR is_admin());

CREATE POLICY "ta_own_insert" ON timesheet_approvals FOR INSERT
  WITH CHECK (employee_id = my_employee_id());

-- Employees can update only their own pending rows (to resubmit after denial).
-- Admins use ta_admin_all below.
CREATE POLICY "ta_own_update" ON timesheet_approvals FOR UPDATE
  USING (employee_id = my_employee_id() AND status = 'pending')
  WITH CHECK (employee_id = my_employee_id());

CREATE POLICY "ta_admin_all" ON timesheet_approvals FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());
