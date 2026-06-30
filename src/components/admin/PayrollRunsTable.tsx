'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminPayrollRun } from '@/lib/types'
import {
  submitPayrollRun,
  markPayrollPaid,
  deletePayrollDraft,
  getPayrollSignedUrl,
} from '@/app/portal/admin/payroll/actions'
import { formatPortalDate } from '@/lib/utils'
import styles from './PayrollRunsTable.module.scss'

type Props = {
  runs: AdminPayrollRun[]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function PayrollRunsTable({ runs }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [actionError, setActionError] = useState<string | null>(null)

  if (runs.length === 0) {
    return <p className={styles.empty}>No payroll runs found.</p>
  }

  function handleSubmit(runId: string) {
    setActionError(null)
    startTransition(async () => {
      const result = await submitPayrollRun(runId)
      if (result.error) {
        setActionError(result.error)
      } else if (result.signedUrl) {
        window.open(result.signedUrl, '_blank', 'noopener,noreferrer')
        router.refresh()
      }
    })
  }

  function handleDelete(runId: string) {
    setActionError(null)
    startTransition(async () => {
      const result = await deletePayrollDraft(runId)
      if (result.error) {
        setActionError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  function handleMarkPaid(runId: string) {
    setActionError(null)
    startTransition(async () => {
      const result = await markPayrollPaid(runId)
      if (result.error) {
        setActionError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  function handleDownload(pdfPath: string) {
    setActionError(null)
    startTransition(async () => {
      const result = await getPayrollSignedUrl(pdfPath)
      if (result.error) {
        setActionError(result.error)
      } else if (result.url) {
        window.open(result.url, '_blank', 'noopener,noreferrer')
      }
    })
  }

  return (
    <div className={styles.wrapper}>
      {actionError && <p className={styles.actionError}>{actionError}</p>}
      <div className={styles.overflow}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Employee</th>
              <th className={styles.th}>Period</th>
              <th className={styles.th}>Hours</th>
              <th className={styles.th}>Rate/hr</th>
              <th className={styles.th}>Total</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>PDF</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id} className={styles.tr}>
                <td className={styles.td}>{run.employee.full_name}</td>
                <td className={styles.tdMono}>
                  {formatPortalDate(run.period_start)} – {formatPortalDate(run.period_end)}
                </td>
                <td className={styles.tdMono}>{run.total_hours.toFixed(2)}</td>
                <td className={styles.tdMono}>{formatCurrency(run.hourly_rate)}</td>
                <td className={styles.tdMono}>{formatCurrency(run.total_amount)}</td>
                <td className={styles.td}>
                  <span
                    className={
                      run.status === 'draft'
                        ? styles.badgeDraft
                        : run.status === 'submitted'
                          ? styles.badgeSubmitted
                          : styles.badgePaid
                    }
                  >
                    {run.status === 'draft' ? 'Draft' : run.status === 'submitted' ? 'Submitted' : 'Paid'}
                  </span>
                </td>
                <td className={styles.td}>
                  {run.pdf_path ? (
                    <button
                      type="button"
                      className={styles.pdfBtn}
                      onClick={() => handleDownload(run.pdf_path!)}
                      disabled={isPending}
                    >
                      Download
                    </button>
                  ) : (
                    <span className={styles.noPdf}>—</span>
                  )}
                </td>
                <td className={styles.td}>
                  <div className={styles.actionBtns}>
                    {run.status === 'draft' && (
                      <>
                        <button
                          type="button"
                          className={styles.submitBtn}
                          onClick={() => handleSubmit(run.id)}
                          disabled={isPending}
                        >
                          Submit
                        </button>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(run.id)}
                          disabled={isPending}
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {run.status === 'submitted' && (
                      <button
                        type="button"
                        className={styles.paidBtn}
                        onClick={() => handleMarkPaid(run.id)}
                        disabled={isPending}
                      >
                        Mark Paid
                      </button>
                    )}
                    {run.status === 'paid' && run.paid_at && (
                      <span className={styles.paidDate}>
                        Paid {formatPortalDate(run.paid_at)}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
