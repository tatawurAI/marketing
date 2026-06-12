export type InvoiceEntry = {
  work_date: string  // 'YYYY-MM-DD'
  hours: number
  notes: string | null
}

export type InvoiceData = {
  employeeName: string
  projectName: string
  startDate: string   // 'YYYY-MM-DD'
  endDate: string     // 'YYYY-MM-DD'
  entries: InvoiceEntry[]
  billingRate: number | null  // null = not set
  generatedAt: string  // ISO date string, e.g. new Date().toISOString()
}

export type ProjectInvoicePreview = {
  projectId: string
  projectName: string
  totalHours: number
  entryCount: number
  billingRate: number | null
}
