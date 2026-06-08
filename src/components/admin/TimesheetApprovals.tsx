'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminTimesheetApproval, EmployeeFull } from '@/lib/types'
import {
  approveTimesheet,
  denyTimesheet,
  reopenTimesheet,
} from '@/app/portal/admin/actions'
import styles from './TimesheetApprovals.module.scss'

type Filters = {
  week?: string
  employee_id?: string
  status?: string
}

type Props = {
  approvals: AdminTimesheetApproval[]
  employees: Pick<EmployeeFull, 'id' | 'full_name'>[]
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

export default function TimesheetApprovals({
  approvals,
  employees,
  currentFilters,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [denyingId, setDenyingId] = useState<string | null>(null)
  const [denyComment, setDenyComment] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const [weekInput, setWeekInput] = useState(currentFilters.week ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setWeekInput(currentFilters.week ?? '')
  }, [currentFilters.week])

  function pushFilters(patch: Partial<Filters>) {
    const params = new URLSearchParams()
    const merged = { ...currentFilters, ...patch }
    if (merged.week) params.set('week', merged.week)
    if (merged.employee_id) params.set('employee_id', merged.employee_id)
    if (merged.status) params.set('status', merged.status)
    router.push(`?${params.toString()}`)
  }

  function handleWeekChange(value: string) {
    setWeekInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      pushFilters({ week: value || undefined })
    }, 300)
  }

  function handleApprove(approval: AdminTimesheetApproval) {
    setActionError(null)
    startTransition(async () => {
      const result = await approveTimesheet(approval.employee_id, approval.week_start)
      if (result.error) setActionError(result.error)
    })
  }

  function handleDenyConfirm(approval: AdminTimesheetApproval) {
    setActionError(null)
    startTransition(async () => {
      const result = await denyTimesheet(
        approval.employee_id,
        approval.week_start,
        denyComment,
      )
      if (result.error) {
        setActionError(result.error)
      } else {
        setDenyingId(null)
        setDenyComment('')
      }
    })
  }

  function handleReopen(approval: AdminTimesheetApproval) {
    setActionError(null)
    startTransition(async () => {
      const result = await reopenTimesheet(approval.employee_id, approval.week_start)
      if (result.error) setActionError(result.error)
    })
  }

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
          <label htmlFor="filter-status" className={styles.filterLabel}>
            Status
          </label>
          <select
            id="filter-status"
            className={styles.filterSelect}
            value={currentFilters.status ?? ''}
            onChange={(e) =>
              pushFilters({ status: e.target.value || undefined })
            }
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
        </div>
      </div>

      {actionError && <p className={styles.actionError}>{actionError}</p>}

      {/* Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Employee</th>
            <th className={styles.th}>Week</th>
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Submitted</th>
            <th className={styles.th}>Reviewer</th>
            <th className={styles.th}>Comment</th>
            <th className={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {approvals.length === 0 ? (
            <tr>
              <td colSpan={7} className={styles.emptyCell}>
                No approval requests found.
              </td>
            </tr>
          ) : (
            approvals.map((approval) => (
              <tr key={approval.id} className={styles.tr}>
                <td className={styles.td}>{approval.employee.full_name}</td>
                <td className={styles.td}>
                  <span className={styles.weekCode}>{approval.week_start}</span>
                </td>
                <td className={styles.td}>
                  <span
                    className={
                      approval.status === 'pending'
                        ? styles.badgePending
                        : approval.status === 'approved'
                          ? styles.badgeApproved
                          : styles.badgeDenied
                    }
                  >
                    {approval.status === 'pending'
                      ? 'Pending'
                      : approval.status === 'approved'
                        ? 'Approved'
                        : 'Denied'}
                  </span>
                </td>
                <td className={styles.td}>{formatDate(approval.submitted_at)}</td>
                <td className={styles.td}>
                  {approval.reviewer?.full_name ?? '—'}
                </td>
                <td className={styles.tdComment}>
                  {approval.review_comment ?? '—'}
                </td>
                <td className={styles.td}>
                  {approval.status === 'pending' && denyingId !== approval.id && (
                    <div className={styles.actionBtns}>
                      <button
                        type="button"
                        className={styles.approveBtn}
                        onClick={() => handleApprove(approval)}
                        disabled={isPending}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className={styles.denyBtn}
                        onClick={() => {
                          setDenyingId(approval.id)
                          setDenyComment('')
                        }}
                        disabled={isPending}
                      >
                        Deny
                      </button>
                    </div>
                  )}

                  {approval.status === 'pending' && denyingId === approval.id && (
                    <div className={styles.denyForm}>
                      <textarea
                        className={styles.denyTextarea}
                        placeholder="Reason for denial (optional)"
                        value={denyComment}
                        onChange={(e) => setDenyComment(e.target.value)}
                        rows={2}
                      />
                      <div className={styles.actionBtns}>
                        <button
                          type="button"
                          className={styles.denyBtn}
                          onClick={() => handleDenyConfirm(approval)}
                          disabled={isPending}
                        >
                          Confirm Deny
                        </button>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => {
                            setDenyingId(null)
                            setDenyComment('')
                          }}
                          disabled={isPending}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {(approval.status === 'approved' ||
                    approval.status === 'denied') && (
                    <button
                      type="button"
                      className={styles.reopenBtn}
                      onClick={() => handleReopen(approval)}
                      disabled={isPending}
                    >
                      Re-open
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
