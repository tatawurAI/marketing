'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './PortalNav.module.scss'

export default function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()

  const dashboardActive = pathname === '/portal/dashboard'
  const timesheetsActive = pathname.startsWith('/portal/timesheets')
  const adminActive = pathname.startsWith('/portal/admin')

  return (
    <>
      <Link
        href="/portal/dashboard"
        className={dashboardActive ? styles.linkActive : styles.link}
      >
        Dashboard
      </Link>
      <Link
        href="/portal/timesheets"
        className={timesheetsActive ? styles.linkActive : styles.link}
      >
        Timesheets
      </Link>
      {isAdmin && (
        <Link
          href="/portal/admin"
          className={adminActive ? styles.linkActive : styles.link}
        >
          Admin
        </Link>
      )}
    </>
  )
}
