CREATE TABLE employee_week_projects (
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  week_start  DATE NOT NULL,
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  PRIMARY KEY (employee_id, week_start, project_id)
);
