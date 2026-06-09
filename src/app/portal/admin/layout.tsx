import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminNav from '@/components/admin/AdminNav'
import styles from './admin.module.scss'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const { data: employee } = await supabase
    .from('employees')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (employee?.role !== 'admin') redirect('/portal/dashboard')

  const { count: pendingApprovals } = await supabase
    .from('timesheet_approvals')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return (
    <div className={styles.shell}>
      <AdminNav pendingApprovals={pendingApprovals ?? 0} />
      <main className={styles.content}>{children}</main>
    </div>
  )
}
