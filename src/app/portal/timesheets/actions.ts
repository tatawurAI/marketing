'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type Client = ReturnType<typeof createClient>

async function getEmployee(supabase: Client, userId: string) {
  const { data } = await supabase
    .from('employees').select('id').eq('user_id', userId).single()
  return data
}

async function isWeekLocked(supabase: Client, workDate: string): Promise<boolean> {
  const d = new Date(workDate + 'T00:00:00Z')
  const dow = d.getUTCDay()
  d.setUTCDate(d.getUTCDate() + (dow === 0 ? -6 : 1 - dow))
  const weekStart = d.toISOString().split('T')[0]
  const { data } = await supabase
    .from('locked_weeks').select('week_start').eq('week_start', weekStart).maybeSingle()
  return data != null
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

  const { error } = await supabase.from('time_entries')
    .delete().eq('id', entryId).eq('employee_id', employee.id)

  if (error) return { error: error.message }
  revalidatePath('/portal/timesheets')
  return {}
}
