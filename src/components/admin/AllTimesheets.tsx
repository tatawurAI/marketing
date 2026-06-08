'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminTimeEntry, EmployeeFull, ProjectFull } from '@/lib/types'
import { exportTimesheetsCSV } from '@/app/portal/admin/actions'
import styles from './AllTimesheets.module.scss'

type Filters = {
  week?: string
  employee_id?: string
  project_id?: string
}

type Props = {
  entries: AdminTimeEntry[]
  employees: Pick<EmployeeFull, 'id' | 'full_name'>[]
  projects: Pick<ProjectFull, 'id' | 'name'>[]
  totalCount: number
  page: number
  pageSize: number
  currentFilters: Filters
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

export default function AllTimesheets({
  entries,
  employees,
  projects,
  totalCount,
  page,
  pageSize,
  currentFilters,
}: Props) {
  const router = useRouter()
  const [exportPending, startExportTransition] = useTransition()

  const [weekInput, setWeekInput] = useState(currentFilters.week ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep local week input in sync if filters change from the outside (e.g. browser back)
  useEffect(() => {
    setWeekInput(currentFilters.week ?? '')
  }, [currentFilters.week])

  function pushFilters(patch: Partial<Filters & { page?: number }>) {
    const params = new URLSearchParams()
    const merged = { ...currentFilters, page: 1, ...patch }
    if (merged.week) params.set('week', merged.week)
    if (merged.employee_id) params.set('employee_id', merged.employee_id)
    if (merged.project_id) params.set('project_id', merged.project_id)
    const p = (patch.page ?? 1)
    if (p > 1) params.set('page', String(p))
    router.push(`?${params.toString()}`)
  }

  function handleWeekChange(value: string) {
    setWeekInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      pushFilters({ week: value || undefined })
    }, 300)
  }

  function handleExport() {
    startExportTransition(async () => {
      const result = await exportTimesheetsCSV(currentFilters)
      if (result.csv) {
        const blob = new Blob([result.csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.filename
        a.click()
        URL.revokeObjectURL(url)
      }
    })
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className={styles.wrapper}>
      {/* Filter bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label htmlFor="filter-week" className={styles.filterLabel}>
            Week
          </label>
          <input
            id="filter-week"
            type="text"
            placeholder="YYYY-MM-DD"
            className={styles.weekInput}
            value={weekInput}
            onChange={(e) => handleWeekChange(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filter-employee" className={styles.filterLabel}>
            Employee
          </label>
          <select
            id="filter-employee"
            className={styles.filterSelect}
            value={currentFilters.employee_id ?? ''}
            onChange={(e) =>
              pushFilters({ employee_id: e.target.value || undefined })
            }
          >
            <option value="">All employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filter-project" className={styles.filterLabel}>
            Project
          </label>
          <select
            id="filter-project"
            className={styles.filterSelect}
            value={currentFilters.project_id ?? ''}
            onChange={(e) =>
              pushFilters({ project_id: e.target.value || undefined })
            }
          >
            <option value="">All projects</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className={styles.exportBtn}
          onClick={handleExport}
          disabled={exportPending}
        >
          {exportPending ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Employee</th>
            <th className={styles.th}>Project</th>
            <th className={styles.th}>Date</th>
            <th className={styles.th}>Hours</th>
            <th className={styles.th}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={5} className={styles.emptyCell}>
                No entries found.
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={entry.id} className={styles.tr}>
                <td className={styles.td}>{entry.employee.full_name}</td>
                <td className={styles.td}>{entry.project.name}</td>
                <td className={styles.td}>{formatDate(entry.work_date)}</td>
                <td className={styles.td}>
                  <span className={styles.hours}>{entry.hours.toFixed(1)}</span>
                </td>
                <td className={styles.tdNotes}>{entry.notes ?? '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => pushFilters({ page: page - 1 })}
          disabled={page <= 1}
        >
          Prev
        </button>
        <span className={styles.pageInfo}>
          Page {page} of {totalPages || 1}
        </span>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => pushFilters({ page: page + 1 })}
          disabled={page * pageSize >= totalCount}
        >
          Next
        </button>
      </div>
    </div>
  )
}
