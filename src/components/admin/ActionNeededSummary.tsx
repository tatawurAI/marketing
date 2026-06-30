import Link from 'next/link'
import styles from './ActionNeededSummary.module.scss'

type Severity = 'urgent' | 'routine'

type ActionItem = {
  label: string
  count: number
  href: string
  severity: Severity
}

type Props = {
  items: ActionItem[]
}

export default function ActionNeededSummary({ items }: Props) {
  const outstanding = items.filter((item) => item.count > 0)

  if (outstanding.length === 0) {
    return <p className={styles.empty}>All caught up — nothing needs action right now.</p>
  }

  return (
    <div className={styles.grid}>
      {outstanding.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={item.severity === 'urgent' ? styles.cardUrgent : styles.cardRoutine}
        >
          <span className={styles.label}>{item.label}</span>
          <span className={styles.value}>{item.count}</span>
        </Link>
      ))}
    </div>
  )
}
