'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Briefcase, Users, Clock, CalendarCheck, ClipboardCheck, FileText, DollarSign, Receipt } from 'lucide-react'
import styles from './AdminNav.module.scss'

type BadgeSeverity = 'urgent' | 'routine'
type BadgeKey = 'approvals' | 'expenses' | 'invoices' | 'payroll'

const NAV_ITEMS = [
  { label: 'Overview', href: '/portal/admin', icon: LayoutDashboard, exact: true },
  { label: 'Projects', href: '/portal/admin/projects', icon: Briefcase, exact: false },
  { label: 'Employees', href: '/portal/admin/employees', icon: Users, exact: false },
  { label: 'Timesheets', href: '/portal/admin/timesheets', icon: Clock, exact: false },
  { label: 'Invoices', href: '/portal/admin/invoices', icon: FileText, exact: false, badgeKey: 'invoices' as BadgeKey, severity: 'routine' as BadgeSeverity },
  { label: 'Payroll', href: '/portal/admin/payroll', icon: DollarSign, exact: false, badgeKey: 'payroll' as BadgeKey, severity: 'routine' as BadgeSeverity },
  { label: 'Weeks', href: '/portal/admin/weeks', icon: CalendarCheck, exact: false },
  { label: 'Approvals', href: '/portal/admin/approvals', icon: ClipboardCheck, exact: false, badgeKey: 'approvals' as BadgeKey, severity: 'urgent' as BadgeSeverity },
  { label: 'Expenses', href: '/portal/admin/expenses', icon: Receipt, exact: false, badgeKey: 'expenses' as BadgeKey, severity: 'urgent' as BadgeSeverity },
] as const

interface AdminNavLinksProps {
  pendingApprovals?: number
  pendingExpenses?: number
  pendingInvoices?: number
  pendingPayroll?: number
}

export default function AdminNavLinks({
  pendingApprovals,
  pendingExpenses,
  pendingInvoices,
  pendingPayroll,
}: AdminNavLinksProps) {
  const pathname = usePathname()

  const counts: Record<BadgeKey, number | undefined> = {
    approvals: pendingApprovals,
    expenses: pendingExpenses,
    invoices: pendingInvoices,
    payroll: pendingPayroll,
  }

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const { label, href, icon: Icon, exact } = item
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        const badgeKey = 'badgeKey' in item ? item.badgeKey : undefined
        const count = badgeKey ? counts[badgeKey] : undefined
        const severity = 'severity' in item ? item.severity : undefined

        return (
          <Link
            key={href}
            href={href}
            className={isActive ? styles.navLinkActive : styles.navLink}
          >
            <Icon size={16} strokeWidth={1.5} />
            <span>{label}</span>
            {count != null && count > 0 && (
              <span className={severity === 'urgent' ? styles.badgeUrgent : styles.badge}>
                {count}
              </span>
            )}
          </Link>
        )
      })}
    </>
  )
}
