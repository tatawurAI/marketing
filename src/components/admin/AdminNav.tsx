import AdminNavLinks from './AdminNavLinks'
import styles from './AdminNav.module.scss'

interface AdminNavProps {
  pendingApprovals?: number
  pendingExpenses?: number
  pendingInvoices?: number
  pendingPayroll?: number
}

export default function AdminNav({
  pendingApprovals,
  pendingExpenses,
  pendingInvoices,
  pendingPayroll,
}: AdminNavProps) {
  return (
    <aside className={styles.nav}>
      <AdminNavLinks
        pendingApprovals={pendingApprovals}
        pendingExpenses={pendingExpenses}
        pendingInvoices={pendingInvoices}
        pendingPayroll={pendingPayroll}
      />
    </aside>
  )
}
