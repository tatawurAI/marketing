import { createClient } from '@/lib/supabase/server'
import type { EmployeeFull } from '@/lib/types'
import EmployeeTable from '@/components/admin/EmployeeTable'
import styles from './employees.module.scss'

export default async function AdminEmployeesPage() {
  const supabase = createClient()

  const { data } = await supabase
    .from('employees')
    .select('*')
    .order('full_name')

  const employees = (data ?? []) as EmployeeFull[]

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>Employees</h1>
      <EmployeeTable employees={employees} />
    </div>
  )
}
