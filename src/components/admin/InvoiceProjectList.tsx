'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ProjectInvoicePreview } from '@/lib/pdf/types'
import { createInvoiceDraft } from '@/app/portal/admin/invoices/actions'
import styles from './InvoiceProjectList.module.scss'

type Props = {
  projects: ProjectInvoicePreview[]
  employeeId: string
  start: string
  end: string
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function InvoiceProjectList({ projects, employeeId, start, end }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [actionError, setActionError] = useState<string | null>(null)
  const [createdIds, setCreatedIds] = useState<Set<string>>(new Set())

  if (projects.length === 0) {
    return (
      <p className={styles.empty}>
        No time entries found for this employee in the selected period.
      </p>
    )
  }

  function handleCreateDraft(projectId: string) {
    setActionError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('employee_id', employeeId)
      fd.set('project_id', projectId)
      fd.set('period_start', start)
      fd.set('period_end', end)
      const result = await createInvoiceDraft(fd)
      if (result.error) {
        setActionError(result.error)
      } else {
        setCreatedIds((prev) => new Set([...prev, projectId]))
        router.refresh()
      }
    })
  }

  return (
    <div className={styles.wrapper}>
      {actionError && <p className={styles.actionError}>{actionError}</p>}
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Project</th>
            <th className={styles.th}>Hours</th>
            <th className={styles.th}>Billing Rate</th>
            <th className={styles.th}>Total</th>
            <th className={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const total =
              project.billingRate !== null
                ? project.totalHours * project.billingRate
                : null

            return (
              <tr key={project.projectId} className={styles.tr}>
                <td className={styles.td}>{project.projectName}</td>
                <td className={styles.tdMono}>{project.totalHours.toFixed(2)}</td>
                <td className={styles.td}>
                  {project.billingRate !== null ? (
                    <span className={styles.tdMono}>
                      {formatCurrency(project.billingRate)}/hr
                    </span>
                  ) : (
                    <span className={styles.rateWarning}>⚠ Rate not set</span>
                  )}
                </td>
                <td className={styles.tdMono}>
                  {total !== null ? formatCurrency(total) : '—'}
                </td>
                <td className={styles.tdAction}>
                  <div className={styles.actionBtns}>
                    <a
                      href={`/api/portal/invoice?employeeId=${employeeId}&projectId=${project.projectId}&startDate=${start}&endDate=${end}`}
                      download
                      className={styles.downloadBtn}
                    >
                      Preview PDF
                    </a>
                    <button
                      type="button"
                      className={
                        createdIds.has(project.projectId)
                          ? styles.createDraftBtnSuccess
                          : styles.createDraftBtn
                      }
                      onClick={() => handleCreateDraft(project.projectId)}
                      disabled={isPending || createdIds.has(project.projectId)}
                    >
                      {createdIds.has(project.projectId) ? 'Draft Created ✓' : isPending ? 'Creating…' : 'Create Draft'}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
