'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import type { EmployeeFull } from '@/lib/types'
import { toggleEmployeeActive } from '@/app/portal/admin/actions'
import styles from './EmployeeTable.module.scss'

export default function EmployeeTable({
  employees,
}: {
  employees: EmployeeFull[]
}) {
  const [isPending, startTransition] = useTransition()

  function handleToggle(id: string, nextActive: boolean) {
    startTransition(async () => {
      await toggleEmployeeActive(id, nextActive)
    })
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.th}>Name</th>
          <th className={styles.th}>Title</th>
          <th className={styles.th}>Department</th>
          <th className={styles.th}>Hourly Rate</th>
          <th className={styles.th}>Status</th>
          <th className={styles.th}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((employee) => (
          <tr key={employee.id} className={styles.tr}>
            <td className={styles.td}>{employee.full_name}</td>
            <td className={styles.td}>{employee.title}</td>
            <td className={styles.td}>{employee.department ?? '—'}</td>
            <td className={styles.td}>
              <span className={styles.rate}>
                ${employee.salary_rate.toFixed(2)}/hr
              </span>
            </td>
            <td className={styles.td}>
              <span
                className={
                  employee.is_active ? styles.badgeActive : styles.badgeInactive
                }
              >
                {employee.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className={styles.tdActions}>
              <Link
                href={`/portal/admin/employees/${employee.id}`}
                className={styles.actionLink}
              >
                Edit
              </Link>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => handleToggle(employee.id, !employee.is_active)}
                disabled={isPending}
              >
                {employee.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
