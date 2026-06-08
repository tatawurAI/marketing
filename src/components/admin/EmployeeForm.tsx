'use client'

import { useState, useTransition } from 'react'
import type { EmployeeFull, BillingRate, Project } from '@/lib/types'
import {
  updateEmployee,
  upsertBillingRate,
  deleteBillingRate,
} from '@/app/portal/admin/actions'
import styles from './EmployeeForm.module.scss'

type Props = {
  employee: EmployeeFull
  projects: Project[]
  billingRates: BillingRate[]
}

export default function EmployeeForm({ employee, projects, billingRates }: Props) {
  const [detailsPending, startDetailsTransition] = useTransition()
  const [ratePending, startRateTransition] = useTransition()

  const [detailsMessage, setDetailsMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Add-row state
  const [addProjectId, setAddProjectId] = useState('')
  const [addRate, setAddRate] = useState('')
  const [addError, setAddError] = useState<string | null>(null)

  // Per-row edit state: map of rate.id → edited value string
  const [editingRates, setEditingRates] = useState<Record<string, string>>({})

  const assignedProjectIds = new Set(billingRates.map((r) => r.project_id))
  const availableProjects = projects.filter((p) => !assignedProjectIds.has(p.id))

  function handleDetailsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setDetailsMessage(null)
    const formData = new FormData(e.currentTarget)
    startDetailsTransition(async () => {
      const result = await updateEmployee(formData)
      if (!result.error) {
        setDetailsMessage({ type: 'success', text: 'Saved.' })
      } else {
        setDetailsMessage({ type: 'error', text: result.error })
      }
    })
  }

  function handleAddRate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAddError(null)
    if (!addProjectId) {
      setAddError('Select a project.')
      return
    }
    const rateNum = parseFloat(addRate)
    if (isNaN(rateNum) || rateNum < 0) {
      setAddError('Enter a valid rate.')
      return
    }
    const formData = new FormData()
    formData.set('employee_id', employee.id)
    formData.set('project_id', addProjectId)
    formData.set('billable_rate', String(rateNum))
    startRateTransition(async () => {
      const result = await upsertBillingRate(formData)
      if (!result.error) {
        setAddProjectId('')
        setAddRate('')
      } else {
        setAddError(result.error)
      }
    })
  }

  function handleSaveEdit(rateId: string, projectId: string) {
    const val = editingRates[rateId]
    if (val === undefined) return
    const rateNum = parseFloat(val)
    if (isNaN(rateNum) || rateNum < 0) return
    const formData = new FormData()
    formData.set('employee_id', employee.id)
    formData.set('project_id', projectId)
    formData.set('billable_rate', String(rateNum))
    startRateTransition(async () => {
      await upsertBillingRate(formData)
      setEditingRates((prev) => {
        const next = { ...prev }
        delete next[rateId]
        return next
      })
    })
  }

  function handleDeleteRate(rateId: string) {
    startRateTransition(async () => {
      await deleteBillingRate(rateId, employee.id)
    })
  }

  return (
    <div className={styles.wrapper}>
      {/* Section 1: Employee Details */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Employee Details</h2>
        <form onSubmit={handleDetailsSubmit} className={styles.form}>
          <input type="hidden" name="id" value={employee.id} />

          {detailsMessage && (
            <p
              className={
                detailsMessage.type === 'success'
                  ? styles.successMsg
                  : styles.errorMsg
              }
            >
              {detailsMessage.text}
            </p>
          )}

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="full_name" className={styles.label}>
                Full Name <span className={styles.required}>*</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className={styles.input}
                defaultValue={employee.full_name}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="title" className={styles.label}>
                Title <span className={styles.required}>*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className={styles.input}
                defaultValue={employee.title}
              />
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="department" className={styles.label}>
                Department
              </label>
              <input
                id="department"
                name="department"
                type="text"
                className={styles.input}
                defaultValue={employee.department ?? ''}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="salary_rate" className={styles.label}>
                Salary Rate ($/hr) <span className={styles.required}>*</span>
              </label>
              <input
                id="salary_rate"
                name="salary_rate"
                type="number"
                step="0.01"
                min="0"
                required
                className={styles.inputMono}
                defaultValue={employee.salary_rate}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="started_at" className={styles.label}>
              Start Date
            </label>
            <input
              id="started_at"
              name="started_at"
              type="date"
              className={styles.input}
              defaultValue={employee.started_at.split('T')[0]}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={detailsPending}
            >
              {detailsPending ? 'Saving…' : 'Save Details'}
            </button>
          </div>
        </form>
      </section>

      <div className={styles.divider} />

      {/* Section 2: Billing Rates */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Billing Rates</h2>
        <table className={styles.ratesTable}>
          <thead>
            <tr>
              <th className={styles.ratesTh}>Project</th>
              <th className={styles.ratesTh}>Rate ($/hr)</th>
              <th className={styles.ratesTh}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {billingRates.map((rate) => {
              const isEditing = rate.id in editingRates
              return (
                <tr key={rate.id} className={styles.ratesTr}>
                  <td className={styles.ratesTd}>{rate.project.name}</td>
                  <td className={styles.ratesTd}>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className={styles.inlineRateInput}
                        value={editingRates[rate.id]}
                        onChange={(e) =>
                          setEditingRates((prev) => ({
                            ...prev,
                            [rate.id]: e.target.value,
                          }))
                        }
                        autoFocus
                      />
                    ) : (
                      <span className={styles.rateValue}>
                        ${rate.billable_rate.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className={styles.ratesTdActions}>
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className={styles.rateActionBtn}
                          onClick={() =>
                            handleSaveEdit(rate.id, rate.project_id)
                          }
                          disabled={ratePending}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className={styles.rateActionMuted}
                          onClick={() =>
                            setEditingRates((prev) => {
                              const next = { ...prev }
                              delete next[rate.id]
                              return next
                            })
                          }
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={styles.rateActionBtn}
                          onClick={() =>
                            setEditingRates((prev) => ({
                              ...prev,
                              [rate.id]: String(rate.billable_rate),
                            }))
                          }
                          disabled={ratePending}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={styles.rateDeleteBtn}
                          onClick={() => handleDeleteRate(rate.id)}
                          disabled={ratePending}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}

            {/* Add new rate row */}
            <tr className={styles.ratesTr}>
              <td className={styles.ratesTd}>
                <select
                  className={styles.addSelect}
                  value={addProjectId}
                  onChange={(e) => setAddProjectId(e.target.value)}
                  disabled={ratePending}
                >
                  <option value="">Select project…</option>
                  {availableProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className={styles.ratesTd}>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={styles.inlineRateInput}
                  value={addRate}
                  onChange={(e) => setAddRate(e.target.value)}
                  disabled={ratePending}
                />
              </td>
              <td className={styles.ratesTdActions}>
                <form onSubmit={handleAddRate}>
                  <button
                    type="submit"
                    className={styles.rateActionBtn}
                    disabled={ratePending}
                  >
                    Add
                  </button>
                </form>
              </td>
            </tr>
          </tbody>
        </table>
        {addError && <p className={styles.errorMsg}>{addError}</p>}
      </section>
    </div>
  )
}
