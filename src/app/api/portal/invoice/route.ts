import { createClient } from '@/lib/supabase/server'
import { generateInvoicePDF } from '@/lib/pdf/generate-invoice'
import type { InvoiceData } from '@/lib/pdf/types'

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)

  const employeeId = searchParams.get('employeeId')
  const projectId  = searchParams.get('projectId')
  const startDate  = searchParams.get('startDate')
  const endDate    = searchParams.get('endDate')

  if (!employeeId || !projectId || !startDate || !endDate) {
    return new Response('Missing required parameters: employeeId, projectId, startDate, endDate', {
      status: 400,
    })
  }

  const dateRe = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRe.test(startDate) || !dateRe.test(endDate)) {
    return new Response('Invalid date format — use YYYY-MM-DD', { status: 400 })
  }

  const supabase = createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Admin check
  const { data: currentEmployee, error: roleError } = await supabase
    .from('employees')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleError || !currentEmployee) {
    return new Response('Forbidden', { status: 403 })
  }
  if (currentEmployee.role !== 'admin') {
    return new Response('Forbidden', { status: 403 })
  }

  // Fetch employee and project in parallel
  const [
    { data: employee, error: employeeError },
    { data: project, error: projectError },
  ] = await Promise.all([
    supabase.from('employees').select('full_name').eq('id', employeeId).single(),
    supabase.from('projects').select('name').eq('id', projectId).single(),
  ])

  if (employeeError || !employee) {
    return new Response('Employee not found', { status: 404 })
  }
  if (projectError || !project) {
    return new Response('Project not found', { status: 404 })
  }

  // Fetch time entries and billing rate in parallel
  const [
    { data: entries, error: entriesError },
    { data: rateRow, error: rateError },
  ] = await Promise.all([
    supabase
      .from('time_entries')
      .select('work_date, hours, notes')
      .eq('employee_id', employeeId)
      .eq('project_id', projectId)
      .gte('work_date', startDate)
      .lte('work_date', endDate)
      .order('work_date', { ascending: true }),
    supabase
      .from('employee_billing_rates')
      .select('billable_rate')
      .eq('employee_id', employeeId)
      .eq('project_id', projectId)
      .maybeSingle(),
  ])

  if (entriesError) {
    console.error('[invoice] time_entries fetch error:', entriesError)
    return new Response('Failed to fetch time entries', { status: 500 })
  }
  if (rateError) {
    console.error('[invoice] billing_rate fetch error:', rateError)
    return new Response('Failed to fetch billing rate', { status: 500 })
  }

  const invoiceData: InvoiceData = {
    employeeName: employee.full_name,
    projectName:  project.name,
    startDate,
    endDate,
    entries: (entries ?? []).map((e) => ({
      work_date: e.work_date,
      hours:     e.hours,
      notes:     e.notes,
    })),
    billingRate: rateRow?.billable_rate ?? null,
    generatedAt: new Date().toISOString(),
  }

  let buffer: Buffer
  try {
    buffer = await generateInvoicePDF(invoiceData)
  } catch (err) {
    console.error('[invoice] PDF generation error:', err)
    return new Response('Failed to generate PDF', { status: 500 })
  }

  // Build filename: tatawur-invoice-{employee-slug}-{project-slug}-{startDate}.pdf
  const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const empSlug  = slugify(employee.full_name) || 'employee'
  const projSlug = slugify(project.name) || 'project'
  const filename = `tatawur-invoice-${empSlug}-${projSlug}-${startDate}.pdf`

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
