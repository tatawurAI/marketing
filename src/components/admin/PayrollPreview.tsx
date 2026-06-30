'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPayrollRun } from '@/app/portal/admin/payroll/actions'
import styles from './PayrollPreview.module.scss'

type ProjectRow = {
  projectName: string
  hours: number
}

type Props = {
  employeeId: string
  periodStart: string
  periodEnd: string
  totalHours: number
  hourlyRate: number | null
  totalPay: number | null
  projectBreakdown: ProjectRow[]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function PayrollPreview({
  employeeId,
  periodStart,
  periodEnd,
  totalHours,
  hourlyRate,
  totalPay,
  projectBreakdown,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState(false)

  function handleCreate() {
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('employee_id', employeeId)
      fd.set('period_start', periodStart)
      fd.set('period_end', periodEnd)
      const result = await createPayrollRun(fd)
      if (result.error) {
        setError(result.error)
      } else {
        setCreated(true)
        router.refresh()
      }
    })
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Total Hours</span>
          <span className={styles.cardValue}>{totalHours.toFixed(2)}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Hourly Rate</span>
          <span className={styles.cardValue}>
            {hourlyRate != null ? `${formatCurrency(hourlyRate)}/hr` : '—'}
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Total Pay</span>
          <span className={styles.cardValueLarge}>
            {totalPay != null ? formatCurrency(totalPay) : '—'}
          </span>
        </div>
      </div>

      {projectBreakdown.length > 0 && (
        <div className={styles.breakdown}>
          <h3 className={styles.breakdownHeading}>Hours by Project</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Project</th>
                <th className={styles.th}>Hours</th>
              </tr>
            </thead>
            <tbody>
              {projectBreakdown.map((row) => (
                <tr key={row.projectName} className={styles.tr}>
                  <td className={styles.td}>{row.projectName}</td>
                  <td className={styles.tdMono}>{row.hours.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.createRow}>
        <button
          type="button"
          className={created ? styles.createBtnSuccess : styles.createBtn}
          onClick={handleCreate}
          disabled={isPending || created || hourlyRate == null}
        >
          {created ? 'Pay Run Created ✓' : isPending ? 'Creating…' : 'Create Pay Run'}
        </button>
        {hourlyRate == null && (
          <p className={styles.rateWarning}>⚠ Salary rate not set for this employee.</p>
        )}
      </div>
    </div>
  )
}
