'use client'

import { useState } from 'react'
import type { TimeEntry, Project } from '@/lib/types'
import DayColumn from './DayColumn'
import EntryForm from './EntryForm'
import LockBanner from './LockBanner'
import WeekPicker from './WeekPicker'
import styles from './TimesheetShell.module.scss'

type Props = {
  entries: TimeEntry[]
  projects: Project[]
  isLocked: boolean
  weekStart: string
}

type ModalState = {
  open: boolean
  day: string | null
  existingEntry: TimeEntry | null
}

function addDaysToDateStr(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year!, month! - 1, day! + days)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
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
  isLocked,
  weekStart,
}: Props) {
  const [modal, setModal] = useState<ModalState>({
    open: false,
    day: null,
    existingEntry: null,
  })

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

  const activeProjectIds = new Set(entries.map((e) => e.project_id))
  const activeProjects = projects.filter((p) => activeProjectIds.has(p.id))

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

  return (
    <div className={styles.shell}>
      <WeekPicker weekStart={weekStart} isLocked={isLocked} />
      <LockBanner isLocked={isLocked} />

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
            {activeProjects.length === 0 && (
              <tr>
                <td
                  colSpan={days.length + 2}
                  className={styles.emptyState}
                >
                  No time logged this week
                </td>
              </tr>
            )}
            {activeProjects.map((project) => (
              <tr key={project.id}>
                <th scope="row" className={styles.projectName}>
                  {project.name}
                </th>
                {days.map((day) => (
                  <td key={day}>
                    <DayColumn
                      date={day}
                      entries={
                        entriesByProject[project.id]?.[day] ?? []
                      }
                      isLocked={isLocked}
                      onAddClick={(d) =>
                        setModal({ open: true, day: d, existingEntry: null })
                      }
                      onEditClick={(e) =>
                        setModal({
                          open: true,
                          day: e.work_date,
                          existingEntry: e,
                        })
                      }
                    />
                  </td>
                ))}
                <td className={styles.total}>{rowTotal(project.id)}h</td>
              </tr>
            ))}
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
        onClose={() =>
          setModal({ open: false, day: null, existingEntry: null })
        }
      />
    </div>
  )
}
