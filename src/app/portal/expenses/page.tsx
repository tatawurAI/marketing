import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyExpenseClaims } from './actions'
import ExpenseSubmitForm from '@/components/portal/ExpenseSubmitForm'
import ExpenseClaimsTable from '@/components/portal/ExpenseClaimsTable'
import styles from './page.module.scss'

export default async function ExpensesPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!employee) redirect('/portal/dashboard')

  const { claims } = await getMyExpenseClaims()

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>My Expenses</h1>
      <ExpenseSubmitForm employeeId={employee.id as string} />
      <div>
        <h2 className={styles.subheading}>Claim History</h2>
        <ExpenseClaimsTable claims={claims} />
      </div>
    </div>
  )
}
