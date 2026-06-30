'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

async function getAdminUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, error: 'Unauthorized' as const }
  const { data: employee } = await supabase
    .from('employees')
    .select('role')
    .eq('user_id', user.id)
    .single()
  if (employee?.role !== 'admin') return { supabase, user: null, error: 'Forbidden' as const }
  return { supabase, user, error: null }
}

// ---------------------------------------------------------------------------
// Expense actions (admin)
// ---------------------------------------------------------------------------

export async function approveExpense(claimId: string): Promise<{ error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  const { data: adminEmployee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!adminEmployee) return { error: 'Employee record not found for this user' }

  const { error } = await supabase
    .from('expense_claims')
    .update({
      status:      'approved',
      reviewed_by: adminEmployee.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', claimId)
    .eq('status', 'pending')

  if (error) return { error: error.message }
  revalidatePath('/portal/admin/expenses')
  return {}
}

export async function rejectExpense(
  claimId: string,
  comment: string,
): Promise<{ error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  const { data: adminEmployee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!adminEmployee) return { error: 'Employee record not found for this user' }

  const { error } = await supabase
    .from('expense_claims')
    .update({
      status:         'rejected',
      review_comment: comment,
      reviewed_by:    adminEmployee.id,
      reviewed_at:    new Date().toISOString(),
    })
    .eq('id', claimId)
    .eq('status', 'pending')

  if (error) return { error: error.message }
  revalidatePath('/portal/admin/expenses')
  return {}
}

export async function markExpenseReimbursed(claimId: string): Promise<{ error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  const { data: adminEmployee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!adminEmployee) return { error: 'Employee record not found for this user' }

  const { error } = await supabase
    .from('expense_claims')
    .update({
      status:        'reimbursed',
      reimbursed_at: new Date().toISOString(),
      reimbursed_by: adminEmployee.id,
    })
    .eq('id', claimId)
    .eq('status', 'approved')

  if (error) return { error: error.message }
  revalidatePath('/portal/admin/expenses')
  revalidatePath('/portal/expenses')
  return {}
}

export async function getExpenseReceiptSignedUrl(
  receiptPath: string,
): Promise<{ url?: string; error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  // receiptPath is the full path stored in DB (employee_id/claim_id/filename) — use as-is
  const { data, error } = await supabase.storage
    .from('expense-receipts')
    .createSignedUrl(receiptPath, 3600)

  if (error) return { error: error.message }
  return { url: data.signedUrl }
}
