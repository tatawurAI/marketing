import AdminNavLinks from './AdminNavLinks'
import styles from './AdminNav.module.scss'

export default function AdminNav() {
  return (
    <aside className={styles.nav}>
      <AdminNavLinks />
    </aside>
  )
}
