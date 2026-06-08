-- Migration: 006_auto_provision
-- Auto-creates a public.employees row when a new auth.users row is inserted
-- (i.e., first Google OAuth sign-in). The BEFORE INSERT trigger (004_triggers)
-- already validated the @tatawur.ai domain at that point, so this function can
-- trust the email. Runs AFTER INSERT so the FK auth.users(id) is satisfied.
--
-- Depends on: on_auth_user_created (BEFORE INSERT) for @tatawur.ai domain validation.
-- Do not drop that trigger without adding domain validation here.

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

  BEGIN
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
    );
  EXCEPTION WHEN unique_violation THEN
    -- Row already exists (re-registration after account deletion, or Supabase retry).
    -- Safe to skip — the existing record is preserved.
    NULL;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Restrict direct invocation: only supabase_auth_admin (the trigger executor) may call this.
REVOKE EXECUTE ON FUNCTION provision_employee_on_signup() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION provision_employee_on_signup() TO supabase_auth_admin;

-- DROP first so re-applying this migration is safe.
DROP TRIGGER IF EXISTS on_auth_user_provisioned ON auth.users;
CREATE TRIGGER on_auth_user_provisioned
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION provision_employee_on_signup();
