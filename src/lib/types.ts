export type Project = {
  id: string
  name: string
}

export type ProjectFull = {
  id: string
  name: string
  client_name: string | null
  description: string | null
  is_active: boolean
  created_at: string
}

export type TimeEntry = {
  id: string
  project_id: string
  work_date: string   // 'YYYY-MM-DD'
  hours: number
  notes: string | null
}

export type AdminTimeEntry = TimeEntry & {
  employee: { full_name: string }
  project: { name: string }
}

export type EmployeeFull = {
  id: string
  user_id: string
  full_name: string
  email: string
  title: string
  department: string | null
  salary_rate: number
  role: 'employee' | 'admin'
  is_active: boolean
  started_at: string
  created_at: string
  updated_at: string
}

export type BillingRate = {
  id: string
  employee_id: string
  project_id: string
  billable_rate: number
  project: { name: string }
}

export type LockedWeek = {
  week_start: string
  locked_by: string
  locked_at: string
}

export type AdminStats = {
  active_employees: number
  active_projects: number
  entries_this_week: number
  unlocked_weeks_last_12: number
}

export type TimesheetApproval = {
  id: string
  employee_id: string
  week_start: string
  status: 'pending' | 'approved' | 'denied'
  reviewed_by: string | null
  review_comment: string | null
  submitted_at: string
  reviewed_at: string | null
}

export type AdminTimesheetApproval = TimesheetApproval & {
  employee: { full_name: string }
  reviewer: { full_name: string } | null
}
