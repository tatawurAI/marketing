import { createClient } from '@/lib/supabase/server'
import WeekLockTable from '@/components/admin/WeekLockTable'

/** Return the Monday (UTC) of the ISO week containing `date`. */
function isoWeekMonday(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dow = d.getUTCDay() // 0=Sun … 6=Sat
  d.setUTCDate(d.getUTCDate() - (dow === 0 ? 6 : dow - 1))
  return d
}

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0]
}

export default async function AdminWeeksPage() {
  const supabase = createClient()

  const currentMonday = isoWeekMonday(new Date())

  // Build the last 12 Mondays (inclusive of current week), newest first
  const mondays: Date[] = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(currentMonday)
    d.setUTCDate(d.getUTCDate() - i * 7)
    mondays.push(d)
  }

  const oldestMonday = toISODate(mondays[mondays.length - 1])

  const [lockedWeeksResult, entriesResult] = await Promise.all([
    supabase.from('locked_weeks').select('week_start'),
    supabase
      .from('time_entries')
      .select('work_date')
      .gte('work_date', oldestMonday),
  ])

  const lockedSet = new Set(
    (lockedWeeksResult.data ?? []).map(r => r.week_start as string),
  )

  // Count entries per ISO week start (group by week in TypeScript)
  const countByWeek: Record<string, number> = {}
  for (const entry of entriesResult.data ?? []) {
    const workDate = entry.work_date as string
    const entryDate = new Date(workDate + 'T00:00:00Z')
    const weekKey = toISODate(isoWeekMonday(entryDate))
    countByWeek[weekKey] = (countByWeek[weekKey] ?? 0) + 1
  }

  const weeks = mondays.map(monday => {
    const weekStart = toISODate(monday)
    return {
      weekStart,
      entryCount: countByWeek[weekStart] ?? 0,
      isLocked:   lockedSet.has(weekStart),
    }
  })

  return <WeekLockTable weeks={weeks} />
}
