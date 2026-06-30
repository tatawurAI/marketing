'use server'
import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/supabase/admin'

export async function approveExpense(claimId: string): Promise<{ error?: string }> {
  const { supabase, adminEmployee, error: authError } = await getAdminUser()
  if (!adminEmployee) return { error: authError ?? 'Unauthorized' }

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
  revalidatePath('/portal/admin', 'layout')
  return {}
}

export async function rejectExpense(
  claimId: string,
  comment: string,
): Promise<{ error?: string }> {
  const { supabase, adminEmployee, error: authError } = await getAdminUser()
  if (!adminEmployee) return { error: authError ?? 'Unauthorized' }

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
  revalidatePath('/portal/admin', 'layout')
  return {}
}

export async function markExpenseReimbursed(claimId: string): Promise<{ error?: string }> {
  const { supabase, adminEmployee, error: authError } = await getAdminUser()
  if (!adminEmployee) return { error: authError ?? 'Unauthorized' }

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
  revalidatePath('/portal/admin', 'layout')
  revalidatePath('/portal/expenses')
  return {}
}

export async function getExpenseReceiptSignedUrl(
  receiptPath: string,
): Promise<{ url?: string; error?: string }> {
  const { supabase, adminEmployee, error: authError } = await getAdminUser()
  if (!adminEmployee) return { error: authError ?? 'Unauthorized' }

  const { data, error } = await supabase.storage
    .from('expense-receipts')
    .createSignedUrl(receiptPath, 3600)

  if (error) return { error: error.message }
  return { url: data.signedUrl }
}
