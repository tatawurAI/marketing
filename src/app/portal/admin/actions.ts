'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

async function getAdminUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, error: 'Unauthorized' as const }
  // DB check is authoritative — JWT app_metadata can lag after role changes
  const { data: employee } = await supabase
    .from('employees')
    .select('role')
    .eq('user_id', user.id)
    .single()
  if (employee?.role !== 'admin') return { supabase, user: null, error: 'Forbidden' as const }
  return { supabase, user, error: null }
}

// ---------------------------------------------------------------------------
// Project actions
// ---------------------------------------------------------------------------

export async function createProject(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Project name is required' }

  const { error } = await supabase.from('projects').insert({
    name,
    client_name: (formData.get('client_name') as string) || null,
    description: (formData.get('description') as string) || null,
    is_active:   formData.get('is_active') === 'true',
  })

  if (error) return { error: error.message }
  revalidatePath('/portal/admin/projects')
  return {}
}

export async function updateProject(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  const id = formData.get('id') as string
  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Project name is required' }

  const { error } = await supabase
    .from('projects')
    .update({
      name,
      client_name: (formData.get('client_name') as string) || null,
      description: (formData.get('description') as string) || null,
      is_active:   formData.get('is_active') === 'true',
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/portal/admin/projects')
  return {}
}

export async function toggleProjectActive(
  projectId: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  const { error } = await supabase
    .from('projects')
    .update({ is_active: isActive })
    .eq('id', projectId)

  if (error) return { error: error.message }
  revalidatePath('/portal/admin/projects')
  return {}
}

// ---------------------------------------------------------------------------
// Employee actions
// ---------------------------------------------------------------------------

export async function updateEmployee(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  const id = formData.get('id') as string

  const salary_rate = parseFloat(formData.get('salary_rate') as string)
  if (isNaN(salary_rate) || salary_rate < 0) return { error: 'Invalid salary rate' }

  const { error } = await supabase
    .from('employees')
    .update({
      full_name:   formData.get('full_name') as string,
      title:       formData.get('title') as string,
      department:  (formData.get('department') as string) || null,
      salary_rate,
      started_at:  formData.get('started_at') as string,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/portal/admin/employees')
  revalidatePath(`/portal/admin/employees/${id}`)
  return {}
}

export async function toggleEmployeeActive(
  employeeId: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  const { error } = await supabase
    .from('employees')
    .update({ is_active: isActive })
    .eq('id', employeeId)

  if (error) return { error: error.message }
  revalidatePath('/portal/admin/employees')
  return {}
}

// ---------------------------------------------------------------------------
// Billing rate actions
// ---------------------------------------------------------------------------

export async function upsertBillingRate(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  const employee_id   = formData.get('employee_id') as string
  const project_id    = formData.get('project_id') as string
  const billable_rate = parseFloat(formData.get('billable_rate') as string)
  if (isNaN(billable_rate) || billable_rate < 0) return { error: 'Invalid billing rate' }

  const { error } = await supabase
    .from('employee_billing_rates')
    .upsert({ employee_id, project_id, billable_rate }, { onConflict: 'employee_id,project_id' })

  if (error) return { error: error.message }
  revalidatePath(`/portal/admin/employees/${employee_id}`)
  return {}
}

export async function deleteBillingRate(
  rateId: string,
  employeeId: string,
): Promise<{ error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  const { error } = await supabase
    .from('employee_billing_rates')
    .delete()
    .eq('id', rateId)

  if (error) return { error: error.message }
  revalidatePath(`/portal/admin/employees/${employeeId}`)
  return {}
}

// ---------------------------------------------------------------------------
// Week lock actions
// ---------------------------------------------------------------------------

export async function lockWeek(weekStart: string): Promise<{ error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  // locked_by is FK to employees.id (not auth.users.id)
  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!employee) return { error: 'Employee record not found for this user' }

  const { error } = await supabase
    .from('locked_weeks')
    .insert({ week_start: weekStart, locked_by: employee.id })

  if (error) {
    if (error.code === '23505') return { error: 'This week is already locked' }
    return { error: error.message }
  }
  revalidatePath('/portal/admin/weeks')
  revalidatePath('/portal/timesheets')
  return {}
}

export async function unlockWeek(weekStart: string): Promise<{ error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  const { error } = await supabase
    .from('locked_weeks')
    .delete()
    .eq('week_start', weekStart)

  if (error) return { error: error.message }
  revalidatePath('/portal/admin/weeks')
  revalidatePath('/portal/timesheets')
  return {}
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

export async function exportTimesheetsCSV(filters: {
  week?: string
  employeeId?: string
  projectId?: string
}): Promise<{ csv: string; filename: string; error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { csv: '', filename: '', error: authError }

  let query = supabase
    .from('time_entries')
    .select('*, employee:employees(full_name), project:projects(name)')
    .order('work_date', { ascending: true })

  if (filters.week) {
    const weekEndDate = new Date(filters.week + 'T00:00:00Z')
    weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6)
    const weekEnd = weekEndDate.toISOString().split('T')[0]
    query = query.gte('work_date', filters.week).lte('work_date', weekEnd)
  }
  if (filters.employeeId) query = query.eq('employee_id', filters.employeeId)
  if (filters.projectId)  query = query.eq('project_id', filters.projectId)

  const { data, error } = await query
  if (error) return { csv: '', filename: '', error: error.message }

  const rows = (data ?? []) as Array<{
    work_date: string
    hours: number
    notes: string | null
    employee: { full_name: string } | null
    project:  { name: string } | null
  }>

  const escape = (v: string | number | null | undefined) => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }

  const header = 'Employee,Project,Date,Hours,Notes'
  const lines = rows.map(r =>
    [
      escape(r.employee?.full_name),
      escape(r.project?.name),
      escape(r.work_date),
      escape(r.hours),
      escape(r.notes),
    ].join(','),
  )

  const csv = [header, ...lines].join('\n')
  const filename = `timesheets-${filters.week ?? 'all'}.csv`
  return { csv, filename }
}

// ---------------------------------------------------------------------------
// Timesheet approval actions
// ---------------------------------------------------------------------------

export async function approveTimesheet(employeeId: string, weekStart: string): Promise<{ error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  const { data: adminEmployee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!adminEmployee) return { error: 'Employee record not found for this user' }

  const { data, error } = await supabase
    .from('timesheet_approvals')
    .update({
      status: 'approved',
      reviewed_by: adminEmployee.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('employee_id', employeeId)
    .eq('week_start', weekStart)
    .select('id')

  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Approval record not found — employee may not have submitted yet' }
  revalidatePath('/portal/admin/approvals')
  return {}
}

export async function denyTimesheet(employeeId: string, weekStart: string, comment: string): Promise<{ error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  const { data: adminEmployee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!adminEmployee) return { error: 'Employee record not found for this user' }

  const { data, error } = await supabase
    .from('timesheet_approvals')
    .update({
      status: 'denied',
      review_comment: comment,
      reviewed_by: adminEmployee.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('employee_id', employeeId)
    .eq('week_start', weekStart)
    .select('id')

  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Approval record not found — employee may not have submitted yet' }
  revalidatePath('/portal/admin/approvals')
  return {}
}

export async function reopenTimesheet(employeeId: string, weekStart: string): Promise<{ error?: string }> {
  const { supabase, user, error: authError } = await getAdminUser()
  if (!user) return { error: authError }

  const { data, error } = await supabase
    .from('timesheet_approvals')
    .update({
      status: 'pending',
      reviewed_by: null,
      review_comment: null,
      reviewed_at: null,
    })
    .eq('employee_id', employeeId)
    .eq('week_start', weekStart)
    .select('id')

  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Approval record not found' }
  revalidatePath('/portal/admin/approvals')
  return {}
}
