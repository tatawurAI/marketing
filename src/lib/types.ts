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

// ---------------------------------------------------------------------------
// Shared status filter — Invoices & Payroll runs share the same status enum
// ---------------------------------------------------------------------------
export type PayableStatusFilter = 'all' | 'draft' | 'submitted' | 'paid'

export const PAYABLE_STATUS_FILTERS = new Set<PayableStatusFilter>([
  'all',
  'draft',
  'submitted',
  'paid',
])

// Invoices/payroll runs have no separate "unpaid" status — 'submitted' means
// sent and awaiting payment. Centralized here so the four call sites that
// query on it (admin layout/dashboard nav badges, invoices/payroll pages)
// can't drift if a status is ever added (e.g. "overdue").
export const UNPAID_STATUS = 'submitted' as const

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------
export type Invoice = {
  id: string
  employee_id: string
  project_id: string
  period_start: string
  period_end: string
  total_hours: number
  billing_rate: number | null
  total_amount: number | null
  status: 'draft' | 'submitted' | 'paid'
  pdf_path: string | null
  notes: string | null
  created_by: string
  created_at: string
  submitted_at: string | null
  paid_at: string | null
  paid_by: string | null
}

export type AdminInvoice = Invoice & {
  employee: { full_name: string }
  project: { name: string }
  creator: { full_name: string }
  payer: { full_name: string } | null
}

// ---------------------------------------------------------------------------
// Payroll
// ---------------------------------------------------------------------------
export type PayrollRun = {
  id: string
  employee_id: string
  period_start: string
  period_end: string
  total_hours: number
  hourly_rate: number
  total_amount: number
  status: 'draft' | 'submitted' | 'paid'
  pdf_path: string | null
  notes: string | null
  created_by: string
  created_at: string
  submitted_at: string | null
  paid_at: string | null
  paid_by: string | null
}

export type AdminPayrollRun = PayrollRun & {
  employee: { full_name: string }
  creator: { full_name: string }
  payer: { full_name: string } | null
}

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------
export type ExpenseClaim = {
  id: string
  employee_id: string
  expense_date: string
  amount: number
  description: string
  receipt_path: string | null
  status: 'pending' | 'approved' | 'reimbursed' | 'rejected'
  submitted_at: string
  reviewed_by: string | null
  reviewed_at: string | null
  review_comment: string | null
  reimbursed_at: string | null
  reimbursed_by: string | null
}

export type AdminExpenseClaim = ExpenseClaim & {
  employee: { full_name: string }
  reviewer: { full_name: string } | null
  reimbursed_by_emp: { full_name: string } | null
}
