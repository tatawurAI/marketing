import { redirect } from 'next/navigation'
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

  if (!user) redirect('/portal/login')

  return (
    <div className={styles.shell}>
      <PortalNav userEmail={user.email ?? ''} />
      <main className={styles.main}>{children}</main>
    </div>
  )
}
