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
      <img
        src="/brand/tatawur-lockup-horizontal-ivory.svg"
        alt="Tatawur AI"
        className={styles.logo}
      />

      <div className={styles.links}>
        <a href="/portal/dashboard" className={styles.link}>
          Dashboard
        </a>
        <a href="/portal/timesheets" className={styles.link}>
          Timesheets
        </a>
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
