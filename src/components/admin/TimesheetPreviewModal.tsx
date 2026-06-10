'use client'

import { useEffect, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import type { AdminTimesheetApproval } from '@/lib/types'
import { getTimesheetPreview } from '@/app/portal/admin/actions'
import styles from './TimesheetPreviewModal.module.scss'

type PreviewEntry = {
  project_id: string
  project_name: string
  work_date: string
  hours: number
  notes: string | null
}

type CellData = { hours: number; notesList: string[] }

type Props = {
  approval: AdminTimesheetApproval | null
  onClose: () => void
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function formatWeekHeader(weekStart: string): string {
  const d = new Date(weekStart + 'T00:00:00Z')
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function getWeekDates(weekStart: string): string[] {
  const dates: string[] = []
  const base = new Date(weekStart + 'T00:00:00Z')
  for (let i = 0; i < 7; i++) {
    const d = new Date(base)
    d.setUTCDate(base.getUTCDate() + i)
    dates.push(d.toISOString().split('T')[0] as string)
  }
  return dates
}

function formatHours(h: number): string {
  return h === 0 ? '—' : h % 1 === 0 ? String(h) : h.toFixed(1)
}

export default function TimesheetPreviewModal({ approval, onClose }: Props) {
  const [entries, setEntries] = useState<PreviewEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!approval) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setEntries([])
    getTimesheetPreview(approval.employee_id, approval.week_start).then((result) => {
      if (cancelled) return
      setLoading(false)
      if (result.error) setError(result.error)
      else setEntries(result.entries)
    })
    return () => { cancelled = true }
  }, [approval?.employee_id, approval?.week_start])

  if (!approval) return null

  const weekDates = getWeekDates(approval.week_start)

  // Build project rows: { project_id, project_name, byDate }
  const projectMap = new Map<string, { name: string; byDate: Map<string, CellData> }>()
  for (const entry of entries) {
    if (!projectMap.has(entry.project_id)) {
      projectMap.set(entry.project_id, { name: entry.project_name, byDate: new Map() })
    }
    const row = projectMap.get(entry.project_id)!
    const prev = row.byDate.get(entry.work_date) ?? { hours: 0, notesList: [] as string[] }
    row.byDate.set(entry.work_date, {
      hours: prev.hours + entry.hours,
      notesList: entry.notes ? [...prev.notesList, entry.notes] : prev.notesList,
    })
  }

  const projectRows = Array.from(projectMap.entries()).map(([id, { name, byDate }]) => {
    const dayData = weekDates.map((d) => byDate.get(d) ?? { hours: 0, notesList: [] })
    const total = dayData.reduce((sum, c) => sum + c.hours, 0)
    return { id, name, dayData, total }
  })

  const dayTotals = weekDates.map((_, i) =>
    projectRows.reduce((sum, row) => sum + (row.dayData[i]?.hours ?? 0), 0),
  )
  const weekTotal = dayTotals.reduce((sum, h) => sum + h, 0)

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>
            {approval.employee.full_name}
            <span className={styles.titleSep}>—</span>
            Week of {formatWeekHeader(approval.week_start)}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {loading && <p className={styles.stateMsg}>Loading…</p>}
          {error && <p className={styles.errorMsg}>{error}</p>}

          {!loading && !error && (
            <div className={styles.tableWrapper}>
              <table className={styles.grid}>
                <thead>
                  <tr>
                    <th className={styles.colProject}>Project</th>
                    {DAY_LABELS.map((label) => (
                      <th key={label} className={styles.colDay}>{label}</th>
                    ))}
                    <th className={styles.colTotal}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {projectRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className={styles.emptyCell}>
                        No entries for this week.
                      </td>
                    </tr>
                  ) : (
                    projectRows.map((row) => (
                      <tr key={row.id} className={styles.dataRow}>
                        <td className={styles.cellProject}>{row.name}</td>
                        {row.dayData.map((cell, i) => (
                          <td key={weekDates[i]} className={styles.cellHours}>
                            {cell.notesList.length > 0 ? (
                              <Popover.Root>
                                <Popover.Trigger asChild>
                                  <button className={styles.cellWithNotes}>
                                    {formatHours(cell.hours)}
                                    <span className={styles.notesDot} aria-label="has notes" />
                                  </button>
                                </Popover.Trigger>
                                <Popover.Portal>
                                  <Popover.Content className={styles.notesPopover} sideOffset={6}>
                                    {cell.notesList.join(' / ')}
                                    <Popover.Arrow className={styles.notesArrow} />
                                  </Popover.Content>
                                </Popover.Portal>
                              </Popover.Root>
                            ) : (
                              <span>{formatHours(cell.hours)}</span>
                            )}
                          </td>
                        ))}
                        <td className={styles.cellTotal}>{formatHours(row.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {projectRows.length > 0 && (
                  <tfoot>
                    <tr className={styles.footerRow}>
                      <td className={styles.footerLabel}>Total</td>
                      {dayTotals.map((h, i) => (
                        <td key={weekDates[i]} className={styles.footerHours}>
                          {formatHours(h)}
                        </td>
                      ))}
                      <td className={styles.footerTotal}>{formatHours(weekTotal)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
