'use server'
import { revalidatePath } from 'next/cache'
import { generateInvoicePDF } from '@/lib/pdf/generate-invoice'
import type { InvoiceData } from '@/lib/pdf/types'
import { getAdminUser } from '@/lib/supabase/admin'

export async function createInvoiceDraft(
  formData: FormData,
): Promise<{ id?: string; error?: string }> {
  const { supabase, adminEmployee, error: authError } = await getAdminUser()
  if (!adminEmployee) return { error: authError ?? 'Unauthorized' }

  const employee_id  = formData.get('employee_id') as string
  const project_id   = formData.get('project_id') as string
  const period_start = formData.get('period_start') as string
  const period_end   = formData.get('period_end') as string

  if (period_start > period_end) return { error: 'Period start must be before or equal to period end' }

  const [
    { data: entries, error: entriesError },
    { data: rateRow,  error: rateError },
  ] = await Promise.all([
    supabase
      .from('time_entries')
      .select('hours')
      .eq('employee_id', employee_id)
      .eq('project_id', project_id)
      .gte('work_date', period_start)
      .lte('work_date', period_end),
    supabase
      .from('employee_billing_rates')
      .select('billable_rate')
      .eq('employee_id', employee_id)
      .eq('project_id', project_id)
      .maybeSingle(),
  ])

  if (entriesError) return { error: entriesError.message }
  if (rateError)    return { error: rateError.message }

  const total_hours  = (entries ?? []).reduce((sum, e) => sum + Number(e.hours), 0)
  const billing_rate = rateRow?.billable_rate != null ? Number(rateRow.billable_rate) : null
  const total_amount = billing_rate != null ? total_hours * billing_rate : null

  const { data: inserted, error } = await supabase
    .from('invoices')
    .insert({
      employee_id,
      project_id,
      period_start,
      period_end,
      total_hours,
      billing_rate,
      total_amount,
      status:     'draft',
      created_by: adminEmployee.id,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { error: 'An invoice draft for this employee, project, and period already exists' }
    }
    return { error: error.message }
  }
  revalidatePath('/portal/admin/invoices')
  return { id: (inserted as { id: string }).id }
}

export async function submitInvoice(
  invoiceId: string,
): Promise<{ signedUrl?: string; error?: string }> {
  const { supabase, adminEmployee, error: authError } = await getAdminUser()
  if (!adminEmployee) return { error: authError ?? 'Unauthorized' }

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*, employee:employees!employee_id(full_name), project:projects!project_id(name)')
    .eq('id', invoiceId)
    .single()

  if (invoiceError || !invoice) return { error: invoiceError?.message ?? 'Invoice not found' }
  if ((invoice.status as string) !== 'draft') return { error: 'Only draft invoices can be submitted' }

  const employee = invoice.employee as { full_name: string } | null
  const project  = invoice.project  as { name: string } | null

  if (!employee || !project) return { error: 'Invoice employee or project not found' }

  const { data: entries, error: entriesError } = await supabase
    .from('time_entries')
    .select('work_date, hours, notes')
    .eq('employee_id', invoice.employee_id as string)
    .eq('project_id',  invoice.project_id  as string)
    .gte('work_date',  invoice.period_start as string)
    .lte('work_date',  invoice.period_end   as string)
    .order('work_date', { ascending: true })

  if (entriesError) return { error: entriesError.message }

  const invoiceData: InvoiceData = {
    employeeName: employee.full_name,
    projectName:  project.name,
    startDate:    invoice.period_start as string,
    endDate:      invoice.period_end   as string,
    entries: (entries ?? []).map((e) => ({
      work_date: e.work_date as string,
      hours:     Number(e.hours),
      notes:     e.notes as string | null,
    })),
    billingRate: invoice.billing_rate != null ? Number(invoice.billing_rate) : null,
    generatedAt: new Date().toISOString(),
  }

  let buffer: Buffer
  try {
    buffer = await generateInvoicePDF(invoiceData)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'PDF generation failed' }
  }

  const storagePath = `${invoiceId}.pdf`

  const { error: uploadError } = await supabase.storage
    .from('invoice-pdfs')
    .upload(storagePath, buffer, { contentType: 'application/pdf', upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { error: updateError } = await supabase
    .from('invoices')
    .update({
      status:       'submitted',
      pdf_path:     `invoice-pdfs/${invoiceId}.pdf`,
      submitted_at: new Date().toISOString(),
    })
    .eq('id', invoiceId)

  if (updateError) {
    // Best-effort cleanup — PDF is in storage but DB update failed; remove the orphan
    await supabase.storage.from('invoice-pdfs').remove([storagePath])
    return { error: updateError.message }
  }

  const { data: signedData, error: signedError } = await supabase.storage
    .from('invoice-pdfs')
    .createSignedUrl(storagePath, 3600)

  if (signedError) return { error: signedError.message }

  revalidatePath('/portal/admin/invoices')
  return { signedUrl: signedData.signedUrl }
}

export async function markInvoicePaid(invoiceId: string): Promise<{ error?: string }> {
  const { supabase, adminEmployee, error: authError } = await getAdminUser()
  if (!adminEmployee) return { error: authError ?? 'Unauthorized' }

  const { error } = await supabase
    .from('invoices')
    .update({
      status:  'paid',
      paid_at: new Date().toISOString(),
      paid_by: adminEmployee.id,
    })
    .eq('id', invoiceId)
    .eq('status', 'submitted')

  if (error) return { error: error.message }
  revalidatePath('/portal/admin/invoices')
  return {}
}

export async function deleteInvoiceDraft(invoiceId: string): Promise<{ error?: string }> {
  const { supabase, adminEmployee, error: authError } = await getAdminUser()
  if (!adminEmployee) return { error: authError ?? 'Unauthorized' }

  const { data: deleted, error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId)
    .eq('status', 'draft')
    .select('pdf_path')
    .maybeSingle()

  if (error) return { error: error.message }

  // Clean up any orphaned PDF (possible if a prior submit partially failed)
  if (deleted?.pdf_path) {
    await supabase.storage.from('invoice-pdfs').remove([`${invoiceId}.pdf`])
  }

  revalidatePath('/portal/admin/invoices')
  return {}
}

export async function getInvoiceSignedUrl(
  pdfPath: string,
): Promise<{ url?: string; error?: string }> {
  const { supabase, adminEmployee, error: authError } = await getAdminUser()
  if (!adminEmployee) return { error: authError ?? 'Unauthorized' }

  // pdfPath stored as 'invoice-pdfs/{id}.pdf' — extract just the object key
  const filename = pdfPath.split('/').pop() ?? pdfPath

  const { data, error } = await supabase.storage
    .from('invoice-pdfs')
    .createSignedUrl(filename, 3600)

  if (error) return { error: error.message }
  return { url: data.signedUrl }
}
