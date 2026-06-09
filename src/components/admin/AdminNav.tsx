import AdminNavLinks from './AdminNavLinks'
import styles from './AdminNav.module.scss'

interface AdminNavProps {
  pendingApprovals?: number
}

export default function AdminNav({ pendingApprovals }: AdminNavProps) {
  return (
    <aside className={styles.nav}>
      <AdminNavLinks pendingApprovals={pendingApprovals} />
    </aside>
  )
}
