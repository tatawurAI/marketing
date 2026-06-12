'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Briefcase, Users, Clock, CalendarCheck, ClipboardCheck, FileText } from 'lucide-react'
import styles from './AdminNav.module.scss'

const NAV_ITEMS = [
  { label: 'Overview', href: '/portal/admin', icon: LayoutDashboard, exact: true },
  { label: 'Projects', href: '/portal/admin/projects', icon: Briefcase, exact: false },
  { label: 'Employees', href: '/portal/admin/employees', icon: Users, exact: false },
  { label: 'Timesheets', href: '/portal/admin/timesheets', icon: Clock, exact: false },
  { label: 'Invoices', href: '/portal/admin/invoices', icon: FileText, exact: false },
  { label: 'Weeks', href: '/portal/admin/weeks', icon: CalendarCheck, exact: false },
  { label: 'Approvals', href: '/portal/admin/approvals', icon: ClipboardCheck, exact: false },
] as const

interface AdminNavLinksProps {
  pendingApprovals?: number
}

export default function AdminNavLinks({ pendingApprovals }: AdminNavLinksProps) {
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
            {label === 'Approvals' && pendingApprovals != null && pendingApprovals > 0 && (
              <span className={styles.badge}>{pendingApprovals}</span>
            )}
          </Link>
        )
      })}
    </>
  )
}
