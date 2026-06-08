-- Migration: 006_auto_provision
-- Auto-creates a public.employees row when a new auth.users row is inserted
-- (i.e., first Google OAuth sign-in). The BEFORE INSERT trigger (004_triggers)
-- already validated the @tatawur.ai domain at that point, so this function can
-- trust the email. Runs AFTER INSERT so the FK auth.users(id) is satisfied.

CREATE OR REPLACE FUNCTION provision_employee_on_signup()
RETURNS trigger AS $$
DECLARE
  v_full_name TEXT;
BEGIN
  -- Google OAuth populates raw_user_meta_data.full_name; fall back to email prefix.
  v_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    SPLIT_PART(NEW.email, '@', 1)
  );

  INSERT INTO public.employees (
    user_id,
    email,
    full_name,
    title,
    salary_rate,
    role,
    is_active,
    started_at
  ) VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    'New Employee',   -- admin updates via Phase 3 admin panel
    0.00,             -- admin sets actual rate via Phase 3 admin panel
    'employee',
    true,
    CURRENT_DATE
  )
  ON CONFLICT (user_id) DO NOTHING; -- idempotent: re-running migration is safe

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Grant execute to the auth schema so Supabase can invoke it from auth triggers.
GRANT EXECUTE ON FUNCTION provision_employee_on_signup TO supabase_auth_admin;

CREATE TRIGGER on_auth_user_provisioned
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION provision_employee_on_signup();
