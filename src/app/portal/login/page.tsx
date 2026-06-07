import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import styles from './login.module.scss'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  async function signInWithGoogle() {
    'use server'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!siteUrl) throw new Error('NEXT_PUBLIC_SITE_URL is required')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/portal/auth/callback`,
      },
    })
    if (error) redirect('/portal/login?error=auth_failed')
    if (data.url) redirect(data.url)
  }

  return (
    <main className={styles.root}>
      <div className={styles.card}>
        <img
          src="/brand/tatawur-lockup-horizontal-ivory.svg"
          alt="Tatawur AI"
          className={styles.logo}
        />
        <p className={styles.subtitle}>Team Portal</p>
        {searchParams.error === 'auth_failed' && (
          <p className={styles.error}>Authentication failed. Please try again.</p>
        )}
        <form action={signInWithGoogle}>
          <button type="submit" className={styles.cta}>
            Sign in with Google
          </button>
        </form>
      </div>
    </main>
  )
}
