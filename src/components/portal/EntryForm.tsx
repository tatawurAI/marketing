'use client'

import { useState, useEffect, useTransition } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Select from '@radix-ui/react-select'
import { ChevronDown } from 'lucide-react'
import type { TimeEntry, Project } from '@/lib/types'
import {
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
} from '@/app/portal/timesheets/actions'
import styles from './EntryForm.module.scss'

type Props = {
  open: boolean
  day: string | null
  existingEntry: TimeEntry | null
  projects: Project[]
  isLocked: boolean
  defaultProjectId?: string
  onClose: () => void
}

export default function EntryForm({
  open,
  day,
  existingEntry,
  projects,
  isLocked,
  defaultProjectId,
  onClose,
}: Props) {
  const [projectId, setProjectId] = useState('')
  const [hours, setHours] = useState(1.0)
  const [notes, setNotes] = useState('')
  const [hoursError, setHoursError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      setProjectId(existingEntry?.project_id ?? defaultProjectId ?? projects[0]?.id ?? '')
      setHours(existingEntry?.hours ?? 1.0)
      setNotes(existingEntry?.notes ?? '')
      setHoursError(null)
      setFormError(null)
    }
  }, [open, existingEntry, defaultProjectId, projects])

  function validateHours(value: number): string | null {
    if (value < 0.5 || value > 24) return 'Hours must be between 0.5 and 24'
    return null
  }

  function handleHoursBlur() {
    setHoursError(validateHours(hours))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const error = validateHours(hours)
    if (error) {
      setHoursError(error)
      return
    }
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = existingEntry
        ? await updateTimeEntry(formData)
        : await createTimeEntry(formData)
      if (!result.error) {
        onClose()
      } else {
        setFormError(result.error)
      }
    })
  }

  function handleDelete() {
    if (!existingEntry) return
    startTransition(async () => {
      const result = await deleteTimeEntry(existingEntry.id)
      if (result.error) {
        setFormError(result.error)
      } else {
        onClose()
      }
    })
  }

  const isEdit = !!existingEntry

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content} aria-describedby={undefined}>
          <Dialog.Title className={styles.title}>
            {isEdit ? 'Edit Entry' : 'Log Time'}
          </Dialog.Title>

          {formError && <p className={styles.formError}>{formError}</p>}

          <form onSubmit={handleSubmit}>
            <input type="hidden" name="work_date" value={day ?? ''} />
            {isEdit && <input type="hidden" name="id" value={existingEntry.id} />}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="project-trigger">
                Project
              </label>
              <input type="hidden" name="project_id" value={projectId} />
              <Select.Root
                value={projectId}
                onValueChange={setProjectId}
                disabled={isEdit}
              >
                <Select.Trigger
                  id="project-trigger"
                  className={styles.selectTrigger}
                >
                  <Select.Value placeholder="Select project" />
                  <Select.Icon>
                    <ChevronDown size={14} strokeWidth={1.5} />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content
                    className={styles.selectContent}
                    position="popper"
                    sideOffset={4}
                  >
                    <Select.Viewport>
                      {projects.map((p) => (
                        <Select.Item
                          key={p.id}
                          value={p.id}
                          className={styles.selectItem}
                        >
                          <Select.ItemText>{p.name}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="hours-input">
                Hours
              </label>
              <div className={styles.hoursRow}>
                <button
                  type="button"
                  className={styles.stepperBtn}
                  aria-label="Decrease hours"
                  onClick={() =>
                    setHours((h) =>
                      Math.max(0.5, parseFloat((h - 0.5).toFixed(1))),
                    )
                  }
                >
                  −
                </button>
                <input
                  id="hours-input"
                  type="number"
                  name="hours"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  onBlur={handleHoursBlur}
                  className={styles.hoursInput}
                />
                <button
                  type="button"
                  className={styles.stepperBtn}
                  aria-label="Increase hours"
                  onClick={() =>
                    setHours((h) =>
                      Math.min(24, parseFloat((h + 0.5).toFixed(1))),
                    )
                  }
                >
                  +
                </button>
              </div>
              {hoursError && <p className={styles.fieldError}>{hoursError}</p>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="notes-input">
                Notes
              </label>
              <textarea
                id="notes-input"
                name="notes"
                className={styles.textarea}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className={styles.actions}>
              {isEdit && (
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={handleDelete}
                  disabled={isPending || isLocked}
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isPending || isLocked}
              >
                {isEdit ? 'Save Changes' : 'Log Time'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
