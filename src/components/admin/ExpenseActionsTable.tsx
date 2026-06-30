'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminExpenseClaim } from '@/lib/types'
import {
  approveExpense,
  rejectExpense,
  markExpenseReimbursed,
  getExpenseReceiptSignedUrl,
} from '@/app/portal/admin/expenses/actions'
import { formatPortalDate, formatCurrency } from '@/lib/utils'
import styles from './ExpenseActionsTable.module.scss'

type StatusFilter = 'all' | 'pending' | 'approved' | 'reimbursed' | 'rejected'

type Props = {
  claims: AdminExpenseClaim[]
  currentStatus: StatusFilter
}

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'reimbursed', label: 'Reimbursed' },
  { value: 'rejected', label: 'Rejected' },
]

export default function ExpenseActionsTable({ claims, currentStatus }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [actionError, setActionError] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectComment, setRejectComment] = useState('')

  function pushStatus(status: StatusFilter) {
    const params = new URLSearchParams()
    if (status !== 'all') params.set('status', status)
    router.push(`?${params.toString()}`)
  }

  function handleApprove(claimId: string) {
    setActionError(null)
    startTransition(async () => {
      const result = await approveExpense(claimId)
      if (result.error) setActionError(result.error)
      else router.refresh()
    })
  }

  function handleRejectConfirm(claimId: string) {
    if (!rejectComment.trim()) return
    setActionError(null)
    startTransition(async () => {
      const result = await rejectExpense(claimId, rejectComment.trim())
      if (result.error) {
        setActionError(result.error)
      } else {
        setRejectingId(null)
        setRejectComment('')
        router.refresh()
      }
    })
  }

  function handleReimburse(claimId: string) {
    setActionError(null)
    startTransition(async () => {
      const result = await markExpenseReimbursed(claimId)
      if (result.error) setActionError(result.error)
      else router.refresh()
    })
  }

  function handleDownloadReceipt(receiptPath: string) {
    setActionError(null)
    startTransition(async () => {
      const result = await getExpenseReceiptSignedUrl(receiptPath)
      if (result.error) setActionError(result.error)
      else if (result.url) window.open(result.url, '_blank', 'noopener,noreferrer')
    })
  }

  return (
    <div className={styles.wrapper}>
      {/* Filter tabs */}
      <div className={styles.tabs}>
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={currentStatus === value ? styles.tabActive : styles.tab}
            onClick={() => pushStatus(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {actionError && <p className={styles.actionError}>{actionError}</p>}

      <div className={styles.overflow}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Employee</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Description</th>
              <th className={styles.th}>Amount</th>
              <th className={styles.th}>Receipt</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Submitted</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  No expense claims found.
                </td>
              </tr>
            ) : (
              claims.map((claim) => (
                <tr key={claim.id} className={styles.tr}>
                  <td className={styles.td}>{claim.employee.full_name}</td>
                  <td className={styles.tdMono}>{formatPortalDate(claim.expense_date)}</td>
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
                      <span className={styles.noReceipt}>—</span>
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
                  <td className={styles.tdMono}>{formatPortalDate(claim.submitted_at)}</td>
                  <td className={styles.td}>
                    <div className={styles.actionBtns}>
                      {claim.status === 'pending' &&
                        rejectingId !== claim.id && (
                          <>
                            <button
                              type="button"
                              className={styles.approveBtn}
                              onClick={() => handleApprove(claim.id)}
                              disabled={isPending}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className={styles.rejectTriggerBtn}
                              onClick={() => {
                                setRejectingId(claim.id)
                                setRejectComment('')
                              }}
                              disabled={isPending}
                            >
                              Reject
                            </button>
                          </>
                        )}

                      {claim.status === 'pending' && rejectingId === claim.id && (
                        <div className={styles.rejectForm}>
                          <textarea
                            className={styles.rejectTextarea}
                            placeholder="Rejection reason (required)"
                            value={rejectComment}
                            onChange={(e) => setRejectComment(e.target.value)}
                            rows={2}
                          />
                          <div className={styles.rejectFormBtns}>
                            <button
                              type="button"
                              className={styles.rejectBtn}
                              onClick={() => handleRejectConfirm(claim.id)}
                              disabled={isPending || !rejectComment.trim()}
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              className={styles.cancelBtn}
                              onClick={() => {
                                setRejectingId(null)
                                setRejectComment('')
                              }}
                              disabled={isPending}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {claim.status === 'approved' && (
                        <button
                          type="button"
                          className={styles.reimburseBtn}
                          onClick={() => handleReimburse(claim.id)}
                          disabled={isPending}
                        >
                          Mark Reimbursed
                        </button>
                      )}

                      {(claim.status === 'reimbursed' || claim.status === 'rejected') && (
                        <span className={styles.noAction}>—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
