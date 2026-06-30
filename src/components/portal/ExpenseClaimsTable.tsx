'use client'

import { useTransition, useState } from 'react'
import type { ExpenseClaim } from '@/lib/types'
import { getMyExpenseReceiptSignedUrl } from '@/app/portal/expenses/actions'
import styles from './ExpenseClaimsTable.module.scss'

type Props = {
  claims: ExpenseClaim[]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export default function ExpenseClaimsTable({ claims }: Props) {
  const [isPending, startTransition] = useTransition()
  const [downloadError, setDownloadError] = useState<string | null>(null)

  if (claims.length === 0) {
    return (
      <p className={styles.empty}>You have no expense claims yet.</p>
    )
  }

  function handleDownloadReceipt(receiptPath: string) {
    setDownloadError(null)
    startTransition(async () => {
      const result = await getMyExpenseReceiptSignedUrl(receiptPath)
      if (result.error) {
        setDownloadError(result.error)
      } else if (result.url) {
        window.open(result.url, '_blank', 'noopener,noreferrer')
      }
    })
  }

  return (
    <div className={styles.wrapper}>
      {downloadError && <p className={styles.errorMsg}>{downloadError}</p>}
      <div className={styles.overflow}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Description</th>
              <th className={styles.th}>Amount</th>
              <th className={styles.th}>Receipt</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Submitted</th>
              <th className={styles.th}>Comment</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id} className={styles.tr}>
                <td className={styles.tdMono}>{formatDate(claim.expense_date)}</td>
                <td className={styles.tdDesc}>{claim.description}</td>
                <td className={styles.tdMono}>{formatCurrency(claim.amount)}</td>
                <td className={styles.td}>
                  {claim.receipt_path ? (
                    <button
                      type="button"
                      className={styles.receiptBtn}
                      onClick={() => handleDownloadReceipt(claim.receipt_path!)}
                      disabled={isPending}
                    >
                      View
                    </button>
                  ) : (
                    <span className={styles.noValue}>—</span>
                  )}
                </td>
                <td className={styles.td}>
                  <span
                    className={
                      claim.status === 'pending'
                        ? styles.badgePending
                        : claim.status === 'approved'
                          ? styles.badgeApproved
                          : claim.status === 'reimbursed'
                            ? styles.badgeReimbursed
                            : styles.badgeRejected
                    }
                  >
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </span>
                </td>
                <td className={styles.tdMono}>{formatDate(claim.submitted_at)}</td>
                <td className={styles.tdComment}>
                  {claim.review_comment ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
