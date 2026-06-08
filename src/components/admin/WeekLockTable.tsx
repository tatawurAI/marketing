'use client'

import { useState, useTransition } from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { lockWeek, unlockWeek } from '@/app/portal/admin/actions'
import styles from './WeekLockTable.module.scss'

type WeekRow = {
  weekStart: string
  entryCount: number
  isLocked: boolean
}

type PendingAction = { weekStart: string; action: 'lock' | 'unlock' }

function formatWeekRange(weekStart: string): string {
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

export default function WeekLockTable({ weeks }: { weeks: WeekRow[] }) {
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    if (!pending) return
    startTransition(async () => {
      if (pending.action === 'lock') {
        await lockWeek(pending.weekStart)
      } else {
        await unlockWeek(pending.weekStart)
      }
      setPending(null)
    })
  }

  const isUnlock = pending?.action === 'unlock'

  return (
    <AlertDialog.Root
      open={pending !== null}
      onOpenChange={(open) => !open && setPending(null)}
    >
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
            <tr key={week.weekStart} className={styles.tr}>
              <td className={styles.td}>{formatWeekRange(week.weekStart)}</td>
              <td className={styles.td}>{week.entryCount}</td>
              <td className={styles.td}>
                <span className={week.isLocked ? styles.statusLocked : styles.statusOpen}>
                  {week.isLocked ? 'Locked' : 'Open'}
                </span>
              </td>
              <td className={styles.tdActions}>
                <AlertDialog.Trigger asChild>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    disabled={isPending}
                    onClick={() =>
                      setPending({
                        weekStart: week.weekStart,
                        action: week.isLocked ? 'unlock' : 'lock',
                      })
                    }
                  >
                    {week.isLocked ? 'Unlock' : 'Lock'}
                  </button>
                </AlertDialog.Trigger>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className={styles.dialogOverlay} />
        <AlertDialog.Content className={styles.dialogContent}>
          <AlertDialog.Title className={styles.dialogTitle}>
            {isUnlock ? 'Unlock this week?' : 'Lock this week?'}
          </AlertDialog.Title>
          <AlertDialog.Description className={styles.dialogDescription}>
            {isUnlock
              ? 'This will allow employees to edit or delete entries for this week, including entries that may already have been used for payroll. This cannot be automatically reversed. Are you sure?'
              : 'Employees will not be able to add or edit entries for this week.'}
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
                className={isUnlock ? styles.btnDestructive : styles.dialogConfirmBtn}
                onClick={handleConfirm}
                disabled={isPending}
              >
                {isUnlock ? 'Unlock' : 'Lock'}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
