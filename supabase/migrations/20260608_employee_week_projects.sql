CREATE TABLE employee_week_projects (
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  week_start  DATE NOT NULL CHECK (EXTRACT(DOW FROM week_start) = 1),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  PRIMARY KEY (employee_id, week_start, project_id)
);

-- Grants
GRANT SELECT, INSERT, DELETE ON public.employee_week_projects TO authenticated;

-- RLS
ALTER TABLE employee_week_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_week_projects FORCE ROW LEVEL SECURITY;

CREATE POLICY "ewp_own_select" ON employee_week_projects FOR SELECT
  USING (employee_id = my_employee_id() OR is_admin());

CREATE POLICY "ewp_own_insert" ON employee_week_projects FOR INSERT
  WITH CHECK (employee_id = my_employee_id());

CREATE POLICY "ewp_own_delete" ON employee_week_projects FOR DELETE
  USING (employee_id = my_employee_id());

CREATE POLICY "ewp_admin_all" ON employee_week_projects FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());
