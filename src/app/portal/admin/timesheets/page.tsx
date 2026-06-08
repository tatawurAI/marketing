import { createClient } from '@/lib/supabase/server'
import type { AdminTimeEntry, EmployeeFull, ProjectFull } from '@/lib/types'
import AllTimesheets from '@/components/admin/AllTimesheets'

const PAGE_SIZE = 50

type PageProps = {
  searchParams: {
    week?:        string
    employee_id?: string
    project_id?:  string
    page?:        string
  }
}

export default async function AdminTimesheetsPage({ searchParams }: PageProps) {
  const supabase = createClient()

  const week        = searchParams.week        ?? undefined
  const employee_id = searchParams.employee_id ?? undefined
  const project_id  = searchParams.project_id  ?? undefined
  const page        = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const offset      = (page - 1) * PAGE_SIZE

  // Compute week-end date when filtering by week
  let weekEnd: string | undefined
  if (week) {
    const d = new Date(week + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() + 6)
    weekEnd = d.toISOString().split('T')[0]
  }

  const [employeesResult, projectsResult, entriesResult] = await Promise.all([
    supabase
      .from('employees')
      .select('id, full_name')
      .order('full_name'),
    supabase
      .from('projects')
      .select('id, name')
      .order('name'),
    (() => {
      let q = supabase
        .from('time_entries')
        .select('*, employee:employees(full_name), project:projects(name)', { count: 'exact' })
        .order('work_date', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)
      if (week && weekEnd) {
        q = q.gte('work_date', week).lte('work_date', weekEnd)
      }
      if (employee_id) q = q.eq('employee_id', employee_id)
      if (project_id)  q = q.eq('project_id', project_id)
      return q
    })(),
  ])

  const employees  = (employeesResult.data ?? []) as Pick<EmployeeFull, 'id' | 'full_name'>[]
  const projects   = (projectsResult.data ?? [])  as Pick<ProjectFull, 'id' | 'name'>[]
  const entries    = (entriesResult.data ?? [])    as AdminTimeEntry[]
  const totalCount = entriesResult.count ?? 0

  return (
    <AllTimesheets
      entries={entries}
      employees={employees}
      projects={projects}
      totalCount={totalCount}
      page={page}
      pageSize={PAGE_SIZE}
      currentFilters={{ week, employee_id, project_id }}
    />
  )
}
