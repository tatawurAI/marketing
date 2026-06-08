'use client'

import { useState, useMemo } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import * as Popover from '@radix-ui/react-popover'
import { format, addDays, startOfWeek } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Lock, ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './WeekPicker.module.scss'

type Props = {
  weekStart: string
  isLocked: boolean
}

export default function WeekPicker({ weekStart, isLocked }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const parsedWeekStart = useMemo(() => {
    const [year, month, day] = weekStart.split('-').map(Number)
    return new Date(year!, month! - 1, day!)
  }, [weekStart])

  const currentMonday = useMemo(
    () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    [],
  )

  const isCurrentWeek =
    format(parsedWeekStart, 'yyyy-MM-dd') ===
    format(currentMonday, 'yyyy-MM-dd')

  const weekEnd = addDays(parsedWeekStart, 6)
  const label = `Week of ${format(parsedWeekStart, 'MMM d')}–${format(weekEnd, 'd, yyyy')}`

  function navigate(offsetDays: number) {
    const target = addDays(parsedWeekStart, offsetDays)
    router.push(`/portal/timesheets?week=${format(target, 'yyyy-MM-dd')}`)
  }

  return (
    <div className={styles.picker}>
      <button
        type="button"
        className={styles.navBtn}
        onClick={() => navigate(-7)}
        aria-label="Previous week"
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
      </button>

      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger className={styles.trigger} aria-label="Open calendar">
          {isLocked && (
            <Lock size={12} strokeWidth={1.5} className={styles.lockIcon} />
          )}
          <span>{label}</span>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className={styles.popoverContent} sideOffset={8} align="center">
            <DayPicker
              mode="single"
              selected={parsedWeekStart}
              onSelect={(date) => {
                if (!date) return
                const monday = startOfWeek(date, { weekStartsOn: 1 })
                router.push(
                  `/portal/timesheets?week=${format(monday, 'yyyy-MM-dd')}`,
                )
                setOpen(false)
              }}
              modifiers={{
                week: (date) => date >= parsedWeekStart && date <= weekEnd,
              }}
              modifiersClassNames={{ week: styles.dayInWeek }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <button
        type="button"
        className={styles.navBtn}
        onClick={() => navigate(7)}
        aria-label="Next week"
      >
        <ChevronRight size={16} strokeWidth={1.5} />
      </button>

      <button
        type="button"
        className={styles.thisWeekBtn}
        onClick={() =>
          router.push(
            `/portal/timesheets?week=${format(currentMonday, 'yyyy-MM-dd')}`,
          )
        }
        disabled={isCurrentWeek}
        aria-current={isCurrentWeek ? 'true' : undefined}
      >
        This Week
      </button>
    </div>
  )
}
