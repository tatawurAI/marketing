'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateInvoicePDF } from '@/lib/pdf/generate-invoice'
import type { InvoiceData } from '@/lib/pdf/types'

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
// Payroll actions
// ---------------------------------------------------------------------------

export async function createPayrollRun(
  formData: FormData,
): Promise<{ id?: string; error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  const employee_id  = formData.get('employee_id') as string
  const period_start = formData.get('period_start') as string
  const period_end   = formData.get('period_end') as string

  const { data: adminEmployee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!adminEmployee) return { error: 'Employee record not found for this user' }

  if (period_start > period_end) return { error: 'Period start must be before or equal to period end' }

  // Fetch salary_rate snapshot and all time entries in parallel
  const [
    { data: targetEmployee, error: employeeError },
    { data: entries,        error: entriesError },
  ] = await Promise.all([
    supabase
      .from('employees')
      .select('salary_rate')
      .eq('id', employee_id)
      .single(),
    supabase
      .from('time_entries')
      .select('hours')
      .eq('employee_id', employee_id)
      .gte('work_date', period_start)
      .lte('work_date', period_end),
  ])

  if (employeeError || !targetEmployee) return { error: employeeError?.message ?? 'Employee not found' }
  if (entriesError) return { error: entriesError.message }

  const total_hours  = (entries ?? []).reduce((sum, e) => sum + (e.hours as number), 0)
  const hourly_rate  = targetEmployee.salary_rate as number
  const total_amount = total_hours * hourly_rate

  const { data: inserted, error } = await supabase
    .from('payroll_runs')
    .insert({
      employee_id,
      period_start,
      period_end,
      total_hours,
      hourly_rate,
      total_amount,
      status:     'draft',
      created_by: adminEmployee.id,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { error: 'A pay run for this employee and period already exists' }
    }
    return { error: error.message }
  }
  revalidatePath('/portal/admin/payroll')
  return { id: (inserted as { id: string }).id }
}

export async function submitPayrollRun(
  runId: string,
): Promise<{ signedUrl?: string; error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  // Fetch payroll run with employee name
  const { data: run, error: runError } = await supabase
    .from('payroll_runs')
    .select('*, employee:employees!employee_id(full_name)')
    .eq('id', runId)
    .single()

  if (runError || !run) return { error: runError?.message ?? 'Payroll run not found' }
  if ((run.status as string) !== 'draft') return { error: 'Only draft pay runs can be submitted' }

  const employee = run.employee as { full_name: string } | null
  if (!employee) return { error: 'Employee not found for this payroll run' }

  // Fetch all time entries for the employee in this period (all projects)
  const { data: entries, error: entriesError } = await supabase
    .from('time_entries')
    .select('work_date, hours, notes')
    .eq('employee_id', run.employee_id as string)
    .gte('work_date',  run.period_start as string)
    .lte('work_date',  run.period_end   as string)
    .order('work_date', { ascending: true })

  if (entriesError) return { error: entriesError.message }

  const invoiceData: InvoiceData = {
    employeeName: employee.full_name,
    projectName:  'All Projects',
    startDate:    run.period_start as string,
    endDate:      run.period_end   as string,
    entries: (entries ?? []).map((e) => ({
      work_date: e.work_date as string,
      hours:     e.hours     as number,
      notes:     e.notes     as string | null,
    })),
    billingRate: run.hourly_rate as number,
    generatedAt: new Date().toISOString(),
  }

  let buffer: Buffer
  try {
    buffer = await generateInvoicePDF(invoiceData)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'PDF generation failed' }
  }

  // Two-level path required by storage RLS: storage.foldername(name)[1] = my_employee_id()
  const storagePath = `${run.employee_id as string}/${runId}.pdf`

  const { error: uploadError } = await supabase.storage
    .from('payroll-pdfs')
    .upload(storagePath, buffer, { contentType: 'application/pdf', upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { error: updateError } = await supabase
    .from('payroll_runs')
    .update({
      status:       'submitted',
      pdf_path:     storagePath,
      submitted_at: new Date().toISOString(),
    })
    .eq('id', runId)

  if (updateError) return { error: updateError.message }

  const { data: signedData, error: signedError } = await supabase.storage
    .from('payroll-pdfs')
    .createSignedUrl(storagePath, 3600)

  if (signedError) return { error: signedError.message }

  revalidatePath('/portal/admin/payroll')
  return { signedUrl: signedData.signedUrl }
}

export async function markPayrollPaid(runId: string): Promise<{ error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  const { data: adminEmployee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!adminEmployee) return { error: 'Employee record not found for this user' }

  const { error } = await supabase
    .from('payroll_runs')
    .update({
      status:  'paid',
      paid_at: new Date().toISOString(),
      paid_by: adminEmployee.id,
    })
    .eq('id', runId)
    .eq('status', 'submitted')

  if (error) return { error: error.message }
  revalidatePath('/portal/admin/payroll')
  return {}
}

export async function deletePayrollDraft(runId: string): Promise<{ error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  const { error } = await supabase
    .from('payroll_runs')
    .delete()
    .eq('id', runId)
    .eq('status', 'draft')

  if (error) return { error: error.message }
  revalidatePath('/portal/admin/payroll')
  return {}
}

export async function getPayrollSignedUrl(
  pdfPath: string,
): Promise<{ url?: string; error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  // pdfPath stored as '{employee_id}/{run_id}.pdf' — use as-is (full object path within bucket)
  const { data, error } = await supabase.storage
    .from('payroll-pdfs')
    .createSignedUrl(pdfPath, 3600)

  if (error) return { error: error.message }
  return { url: data.signedUrl }
}
