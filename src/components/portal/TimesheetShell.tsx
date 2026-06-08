'use client'

import { useState, useTransition } from 'react'
import type { TimeEntry, Project, TimesheetApproval } from '@/lib/types'
import DayColumn from './DayColumn'
import EntryForm from './EntryForm'
import LockBanner from './LockBanner'
import WeekPicker from './WeekPicker'
import {
  addWeekProject,
  removeWeekProject,
  submitTimesheetForReview,
} from '@/app/portal/timesheets/actions'
import styles from './TimesheetShell.module.scss'

type Props = {
  entries: TimeEntry[]
  projects: Project[]
  availableProjects: Project[]
  isLocked: boolean
  weekStart: string
  approval: TimesheetApproval | null
}

type ModalState = {
  open: boolean
  day: string | null
  projectId: string | null
  existingEntry: TimeEntry | null
}

function addDaysToDateStr(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00Z')
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().split('T')[0]!
}

function formatDay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year!, month! - 1, day!)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
  return `${weekday} ${day}`
}

export default function TimesheetShell({
  entries,
  projects,
  availableProjects,
  isLocked,
  weekStart,
  approval,
}: Props) {
  const [modal, setModal] = useState<ModalState>({
    open: false,
    day: null,
    projectId: null,
    existingEntry: null,
  })
  const [addSelectId, setAddSelectId] = useState('')
  const [isPending, startTransition] = useTransition()
  const [actionError, setActionError] = useState<string | null>(null)

  const days = Array.from({ length: 7 }, (_, i) =>
    addDaysToDateStr(weekStart, i),
  )

  const entriesByProject: Record<string, Record<string, TimeEntry[]>> = {}
  for (const entry of entries) {
    if (!entriesByProject[entry.project_id]) {
      entriesByProject[entry.project_id] = {}
    }
    const projectMap = entriesByProject[entry.project_id]!
    if (!projectMap[entry.work_date]) {
      projectMap[entry.work_date] = []
    }
    projectMap[entry.work_date]!.push(entry)
  }

  function rowTotal(projectId: string): string {
    return entries
      .filter((e) => e.project_id === projectId)
      .reduce((sum, e) => sum + e.hours, 0)
      .toFixed(1)
  }

  function dayTotal(day: string): string {
    return entries
      .filter((e) => e.work_date === day)
      .reduce((sum, e) => sum + e.hours, 0)
      .toFixed(1)
  }

  const weekTotal = entries.reduce((sum, e) => sum + e.hours, 0).toFixed(1)

  const pinnedIds = new Set(projects.map((p) => p.id))
  const addableProjects = availableProjects.filter((p) => !pinnedIds.has(p.id))

  function handleAddProject() {
    if (!addSelectId) return
    const idToAdd = addSelectId
    setActionError(null)
    startTransition(async () => {
      const result = await addWeekProject(weekStart, idToAdd)
      if (result.error) { setActionError(result.error); return }
      setAddSelectId('')
    })
  }

  function handleRemoveProject(projectId: string) {
    setActionError(null)
    startTransition(async () => {
      const result = await removeWeekProject(weekStart, projectId)
      if (result.error) setActionError(result.error)
    })
  }

  function handleSubmitForReview() {
    setActionError(null)
    startTransition(async () => {
      const result = await submitTimesheetForReview(weekStart)
      if (result.error) setActionError(result.error)
    })
  }

  // Hide the bar only when week is locked AND there's no approval record at all
  const showApprovalBar = !(isLocked && approval === null)

  return (
    <div className={styles.shell}>
      <WeekPicker weekStart={weekStart} isLocked={isLocked} />
      <LockBanner isLocked={isLocked} />

      {actionError && (
        <div className={styles.actionError} role="alert">
          {actionError}
        </div>
      )}

      {showApprovalBar && (
        <div className={styles.approvalBar}>
          {approval === null && !isLocked && (
            <>
              <span className={styles.approvalLabel}>
                Timesheet not yet submitted
              </span>
              <button
                type="button"
                className={styles.submitReviewBtn}
                onClick={handleSubmitForReview}
                disabled={isPending}
              >
                Submit for Review
              </button>
            </>
          )}

          {approval?.status === 'pending' && (
            <>
              <span className={styles.approvalLabel}>Status:</span>
              <span className={styles.badgePending}>Awaiting Review</span>
            </>
          )}

          {approval?.status === 'approved' && (
            <>
              <span className={styles.approvalLabel}>Status:</span>
              <span className={styles.badgeApproved}>Approved</span>
            </>
          )}

          {approval?.status === 'denied' && (
            <>
              <span className={styles.approvalLabel}>Status:</span>
              <span className={styles.badgeDenied}>Denied</span>
              {approval.review_comment && (
                <span className={styles.denyComment}>
                  &ldquo;{approval.review_comment}&rdquo;
                </span>
              )}
              <button
                type="button"
                className={styles.resubmitBtn}
                onClick={handleSubmitForReview}
                disabled={isPending}
              >
                Resubmit
              </button>
            </>
          )}
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" className={styles.projectHeader}>
                Project
              </th>
              {days.map((d) => (
                <th scope="col" key={d} className={styles.dayHeader}>
                  {formatDay(d)}
                </th>
              ))}
              <th scope="col" className={styles.totalHeader}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 && (
              <tr>
                <td colSpan={days.length + 2} className={styles.emptyState}>
                  No projects pinned this week
                </td>
              </tr>
            )}

            {projects.map((project) => {
              const projectHasEntries = entries.some(
                (e) => e.project_id === project.id,
              )
              return (
                <tr key={project.id}>
                  <th scope="row" className={styles.projectName}>
                    <span>{project.name}</span>
                    {!projectHasEntries && !isLocked && (
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => handleRemoveProject(project.id)}
                        disabled={isPending}
                        aria-label={`Remove ${project.name}`}
                      >
                        ✕
                      </button>
                    )}
                  </th>
                  {days.map((day) => (
                    <td key={day}>
                      <DayColumn
                        date={day}
                        projectId={project.id}
                        entries={entriesByProject[project.id]?.[day] ?? []}
                        isLocked={isLocked}
                        onAddClick={(d, pid) =>
                          setModal({
                            open: true,
                            day: d,
                            projectId: pid,
                            existingEntry: null,
                          })
                        }
                        onEditClick={(e) =>
                          setModal({
                            open: true,
                            day: e.work_date,
                            projectId: e.project_id,
                            existingEntry: e,
                          })
                        }
                      />
                    </td>
                  ))}
                  <td className={styles.total}>{rowTotal(project.id)}h</td>
                </tr>
              )
            })}

            {!isLocked && (
              <tr className={styles.addProjectRow}>
                <td colSpan={days.length + 2}>
                  {addableProjects.length > 0 ? (
                    <div className={styles.addProjectControls}>
                      <select
                        className={styles.addProjectSelect}
                        value={addSelectId}
                        onChange={(e) => setAddSelectId(e.target.value)}
                      >
                        <option value="">Select project to add…</option>
                        {addableProjects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className={styles.addProjectBtn}
                        onClick={handleAddProject}
                        disabled={isPending || !addSelectId}
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <span className={styles.noProjectsMsg}>
                      No projects available to add
                    </span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              {days.map((d) => (
                <td key={d} className={styles.total}>
                  {dayTotal(d)}h
                </td>
              ))}
              <td className={styles.weekTotal}>{weekTotal}h</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <EntryForm
        open={modal.open}
        day={modal.day}
        existingEntry={modal.existingEntry}
        projects={projects}
        isLocked={isLocked}
        defaultProjectId={modal.projectId ?? undefined}
        onClose={() =>
          setModal({ open: false, day: null, projectId: null, existingEntry: null })
        }
      />
    </div>
  )
}
