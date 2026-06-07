-- Seed data: sample projects
-- Employees are NOT seeded here — they are created via the auth trigger
-- (handle_new_user) on first Google OAuth sign-in.

INSERT INTO projects (name, client_name, description, is_active) VALUES
  ('Icon Build — AI Compliance', 'Icon Build', 'AI-powered building code compliance system', true),
  ('Noetic — Site Plan App', 'Noetic', 'Structural engineering site planning application', true),
  ('Internal — Business Development', NULL, 'BD, proposals, and pre-sales activities', true);
