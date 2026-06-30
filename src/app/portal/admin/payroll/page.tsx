import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InvoiceForm from '@/components/admin/InvoiceForm'
import PayrollPreview from '@/components/admin/PayrollPreview'
import PayrollRunsTable from '@/components/admin/PayrollRunsTable'
import styles from './page.module.scss'
import {
  PAYABLE_STATUS_FILTERS,
  UNPAID_STATUS,
  type AdminPayrollRun,
  type PayableStatusFilter,
} from '@/lib/types'

type Employee = { id: string; full_name: string }

const HISTORY_LIMIT = 50

type PageProps = {
  searchParams: {
    employeeId?: string
    start?: string
    end?: string
    status?: string
  }
}

export default async function PayrollPage({ searchParams }: PageProps) {
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

  const { employeeId, start, end } = searchParams

  const dateRe = /^\d{4}-\d{2}-\d{2}$/
  const datesValid = start && end && dateRe.test(start) && dateRe.test(end) && end >= start

  let totalHours = 0
  let hourlyRate: number | null = null
  let totalPay: number | null = null
  let projectBreakdown: { projectName: string; hours: number }[] = []

  if (employeeId && datesValid) {
    const [
      { data: empData },
      { data: rawEntries },
    ] = await Promise.all([
      supabase
        .from('employees')
        .select('salary_rate')
        .eq('id', employeeId)
        .single(),
      supabase
        .from('time_entries')
        .select('project_id, hours')
        .eq('employee_id', employeeId)
        .gte('work_date', start)
        .lte('work_date', end),
    ])

    hourlyRate = (empData?.salary_rate as number) ?? null

    const grouped = new Map<string, number>()
    for (const entry of rawEntries ?? []) {
      const pid = String(entry.project_id)
      grouped.set(pid, (grouped.get(pid) ?? 0) + Number(entry.hours))
    }

    totalHours = Array.from(grouped.values()).reduce((s, h) => s + h, 0)
    totalPay = hourlyRate != null ? totalHours * hourlyRate : null

    if (grouped.size > 0) {
      const projectIds = Array.from(grouped.keys())
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name')
        .in('id', projectIds)

      const nameMap = new Map<string, string>(
        (projectsData ?? []).map((p) => [String(p.id), String(p.name)])
      )
      projectBreakdown = Array.from(grouped.entries()).map(([pid, hours]) => ({
        projectName: nameMap.get(pid) ?? 'Unknown Project',
        hours,
      }))
    }
  }

  const rawStatus = searchParams.status
  const currentStatus: PayableStatusFilter =
    rawStatus && PAYABLE_STATUS_FILTERS.has(rawStatus as PayableStatusFilter)
      ? (rawStatus as PayableStatusFilter)
      : 'all'

  // Always fetch payroll run history
  let runsQuery = supabase
    .from('payroll_runs')
    .select(
      '*, employee:employees!employee_id(full_name), creator:employees!created_by(full_name), payer:employees!paid_by(full_name)',
    )
    .order('created_at', { ascending: false })

  if (employeeId) {
    runsQuery = runsQuery.eq('employee_id', employeeId)
  } else {
    runsQuery = runsQuery.limit(HISTORY_LIMIT)
  }
  if (currentStatus !== 'all') {
    runsQuery = runsQuery.eq('status', currentStatus)
  }

  const { data: runsData } = await runsQuery
  const runs = (runsData ?? []) as AdminPayrollRun[]

  let unpaidQuery = supabase
    .from('payroll_runs')
    .select('*', { count: 'exact', head: true })
    .eq('status', UNPAID_STATUS)

  if (employeeId) {
    unpaidQuery = unpaidQuery.eq('employee_id', employeeId)
  }

  const { count: unpaidCount } = await unpaidQuery
  const unpaid = unpaidCount ?? 0

  return (
    <div className={styles.root}>
      <div className={styles.headerRow}>
        <h1 className={styles.heading}>Payroll</h1>
        {unpaid > 0 && (
          <span className={styles.pendingBadge}>{unpaid} unpaid</span>
        )}
      </div>

      <InvoiceForm
        employees={employees}
        currentEmployeeId={employeeId}
        currentStart={start}
        currentEnd={end}
        basePath="/portal/admin/payroll"
      />

      {employeeId && datesValid && (
        <div>
          <h2 className={styles.subheading}>Pay Preview</h2>
          <PayrollPreview
            employeeId={employeeId}
            periodStart={start}
            periodEnd={end}
            totalHours={totalHours}
            hourlyRate={hourlyRate}
            totalPay={totalPay}
            projectBreakdown={projectBreakdown}
          />
        </div>
      )}

      <div>
        <h2 className={styles.subheading}>Pay Run History</h2>
        <PayrollRunsTable runs={runs} currentStatus={currentStatus} />
      </div>
    </div>
  )
}
