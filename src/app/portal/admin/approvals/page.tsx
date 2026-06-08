import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { AdminTimesheetApproval, EmployeeFull } from '@/lib/types'
import TimesheetApprovals from '@/components/admin/TimesheetApprovals'

type PageProps = {
  searchParams: { week?: string; employee_id?: string; status?: string }
}

export default async function ApprovalsPage({ searchParams }: PageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  // Check admin role
  const { data: me } = await supabase
    .from('employees')
    .select('role')
    .eq('user_id', user.id)
    .single()
  if (me?.role !== 'admin') redirect('/portal/dashboard')

  const { week, employee_id, status } = searchParams

  // Fetch employees for filter dropdown
  const { data: employees } = await supabase
    .from('employees')
    .select('id, full_name')
    .order('full_name')

  // Build approval query with joins
  let q = supabase
    .from('timesheet_approvals')
    .select(
      '*, employee:employees!timesheet_approvals_employee_id_fkey(full_name), reviewer:employees!timesheet_approvals_reviewed_by_fkey(full_name)',
    )
    .order('submitted_at', { ascending: false })

  if (week) q = q.eq('week_start', week)
  if (employee_id) q = q.eq('employee_id', employee_id)
  if (status) q = q.eq('status', status)

  const { data: approvals } = await q

  return (
    <TimesheetApprovals
      approvals={(approvals ?? []) as AdminTimesheetApproval[]}
      employees={(employees ?? []) as Pick<EmployeeFull, 'id' | 'full_name'>[]}
      currentFilters={{ week, employee_id, status }}
    />
  )
}
