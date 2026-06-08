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
