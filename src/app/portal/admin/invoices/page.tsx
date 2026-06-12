import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InvoiceForm from '@/components/admin/InvoiceForm'
import InvoiceProjectList from '@/components/admin/InvoiceProjectList'
import styles from './page.module.scss'
import type { ProjectInvoicePreview } from '@/lib/pdf/types'

export type { ProjectInvoicePreview }

type Employee = { id: string; full_name: string }

type PageProps = {
  searchParams: {
    employeeId?: string
    start?: string
    end?: string
  }
}

export default async function InvoicesPage({ searchParams }: PageProps) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const { data: me } = await supabase
    .from('employees')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (me?.role !== 'admin') redirect('/portal/dashboard')

  const { data: employeesData } = await supabase
    .from('employees')
    .select('id, full_name')
    .eq('is_active', true)
    .order('full_name')

  const employees: Employee[] = employeesData ?? []

  let projects: ProjectInvoicePreview[] = []

  const { employeeId, start, end } = searchParams

  const dateRe = /^\d{4}-\d{2}-\d{2}$/
  const datesValid = start && end && dateRe.test(start) && dateRe.test(end) && end >= start

  if (employeeId && datesValid) {
    // Fetch entries without join — project names fetched separately to avoid type/runtime mismatch
    const { data: rawEntries } = await supabase
      .from('time_entries')
      .select('project_id, hours')
      .eq('employee_id', employeeId)
      .gte('work_date', start)
      .lte('work_date', end)

    // Group hours and entry count by project_id
    const grouped = new Map<
      string,
      { totalHours: number; entryCount: number }
    >()

    for (const entry of rawEntries ?? []) {
      const id = String(entry.project_id)
      const existing = grouped.get(id)
      if (existing) {
        existing.totalHours += Number(entry.hours)
        existing.entryCount += 1
      } else {
        grouped.set(id, { totalHours: Number(entry.hours), entryCount: 1 })
      }
    }

    const projectIds = Array.from(grouped.keys())

    if (projectIds.length > 0) {
      // Fetch project names and billing rates in parallel
      const [{ data: projectsData }, { data: ratesData }] = await Promise.all([
        supabase.from('projects').select('id, name').in('id', projectIds),
        supabase
          .from('employee_billing_rates')
          .select('project_id, billable_rate')
          .eq('employee_id', employeeId)
          .in('project_id', projectIds),
      ])

      const nameMap = new Map<string, string>(
        (projectsData ?? []).map((p) => [String(p.id), String(p.name)])
      )
      const rateMap = new Map<string, number>(
        (ratesData ?? []).map((r) => [String(r.project_id), Number(r.billable_rate)])
      )

      projects = Array.from(grouped.entries()).map(([projectId, { totalHours, entryCount }]) => ({
        projectId,
        projectName: nameMap.get(projectId) ?? 'Unknown Project',
        totalHours,
        entryCount,
        billingRate: rateMap.get(projectId) ?? null,
      }))
    }
  }

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>Invoice Generator</h1>
      <InvoiceForm
        employees={employees}
        currentEmployeeId={employeeId}
        currentStart={start}
        currentEnd={end}
      />
      {employeeId && datesValid && (
        <InvoiceProjectList
          projects={projects}
          employeeId={employeeId}
          start={start}
          end={end}
        />
      )}
    </div>
  )
}
