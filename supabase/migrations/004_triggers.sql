-- Migration: 004_triggers
-- Auth triggers to enforce @tatawur.ai domain restriction and seed app_metadata.role on first sign-in.

-- ---------------------------------------------------------------------------
-- Domain validation on INSERT (new user signs in for first time)
-- Seeds role = 'employee' into app_metadata so the JWT hook picks it up.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  IF NEW.email NOT LIKE '%@tatawur.ai' THEN
    RAISE EXCEPTION 'Access restricted to @tatawur.ai accounts';
  END IF;
  -- Set role on NEW directly instead of a separate UPDATE to avoid firing the
  -- BEFORE UPDATE trigger (handle_user_email_update) on every new user creation.
  NEW.raw_app_meta_data := COALESCE(NEW.raw_app_meta_data, '{}'::jsonb) || '{"role": "employee"}'::jsonb;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------------------
-- Domain validation on UPDATE (prevents email change to non-tatawur.ai)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_user_email_update()
RETURNS trigger AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    IF NEW.email NOT LIKE '%@tatawur.ai' THEN
      RAISE EXCEPTION 'Access restricted to @tatawur.ai accounts';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER on_auth_user_email_updated
  BEFORE UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_email_update();
