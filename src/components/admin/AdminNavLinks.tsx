'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Briefcase, Users, Clock, CalendarCheck } from 'lucide-react'
import styles from './AdminNav.module.scss'

const NAV_ITEMS = [
  { label: 'Overview', href: '/portal/admin', icon: LayoutDashboard, exact: true },
  { label: 'Projects', href: '/portal/admin/projects', icon: Briefcase, exact: false },
  { label: 'Employees', href: '/portal/admin/employees', icon: Users, exact: false },
  { label: 'Timesheets', href: '/portal/admin/timesheets', icon: Clock, exact: false },
  { label: 'Weeks', href: '/portal/admin/weeks', icon: CalendarCheck, exact: false },
] as const

export default function AdminNavLinks() {
  const pathname = usePathname()

  return (
    <>
      {NAV_ITEMS.map(({ label, href, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={isActive ? styles.navLinkActive : styles.navLink}
          >
            <Icon size={16} strokeWidth={1.5} />
            <span>{label}</span>
          </Link>
        )
      })}
    </>
  )
}
