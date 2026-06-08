-- Migration: 008_grants
-- Supabase does not automatically grant privileges to the `authenticated` role
-- on tables created via SQL migrations (only dashboard-created tables get
-- default grants). RLS policies enforce the actual row-level access; these
-- grants are the table-level prerequisite that lets PostgREST attempt queries.

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees             TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects              TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_entries          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.locked_weeks          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_billing_rates TO authenticated;
