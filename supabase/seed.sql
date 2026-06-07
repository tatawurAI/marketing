-- Seed data: sample projects
-- Employees are NOT seeded here — they are created via the auth trigger
-- (handle_new_user) on first Google OAuth sign-in.

INSERT INTO projects (name, client_name, description, is_active) VALUES
  ('Internal — Business Development', NULL, 'BD, proposals, and pre-sales activities', true);
