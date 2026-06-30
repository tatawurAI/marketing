'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminInvoice } from '@/lib/types'
import {
  submitInvoice,
  markInvoicePaid,
  deleteInvoiceDraft,
  getInvoiceSignedUrl,
} from '@/app/portal/admin/invoices/actions'
import styles from './InvoiceHistoryTable.module.scss'

type Props = {
  invoices: AdminInvoice[]
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

export default function InvoiceHistoryTable({ invoices }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [actionError, setActionError] = useState<string | null>(null)

  if (invoices.length === 0) {
    return <p className={styles.empty}>No invoices found for this employee.</p>
  }

  function handleSubmit(invoiceId: string) {
    setActionError(null)
    startTransition(async () => {
      const result = await submitInvoice(invoiceId)
      if (result.error) {
        setActionError(result.error)
      } else if (result.signedUrl) {
        window.open(result.signedUrl, '_blank', 'noopener,noreferrer')
        router.refresh()
      }
    })
  }

  function handleDelete(invoiceId: string) {
    setActionError(null)
    startTransition(async () => {
      const result = await deleteInvoiceDraft(invoiceId)
      if (result.error) {
        setActionError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  function handleMarkPaid(invoiceId: string) {
    setActionError(null)
    startTransition(async () => {
      const result = await markInvoicePaid(invoiceId)
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
      const result = await getInvoiceSignedUrl(pdfPath)
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
              <th className={styles.th}>Project</th>
              <th className={styles.th}>Period</th>
              <th className={styles.th}>Hours</th>
              <th className={styles.th}>Amount</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>PDF</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className={styles.tr}>
                <td className={styles.td}>{inv.project.name}</td>
                <td className={styles.tdMono}>
                  {formatDate(inv.period_start)} – {formatDate(inv.period_end)}
                </td>
                <td className={styles.tdMono}>{inv.total_hours.toFixed(2)}</td>
                <td className={styles.tdMono}>
                  {inv.total_amount != null ? formatCurrency(inv.total_amount) : '—'}
                </td>
                <td className={styles.td}>
                  <span
                    className={
                      inv.status === 'draft'
                        ? styles.badgeDraft
                        : inv.status === 'submitted'
                          ? styles.badgeSubmitted
                          : styles.badgePaid
                    }
                  >
                    {inv.status === 'draft' ? 'Draft' : inv.status === 'submitted' ? 'Submitted' : 'Paid'}
                  </span>
                </td>
                <td className={styles.td}>
                  {inv.pdf_path ? (
                    <button
                      type="button"
                      className={styles.pdfBtn}
                      onClick={() => handleDownload(inv.pdf_path!)}
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
                    {inv.status === 'draft' && (
                      <>
                        <button
                          type="button"
                          className={styles.submitBtn}
                          onClick={() => handleSubmit(inv.id)}
                          disabled={isPending}
                        >
                          Submit
                        </button>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(inv.id)}
                          disabled={isPending}
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {inv.status === 'submitted' && (
                      <button
                        type="button"
                        className={styles.paidBtn}
                        onClick={() => handleMarkPaid(inv.id)}
                        disabled={isPending}
                      >
                        Mark Paid
                      </button>
                    )}
                    {inv.status === 'paid' && inv.paid_at && (
                      <span className={styles.paidDate}>
                        Paid {formatDate(inv.paid_at)}
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
