import AdminNavLinks from './AdminNavLinks'
import styles from './AdminNav.module.scss'

interface AdminNavProps {
  pendingApprovals?: number
  pendingExpenses?: number
}

export default function AdminNav({ pendingApprovals, pendingExpenses }: AdminNavProps) {
  return (
    <aside className={styles.nav}>
      <AdminNavLinks pendingApprovals={pendingApprovals} pendingExpenses={pendingExpenses} />
    </aside>
  )
}
