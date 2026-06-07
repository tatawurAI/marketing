import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import styles from './PortalNav.module.scss'

export default function PortalNav({ userEmail }: { userEmail: string }) {
  async function signOut() {
    'use server'
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/portal/login')
  }

  return (
    <nav className={styles.nav}>
      <a href="/">
        <img
          src="/brand/tatawur-lockup-horizontal-ivory.svg"
          alt="Tatawur AI — home"
          className={styles.logo}
        />
      </a>

      <div className={styles.links}>
        <Link href="/portal/dashboard" className={styles.link}>
          Dashboard
        </Link>
        <Link href="/portal/timesheets" className={styles.link}>
          Timesheets
        </Link>
      </div>

      <div className={styles.user}>
        <span className={styles.email}>{userEmail}</span>
        <form action={signOut}>
          <button type="submit" className={styles.signOut}>
            Sign out
          </button>
        </form>
      </div>
    </nav>
  )
}
