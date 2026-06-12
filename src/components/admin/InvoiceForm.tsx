'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './InvoiceForm.module.scss'

type Employee = { id: string; full_name: string }

type Props = {
  employees: Employee[]
  currentEmployeeId?: string
  currentStart?: string
  currentEnd?: string
}

export default function InvoiceForm({
  employees,
  currentEmployeeId,
  currentStart,
  currentEnd,
}: Props) {
  const router = useRouter()
  const [employeeId, setEmployeeId] = useState(currentEmployeeId ?? '')
  const [start, setStart] = useState(currentStart ?? '')
  const [end, setEnd] = useState(currentEnd ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams({ employeeId, start, end })
    router.push(`/portal/admin/invoices?${params}`)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="invoice-employee" className={styles.label}>
          Employee
        </label>
        <select
          id="invoice-employee"
          className={styles.select}
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          required
        >
          <option value="">Select employee…</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="invoice-start" className={styles.label}>
          Start Date
        </label>
        <input
          id="invoice-start"
          type="date"
          className={styles.dateInput}
          value={start}
          onChange={(e) => setStart(e.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="invoice-end" className={styles.label}>
          End Date
        </label>
        <input
          id="invoice-end"
          type="date"
          className={styles.dateInput}
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          required
        />
      </div>

      <div className={styles.submitWrapper}>
        <button type="submit" className={styles.submitBtn}>
          Preview Invoices
        </button>
      </div>
    </form>
  )
}
