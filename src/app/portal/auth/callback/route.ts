import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const oauthError = searchParams.get('error')

  // OAuth provider returned an error (e.g. user denied access, wrong account)
  if (oauthError) {
    return NextResponse.redirect(`${origin}/portal/login?error=auth_failed`)
  }

  // No code and no error — unexpected state, send to login
  if (!code) {
    return NextResponse.redirect(`${origin}/portal/login`)
  }

  const response = NextResponse.redirect(`${origin}/portal/dashboard`)
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        // CRITICAL: writes to response, not cookieStore — response is already committed
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(`${origin}/portal/login?error=auth_failed`)
  }

  return response
}
