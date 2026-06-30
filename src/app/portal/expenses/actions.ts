'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ExpenseClaim } from '@/lib/types'

// ---------------------------------------------------------------------------
// Expense actions (employee-facing)
// ---------------------------------------------------------------------------

export async function getMyExpenseClaims(): Promise<{ claims: ExpenseClaim[]; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { claims: [], error: 'Unauthorized' }

  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (empError || !employee) return { claims: [], error: empError?.message ?? 'Employee not found' }

  const { data, error } = await supabase
    .from('expense_claims')
    .select('*')
    .eq('employee_id', employee.id)
    .order('submitted_at', { ascending: false })

  if (error) return { claims: [], error: error.message }
  return { claims: (data ?? []) as ExpenseClaim[] }
}

export async function submitExpenseClaim(
  formData: FormData,
): Promise<{ id?: string; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (empError || !employee) return { error: empError?.message ?? 'Employee not found' }

  const expense_date = (formData.get('expense_date') as string)?.trim()
  const amountRaw    = formData.get('amount') as string
  const description  = (formData.get('description') as string)?.trim()
  const receipt_path = (formData.get('receipt_path') as string) || null

  // Reject paths that don't start with the authenticated employee's own prefix
  if (receipt_path && !receipt_path.startsWith(`${employee.id}/`)) {
    return { error: 'Invalid receipt path' }
  }

  // Validate inputs
  const amount = parseFloat(amountRaw)
  if (isNaN(amount) || amount <= 0) return { error: 'Amount must be a positive number' }
  if (!description) return { error: 'Description is required' }
  if (!expense_date || !/^\d{4}-\d{2}-\d{2}$/.test(expense_date)) {
    return { error: 'Invalid expense date — use YYYY-MM-DD' }
  }

  const { data: inserted, error } = await supabase
    .from('expense_claims')
    .insert({
      employee_id: employee.id,
      expense_date,
      amount,
      description,
      receipt_path,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/portal/expenses')
  return { id: (inserted as { id: string }).id }
}

export async function getMyExpenseReceiptSignedUrl(
  receiptPath: string,
): Promise<{ url?: string; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (empError || !employee) return { error: empError?.message ?? 'Employee not found' }

  // Security check: verify this receipt belongs to the current user's expense claim
  const { data: claim, error: claimError } = await supabase
    .from('expense_claims')
    .select('employee_id')
    .eq('receipt_path', receiptPath)
    .single()

  if (claimError || !claim) return { error: 'Receipt not found' }
  if ((claim.employee_id as string) !== employee.id) return { error: 'Forbidden' }

  const { data, error } = await supabase.storage
    .from('expense-receipts')
    .createSignedUrl(receiptPath, 3600)

  if (error) return { error: error.message }
  return { url: data.signedUrl }
}
