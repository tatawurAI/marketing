export type Project = {
  id: string
  name: string
}

export type TimeEntry = {
  id: string
  project_id: string
  work_date: string   // 'YYYY-MM-DD'
  hours: number
  notes: string | null
}
