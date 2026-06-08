import { createClient } from '@/lib/supabase/server'
import type { AdminStats } from '@/lib/types'
import styles from './page.module.scss'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('admin_dashboard_stats')

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

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>Admin Dashboard</h1>
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
