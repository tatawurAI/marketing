import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import styles from './dashboard.module.scss'

type Employee = {
  id: string
  full_name: string
  title: string
  department: string
  salary_rate: number
  started_at: string
}

type TimeEntry = {
  hours: number
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Layout already redirects unauthenticated users; this is a type-narrowing guard only
  if (!user) redirect('/portal/login')

  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('id, full_name, title, department, salary_rate, started_at')
    .eq('user_id', user.id)
    .single() as { data: Employee | null; error: { code?: string } | null }

  // PGRST116 = no rows — expected for employees without a profile yet
  if (empError && empError.code !== 'PGRST116') {
    console.error('[dashboard] employee query failed:', empError)
  }

  const weekStart = getWeekStart(new Date())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  let entries: TimeEntry[] | null = []
  if (employee) {
    const { data, error: teError } = await supabase
      .from('time_entries')
      .select('hours')
      .eq('employee_id', employee.id)
      .gte('work_date', weekStart.toISOString().split('T')[0])
      .lte('work_date', weekEnd.toISOString().split('T')[0])
    if (teError) console.error('[dashboard] time_entries query failed:', teError)
    entries = data
  }

  const weeklyHours = (entries ?? []).reduce((sum, e) => sum + Number(e.hours), 0)

  return (
    <div className={styles.root}>
      {employee ? (
        <>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h1 className={styles.name}>{employee.full_name}</h1>
              <p className={styles.role}>
                {employee.title}
                <span className={styles.dot}>·</span>
                {employee.department}
              </p>
            </div>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Hourly Rate</span>
                <span className={styles.statValue}>
                  ${Number(employee.salary_rate).toFixed(2)}
                  <span className={styles.statUnit}>/hr</span>
                </span>
              </div>

              <div className={styles.divider} />

              <div className={styles.stat}>
                <span className={styles.statLabel}>Hours This Week</span>
                <span className={styles.statValue}>
                  {weeklyHours.toFixed(1)}
                  <span className={styles.statUnit}>hrs</span>
                </span>
              </div>

              <div className={styles.divider} />

              <div className={styles.stat}>
                <span className={styles.statLabel}>Started</span>
                <span className={styles.statDate}>
                  {formatDate(employee.started_at)}
                </span>
              </div>
            </div>
          </section>

          <div className={styles.actions}>
            <Link href="/portal/timesheets" className={styles.timesheetLink}>
              View Timesheets
            </Link>
          </div>
        </>
      ) : (
        <section className={styles.card}>
          <p className={styles.empty}>
            No employee profile found. Please contact your administrator.
          </p>
        </section>
      )}
    </div>
  )
}
