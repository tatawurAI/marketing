import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ExpenseActionsTable from '@/components/admin/ExpenseActionsTable'
import styles from './page.module.scss'
import type { AdminExpenseClaim } from '@/lib/types'

type StatusFilter = 'all' | 'pending' | 'approved' | 'reimbursed' | 'rejected'

const VALID_STATUSES = new Set<StatusFilter>(['all', 'pending', 'approved', 'reimbursed', 'rejected'])

type PageProps = {
  searchParams: { status?: string }
}

export default async function AdminExpensesPage({ searchParams }: PageProps) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const { data: me } = await supabase
    .from('employees')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (me?.role !== 'admin') redirect('/portal/dashboard')

  const rawStatus = searchParams.status
  const currentStatus: StatusFilter =
    rawStatus && VALID_STATUSES.has(rawStatus as StatusFilter)
      ? (rawStatus as StatusFilter)
      : 'all'

  let query = supabase
    .from('expense_claims')
    .select(
      '*, employee:employees!employee_id(full_name), reviewer:employees!reviewed_by(full_name), reimbursed_by_emp:employees!reimbursed_by(full_name)',
    )
    .order('submitted_at', { ascending: false })

  if (currentStatus !== 'all') {
    query = query.eq('status', currentStatus)
  }

  const { data: claimsData } = await query
  const claims = (claimsData ?? []) as AdminExpenseClaim[]

  const { count: pendingCount } = await supabase
    .from('expense_claims')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const pending = pendingCount ?? 0

  return (
    <div className={styles.root}>
      <div className={styles.headerRow}>
        <h1 className={styles.heading}>Expenses</h1>
        {pending > 0 && (
          <span className={styles.pendingBadge}>{pending} pending</span>
        )}
      </div>
      <ExpenseActionsTable claims={claims} currentStatus={currentStatus} />
    </div>
  )
}
