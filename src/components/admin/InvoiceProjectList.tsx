'use client'

import type { ProjectInvoicePreview } from '@/lib/pdf/types'
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
  if (projects.length === 0) {
    return (
      <p className={styles.empty}>
        No time entries found for this employee in the selected period.
      </p>
    )
  }

  return (
    <div className={styles.wrapper}>
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
                  <a
                    href={`/api/portal/invoice?employeeId=${employeeId}&projectId=${project.projectId}&startDate=${start}&endDate=${end}`}
                    download
                    className={styles.downloadBtn}
                  >
                    Download PDF
                  </a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
