CREATE OR REPLACE FUNCTION admin_dashboard_stats()
RETURNS TABLE (
  active_employees       BIGINT,
  active_projects        BIGINT,
  entries_this_week      BIGINT,
  unlocked_weeks_last_12 BIGINT
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  -- Enforce admin-only access at the DB layer regardless of who holds the grant
  IF (
    SELECT role FROM public.employees WHERE user_id = auth.uid()
  ) IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT
    -- Active employees
    (SELECT COUNT(*) FROM public.employees  WHERE is_active = true)::BIGINT,

    -- Active projects
    (SELECT COUNT(*) FROM public.projects   WHERE is_active = true)::BIGINT,

    -- Time entries whose work_date falls in the current ISO week (Mon–Sun)
    (
      SELECT COUNT(*)
      FROM   public.time_entries
      WHERE  work_date >= date_trunc('week', CURRENT_DATE)::date
        AND  work_date <  (date_trunc('week', CURRENT_DATE) + INTERVAL '7 days')::date
    )::BIGINT,

    -- Mondays in the last 12 weeks that are NOT in locked_weeks
    (
      SELECT COUNT(*)
      FROM   generate_series(
               date_trunc('week', CURRENT_DATE)::date - INTERVAL '11 weeks',
               date_trunc('week', CURRENT_DATE)::date,
               INTERVAL '1 week'
             ) AS gs(monday)
      WHERE  gs.monday::date NOT IN (
               SELECT week_start FROM public.locked_weeks
             )
    )::BIGINT;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_dashboard_stats() TO authenticated;
