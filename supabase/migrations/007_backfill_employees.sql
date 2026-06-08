-- Migration: 007_backfill_employees
-- One-time backfill: provisions employees rows for any auth.users who signed in
-- before migration 006_auto_provision.sql was applied and therefore never had
-- the AFTER INSERT trigger fire for them.
--
-- Safe to re-run: INSERT ... ON CONFLICT DO NOTHING skips existing rows.

INSERT INTO public.employees (
  user_id,
  email,
  full_name,
  title,
  salary_rate,
  role,
  is_active,
  started_at
)
SELECT
  u.id,
  u.email,
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
    SPLIT_PART(u.email, '@', 1)
  ),
  'New Employee',
  0.00,
  COALESCE(u.raw_app_meta_data->>'role', 'employee'),
  true,
  CURRENT_DATE
FROM auth.users u
WHERE u.email LIKE '%@tatawur.ai'
  AND NOT EXISTS (
    SELECT 1 FROM public.employees e WHERE e.user_id = u.id
  );
