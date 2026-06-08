'use client'

import { useTransition } from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { lockWeek, unlockWeek } from '@/app/portal/admin/actions'
import styles from './WeekLockTable.module.scss'

type WeekRow = {
  weekStart: string
  entryCount: number
  isLocked: boolean
}

function formatWeekRange(weekStart: string): string {
  // weekStart is YYYY-MM-DD, representing Monday
  const start = new Date(weekStart + 'T00:00:00Z')
  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 6)

  const startStr = start.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  const endStr = end.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

  return `${startStr} – ${endStr}`
}

function WeekRow({ week }: { week: WeekRow }) {
  const [isPending, startTransition] = useTransition()

  function handleLock() {
    startTransition(async () => {
      await lockWeek(week.weekStart)
    })
  }

  function handleUnlock() {
    startTransition(async () => {
      await unlockWeek(week.weekStart)
    })
  }

  return (
    <tr className={styles.tr}>
      <td className={styles.td}>{formatWeekRange(week.weekStart)}</td>
      <td className={styles.td}>{week.entryCount}</td>
      <td className={styles.td}>
        <span className={week.isLocked ? styles.statusLocked : styles.statusOpen}>
          {week.isLocked ? 'Locked' : 'Open'}
        </span>
      </td>
      <td className={styles.tdActions}>
        {week.isLocked ? (
          <AlertDialog.Root>
            <AlertDialog.Trigger asChild>
              <button
                type="button"
                className={styles.actionBtn}
                disabled={isPending}
              >
                Unlock
              </button>
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
              <AlertDialog.Overlay className={styles.dialogOverlay} />
              <AlertDialog.Content className={styles.dialogContent}>
                <AlertDialog.Title className={styles.dialogTitle}>
                  Unlock this week?
                </AlertDialog.Title>
                <AlertDialog.Description className={styles.dialogDescription}>
                  This will allow employees to edit or delete entries for this
                  week, including entries that may already have been used for
                  payroll. This cannot be automatically reversed. Are you sure?
                </AlertDialog.Description>
                <div className={styles.dialogActions}>
                  <AlertDialog.Cancel asChild>
                    <button type="button" className={styles.dialogCancelBtn} autoFocus>
                      Cancel
                    </button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action asChild>
                    <button
                      type="button"
                      className={styles.btnDestructive}
                      onClick={handleUnlock}
                      disabled={isPending}
                    >
                      Unlock
                    </button>
                  </AlertDialog.Action>
                </div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>
        ) : (
          <AlertDialog.Root>
            <AlertDialog.Trigger asChild>
              <button
                type="button"
                className={styles.actionBtn}
                disabled={isPending}
              >
                Lock
              </button>
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
              <AlertDialog.Overlay className={styles.dialogOverlay} />
              <AlertDialog.Content className={styles.dialogContent}>
                <AlertDialog.Title className={styles.dialogTitle}>
                  Lock this week?
                </AlertDialog.Title>
                <AlertDialog.Description className={styles.dialogDescription}>
                  Employees will not be able to add or edit entries for this
                  week.
                </AlertDialog.Description>
                <div className={styles.dialogActions}>
                  <AlertDialog.Cancel asChild>
                    <button type="button" className={styles.dialogCancelBtn} autoFocus>
                      Cancel
                    </button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action asChild>
                    <button
                      type="button"
                      className={styles.dialogConfirmBtn}
                      onClick={handleLock}
                      disabled={isPending}
                    >
                      Lock
                    </button>
                  </AlertDialog.Action>
                </div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>
        )}
      </td>
    </tr>
  )
}

export default function WeekLockTable({ weeks }: { weeks: WeekRow[] }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.th}>Week Range</th>
          <th className={styles.th}>Entries</th>
          <th className={styles.th}>Status</th>
          <th className={styles.th}>Action</th>
        </tr>
      </thead>
      <tbody>
        {weeks.map((week) => (
          <WeekRow key={week.weekStart} week={week} />
        ))}
      </tbody>
    </table>
  )
}
