import { createClient } from '@/lib/supabase/server'
import ActionNeededSummary from '@/components/admin/ActionNeededSummary'
import { UNPAID_STATUS, type AdminStats } from '@/lib/types'
import styles from './page.module.scss'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const [
    { data, error },
    { count: pendingApprovals },
    { count: pendingExpenses },
    { count: pendingInvoices },
    { count: pendingPayroll },
  ] = await Promise.all([
    supabase.rpc('admin_dashboard_stats'),
    supabase
      .from('timesheet_approvals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('expense_claims')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'approved']),
    supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('status', UNPAID_STATUS),
    supabase
      .from('payroll_runs')
      .select('*', { count: 'exact', head: true })
      .eq('status', UNPAID_STATUS),
  ])

  const stats: AdminStats = data?.[0] ?? {
    active_employees:       0,
    active_projects:        0,
    entries_this_week:      0,
    unlocked_weeks_last_12: 0,
  }

  if (error) console.error('[admin] admin_dashboard_stats rpc failed:', error.message)

  const cards = [
    { label: 'Active Employees',        value: stats.active_employees },
    { label: 'Active Projects',         value: stats.active_projects },
    { label: 'Entries This Week',       value: stats.entries_this_week },
    { label: 'Unlocked Weeks (last 12)', value: stats.unlocked_weeks_last_12 },
  ]

  const actionItems = [
    { label: 'Pending Approvals', count: pendingApprovals ?? 0, href: '/portal/admin/approvals', severity: 'urgent' as const },
    { label: 'Pending Expenses',  count: pendingExpenses ?? 0,  href: '/portal/admin/expenses', severity: 'urgent' as const },
    { label: 'Unpaid Invoices',   count: pendingInvoices ?? 0,  href: `/portal/admin/invoices?status=${UNPAID_STATUS}`, severity: 'routine' as const },
    { label: 'Unpaid Payroll',    count: pendingPayroll ?? 0,   href: `/portal/admin/payroll?status=${UNPAID_STATUS}`, severity: 'routine' as const },
  ]

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>Admin Dashboard</h1>

      <div>
        <h2 className={styles.subheading}>Action Needed</h2>
        <ActionNeededSummary items={actionItems} />
      </div>

      <div className={styles.grid}>
        {cards.map(card => (
          <div key={card.label} className={styles.card}>
            <span className={styles.label}>{card.label}</span>
            <span className={styles.value}>{card.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
