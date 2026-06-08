import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Project, TimeEntry } from '@/lib/types'
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

  const weekEndDate = new Date(weekStart)
  weekEndDate.setDate(weekEndDate.getDate() + 6)
  const weekEnd = weekEndDate.toISOString().split('T')[0]

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!employee) redirect('/portal/login')

  const [projectsResult, entriesResult, lockResult] = await Promise.all([
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
  ])

  const projects = (projectsResult.data ?? []) as Project[]
  const entries = (entriesResult.data ?? []) as TimeEntry[]
  const isLocked = lockResult.data != null

  return (
    <TimesheetShell
      weekStart={weekStart}
      projects={projects}
      entries={entries}
      isLocked={isLocked}
    />
  )
}
