'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { submitExpenseClaim } from '@/app/portal/expenses/actions'
import styles from './ExpenseSubmitForm.module.scss'

type Props = {
  employeeId: string
}

export default function ExpenseSubmitForm({ employeeId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const isLoading = isPending || isUploading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const file = fileRef.current?.files?.[0] ?? null

    let receiptPath: string | null = null

    if (file) {
      setIsUploading(true)
      try {
        const supabase = createClient()
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const storagePath = `${employeeId}/${filename}`
        const { error: uploadError } = await supabase.storage
          .from('expense-receipts')
          .upload(storagePath, file, { upsert: false })

        if (uploadError) {
          setError(uploadError.message)
          setIsUploading(false)
          return
        }
        receiptPath = storagePath
      } finally {
        setIsUploading(false)
      }
    }

    startTransition(async () => {
      const fd = new FormData()
      fd.set('expense_date', date)
      fd.set('amount', amount)
      fd.set('description', description)
      if (receiptPath) fd.set('receipt_path', receiptPath)

      const result = await submitExpenseClaim(fd)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setDate('')
        setAmount('')
        setDescription('')
        if (fileRef.current) fileRef.current.value = ''
        router.refresh()
      }
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.formHeading}>Submit Expense</h2>

      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor="expense-date" className={styles.label}>
            Date
          </label>
          <input
            id="expense-date"
            type="date"
            className={styles.dateInput}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="expense-amount" className={styles.label}>
            Amount ($)
          </label>
          <input
            id="expense-amount"
            type="number"
            step="0.01"
            min="0.01"
            className={styles.numberInput}
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label htmlFor="expense-description" className={styles.label}>
            Description
          </label>
          <textarea
            id="expense-description"
            className={styles.textarea}
            placeholder="What was this expense for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
            disabled={isLoading}
          />
        </div>

        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label htmlFor="expense-receipt" className={styles.label}>
            Receipt (optional)
          </label>
          <input
            id="expense-receipt"
            type="file"
            accept="image/*,.pdf"
            className={styles.fileInput}
            ref={fileRef}
            disabled={isLoading}
          />
          <p className={styles.fileHint}>JPG, PNG, or PDF — max 5MB</p>
        </div>
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}
      {success && <p className={styles.successMsg}>Expense submitted successfully.</p>}

      <div className={styles.submitRow}>
        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isUploading ? 'Uploading receipt…' : isPending ? 'Submitting…' : 'Submit Expense'}
        </button>
      </div>
    </form>
  )
}
