import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Project, TimeEntry, TimesheetApproval } from '@/lib/types'
import TimesheetShell from '@/components/portal/TimesheetShell'

type PageProps = {
  searchParams: { week?: string }
}

export default async function TimesheetsPage({ searchParams }: PageProps) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  if (!searchParams.week) {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    now.setDate(diff)
    now.setHours(0, 0, 0, 0)
    const weekStart = now.toISOString().split('T')[0]
    redirect(`/portal/timesheets?week=${weekStart}`)
  }

  const weekStart = searchParams.week
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) redirect('/portal/timesheets')

  const weekEndDate = new Date(weekStart + 'T00:00:00Z')
  weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6)
  const weekEnd = weekEndDate.toISOString().split('T')[0]

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!employee) redirect('/portal/login')

  const [weekProjectsResult, availableProjectsResult, entriesResult, lockResult, approvalResult] = await Promise.all([
    supabase
      .from('employee_week_projects')
      .select('project:projects(id, name)')
      .eq('employee_id', employee.id)
      .eq('week_start', weekStart)
      .order('project(name)'),
    supabase
      .from('projects')
      .select('id, name')
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('time_entries')
      .select('id, project_id, work_date, hours, notes')
      .eq('employee_id', employee.id)
      .gte('work_date', weekStart)
      .lte('work_date', weekEnd),
    supabase
      .from('locked_weeks')
      .select('week_start')
      .eq('week_start', weekStart)
      .maybeSingle(),
    supabase
      .from('timesheet_approvals')
      .select('*')
      .eq('employee_id', employee.id)
      .eq('week_start', weekStart)
      .maybeSingle(),
  ])

  const weekProjects = (weekProjectsResult.data ?? []).map(r => r.project as unknown as Project)
  const availableProjects = (availableProjectsResult.data ?? []) as Project[]
  const entries = (entriesResult.data ?? []) as TimeEntry[]
  const isLocked = lockResult.data != null
  const approval = (approvalResult.data ?? null) as TimesheetApproval | null

  return (
    <TimesheetShell
      weekStart={weekStart}
      projects={weekProjects}
      availableProjects={availableProjects}
      entries={entries}
      isLocked={isLocked}
      approval={approval}
    />
  )
}
