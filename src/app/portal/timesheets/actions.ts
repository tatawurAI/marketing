'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTimeEntry(formData: FormData): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: employee } = await supabase
    .from('employees').select('id').eq('user_id', user.id).single()
  if (!employee) return { error: 'Employee not found' }

  const { error } = await supabase.from('time_entries').insert({
    employee_id: employee.id,
    project_id: formData.get('project_id') as string,
    work_date: formData.get('work_date') as string,
    hours: parseFloat(formData.get('hours') as string),
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

  const { data: employee } = await supabase
    .from('employees').select('id').eq('user_id', user.id).single()
  if (!employee) return { error: 'Employee not found' }

  const id = formData.get('id') as string
  const { error } = await supabase.from('time_entries').update({
    hours: parseFloat(formData.get('hours') as string),
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

  const { data: employee } = await supabase
    .from('employees').select('id').eq('user_id', user.id).single()
  if (!employee) return { error: 'Employee not found' }

  const { error } = await supabase.from('time_entries')
    .delete().eq('id', entryId).eq('employee_id', employee.id)

  if (error) return { error: error.message }
  revalidatePath('/portal/timesheets')
  return {}
}
