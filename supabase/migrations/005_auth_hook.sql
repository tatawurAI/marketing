-- Migration: 005_auth_hook
-- JWT customization hook: embeds app_metadata.role into the JWT at sign-in.
--
-- Registration: Auth Hooks → customize_access_token → custom_access_token_hook
-- Must be registered manually in the Supabase dashboard after deployment.

CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  claims    jsonb;
  user_role text;
BEGIN
  claims    := event->'claims';
  user_role := event->'claims'->'app_metadata'->>'role';

  IF user_role IS NULL THEN
    user_role := 'employee';
  END IF;

  claims := jsonb_set(claims, '{app_metadata,role}', to_jsonb(user_role));
  RETURN jsonb_set(event, '{claims}', claims);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

GRANT EXECUTE ON FUNCTION custom_access_token_hook TO supabase_auth_admin;
