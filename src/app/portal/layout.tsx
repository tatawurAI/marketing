import { createClient } from '@/lib/supabase/server'
import PortalNav from '@/components/portal/PortalNav'
import styles from './portal.module.scss'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Unauthenticated: render children without the portal shell.
  // Middleware already redirects unauthenticated requests away from protected
  // routes — but /portal/login and /portal/auth/callback are exempted and
  // still reach this layout, so we must not redirect here or we get a loop.
  if (!user) return <>{children}</>

  return (
    <div className={styles.shell}>
      <PortalNav userEmail={user.email ?? ''} />
      <main className={styles.main}>{children}</main>
    </div>
  )
}
