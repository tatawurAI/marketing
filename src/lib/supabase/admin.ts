import { createClient } from '@/lib/supabase/server'

// Shared admin auth helper used by all admin server actions.
// Returns the authenticated user AND their employee record (id + role) in a
// single DB round-trip, so callers don't need a second query for adminEmployee.id.
export async function getAdminUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, adminEmployee: null, error: 'Unauthorized' as const }
  const { data: adminEmployee } = await supabase
    .from('employees')
    .select('id, role')
    .eq('user_id', user.id)
    .single()
  if (adminEmployee?.role !== 'admin') {
    return { supabase, user: null, adminEmployee: null, error: 'Forbidden' as const }
  }
  return { supabase, user, adminEmployee, error: null }
}
