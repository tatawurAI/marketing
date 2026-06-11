'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type Client = ReturnType<typeof createClient>

async function getEmployee(supabase: Client, userId: string) {
  const { data } = await supabase
    .from('employees').select('id').eq('user_id', userId).single()
  return data
}

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  const dow = d.getUTCDay()
  d.setUTCDate(d.getUTCDate() + (dow === 0 ? -6 : 1 - dow))
  return d.toISOString().split('T')[0]!
}

async function isWeekLocked(supabase: Client, workDate: string): Promise<boolean> {
  const weekStart = getWeekStart(workDate)
  const { data, error } = await supabase
    .from('locked_weeks').select('week_start').eq('week_start', weekStart).maybeSingle()
  if (error) return true // fail-safe: treat query failure as locked
  return data != null
}

// If approved → returns an error (block the edit).
// If pending or denied → deletes the approval record so the week reverts to not-submitted.
async function resetApprovalIfPending(
  supabase: Client,
  employeeId: string,
  workDate: string,
): Promise<{ error?: string }> {
  const weekStart = getWeekStart(workDate)
  const { data: approval } = await supabase
    .from('timesheet_approvals')
    .select('status')
    .eq('employee_id', employeeId)
    .eq('week_start', weekStart)
    .maybeSingle()

  if (!approval) return {}
  if (approval.status === 'approved') {
    return { error: 'This timesheet has been approved and cannot be edited.' }
  }
  // pending or denied — reset back to not-submitted.
  // Filter on status in the delete itself to guard against a concurrent approval
  // slipping in between the select and delete above.
  const { error } = await supabase
    .from('timesheet_approvals')
    .delete()
    .eq('employee_id', employeeId)
    .eq('week_start', weekStart)
    .in('status', ['pending', 'denied'])
  if (error) return { error: error.message }
  return {}
}

export async function createTimeEntry(formData: FormData): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const employee = await getEmployee(supabase, user.id)
  if (!employee) return { error: 'Employee not found' }

  const projectId = formData.get('project_id') as string
  if (!projectId) return { error: 'Project is required' }

  const workDate = formData.get('work_date') as string
  if (!/^\d{4}-\d{2}-\d{2}$/.test(workDate)) return { error: 'Invalid date' }

  const hours = parseFloat(formData.get('hours') as string)
  if (isNaN(hours) || hours < 0.5 || hours > 24) return { error: 'Hours must be between 0.5 and 24' }

  if (await isWeekLocked(supabase, workDate)) return { error: 'This week is locked and cannot be edited.' }

  const approvalReset = await resetApprovalIfPending(supabase, employee.id, workDate)
  if (approvalReset.error) return approvalReset

  const { error } = await supabase.from('time_entries').insert({
    employee_id: employee.id,
    project_id: projectId,
    work_date: workDate,
    hours,
    notes: (formData.get('notes') as string) || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/portal/timesheets')
  return {}
}

export async function updateTimeEntry(formData: FormData): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const employee = await getEmployee(supabase, user.id)
  if (!employee) return { error: 'Employee not found' }

  const id = formData.get('id') as string
  if (!id) return { error: 'Entry ID is required' }

  const workDate = formData.get('work_date') as string
  if (!/^\d{4}-\d{2}-\d{2}$/.test(workDate)) return { error: 'Invalid date' }

  const hours = parseFloat(formData.get('hours') as string)
  if (isNaN(hours) || hours < 0.5 || hours > 24) return { error: 'Hours must be between 0.5 and 24' }

  if (await isWeekLocked(supabase, workDate)) return { error: 'This week is locked and cannot be edited.' }

  const approvalReset = await resetApprovalIfPending(supabase, employee.id, workDate)
  if (approvalReset.error) return approvalReset

  const { error } = await supabase.from('time_entries').update({
    hours,
    notes: (formData.get('notes') as string) || null,
  }).eq('id', id).eq('employee_id', employee.id)

  if (error) return { error: error.message }
  revalidatePath('/portal/timesheets')
  return {}
}

export async function deleteTimeEntry(entryId: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const employee = await getEmployee(supabase, user.id)
  if (!employee) return { error: 'Employee not found' }

  const { data: entry } = await supabase
    .from('time_entries').select('work_date')
    .eq('id', entryId).eq('employee_id', employee.id).single()
  if (!entry) return { error: 'Entry not found' }

  if (await isWeekLocked(supabase, entry.work_date)) return { error: 'This week is locked and cannot be edited.' }

  const approvalReset = await resetApprovalIfPending(supabase, employee.id, entry.work_date)
  if (approvalReset.error) return approvalReset

  const { error } = await supabase.from('time_entries')
    .delete().eq('id', entryId).eq('employee_id', employee.id)

  if (error) return { error: error.message }
  revalidatePath('/portal/timesheets')
  return {}
}

export async function addWeekProject(weekStart: string, projectId: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const employee = await getEmployee(supabase, user.id)
  if (!employee) return { error: 'Employee not found' }

  const { data: project } = await supabase
    .from('projects').select('is_active').eq('id', projectId).single()
  if (!project?.is_active) return { error: 'Project is not active' }

  const { error } = await supabase.from('employee_week_projects').insert({
    employee_id: employee.id,
    week_start: weekStart,
    project_id: projectId,
  })

  // 23505 = unique_violation — already pinned, treat as success
  if (error && error.code !== '23505') return { error: error.message }
  revalidatePath('/portal/timesheets')
  return {}
}

export async function removeWeekProject(weekStart: string, projectId: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const employee = await getEmployee(supabase, user.id)
  if (!employee) return { error: 'Employee not found' }

  const weekEndDate = new Date(weekStart + 'T00:00:00Z')
  weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6)
  const weekEnd = weekEndDate.toISOString().split('T')[0]!

  const { data: existingEntries } = await supabase
    .from('time_entries')
    .select('id')
    .eq('employee_id', employee.id)
    .eq('project_id', projectId)
    .gte('work_date', weekStart)
    .lte('work_date', weekEnd)
    .limit(1)

  if (existingEntries && existingEntries.length > 0) {
    return { error: 'Cannot remove a project that has time logged this week' }
  }

  const { error } = await supabase
    .from('employee_week_projects')
    .delete()
    .eq('employee_id', employee.id)
    .eq('week_start', weekStart)
    .eq('project_id', projectId)

  if (error) return { error: error.message }
  revalidatePath('/portal/timesheets')
  return {}
}

export async function submitTimesheetForReview(weekStart: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const employee = await getEmployee(supabase, user.id)
  if (!employee) return { error: 'Employee not found' }

  if (await isWeekLocked(supabase, weekStart)) return { error: 'This week is locked and cannot be edited.' }

  const { data: existing } = await supabase
    .from('timesheet_approvals')
    .select('status')
    .eq('employee_id', employee.id)
    .eq('week_start', weekStart)
    .maybeSingle()

  if (existing?.status === 'approved') {
    return { error: 'This timesheet has already been approved and cannot be resubmitted.' }
  }

  const { error } = await supabase.from('timesheet_approvals').upsert(
    {
      employee_id: employee.id,
      week_start: weekStart,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      reviewed_by: null,
      review_comment: null,
      reviewed_at: null,
    },
    {
      onConflict: 'employee_id,week_start',
      ignoreDuplicates: false,
    },
  )

  if (error) return { error: error.message }
  revalidatePath('/portal/timesheets')
  return {}
}
