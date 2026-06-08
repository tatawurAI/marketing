'use client'

import type { TimeEntry } from '@/lib/types'
import styles from './DayColumn.module.scss'

type Props = {
  date: string
  entries: TimeEntry[]
  isLocked: boolean
  onAddClick: (day: string) => void
  onEditClick: (entry: TimeEntry) => void
}

export default function DayColumn({
  date,
  entries,
  isLocked,
  onAddClick,
  onEditClick,
}: Props) {
  const hasEntries = entries.length > 0

  return (
    <div className={styles.column}>
      {entries.map((entry) => (
        <button
          key={entry.id}
          type="button"
          className={styles.entry}
          onClick={() => onEditClick(entry)}
        >
          <span className={styles.hours}>{entry.hours.toFixed(1)}h</span>
        </button>
      ))}

      {!hasEntries && isLocked && (
        <span className={styles.empty} aria-label="No entries">—</span>
      )}

      {!isLocked && (
        <button
          type="button"
          className={styles.addButton}
          onClick={() => onAddClick(date)}
        >
          + Add
        </button>
      )}
    </div>
  )
}
