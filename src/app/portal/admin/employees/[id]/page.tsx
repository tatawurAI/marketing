import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { EmployeeFull, BillingRate } from '@/lib/types'
import EmployeeForm from '@/components/admin/EmployeeForm'

type PageProps = {
  params: { id: string }
}

export default async function AdminEmployeeEditPage({ params }: PageProps) {
  const supabase = createClient()

  const [employeeResult, projectsResult, billingRatesResult] = await Promise.all([
    supabase
      .from('employees')
      .select('*')
      .eq('id', params.id)
      .single(),
    supabase
      .from('projects')
      .select('id, name')
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('employee_billing_rates')
      .select('*, project:projects(name)')
      .eq('employee_id', params.id),
  ])

  if (!employeeResult.data) notFound()

  const employee     = employeeResult.data as EmployeeFull
  const projects     = (projectsResult.data ?? []) as { id: string; name: string }[]
  const billingRates = (billingRatesResult.data ?? []) as BillingRate[]

  return (
    <EmployeeForm
      employee={employee}
      projects={projects}
      billingRates={billingRates}
    />
  )
}
