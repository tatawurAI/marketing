-- Migration: 002_indexes
-- Performance indexes for common query patterns on time_entries.

CREATE INDEX idx_time_entries_employee_date ON time_entries(employee_id, work_date DESC);
CREATE INDEX idx_time_entries_project       ON time_entries(project_id);
CREATE INDEX idx_time_entries_work_date     ON time_entries(work_date);

-- Note: UNIQUE constraints on employees.user_id and employee_billing_rates(employee_id, project_id)
-- already create implicit indexes — no explicit duplicates needed.
-- idx_time_entries_work_date retained for admin week queries across all employees.
