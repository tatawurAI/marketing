import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/portal')) return response

  // Unauthenticated — redirect to login
  if (!user) {
    if (pathname === '/portal/login') return response
    if (pathname === '/portal/auth/callback') return response
    return NextResponse.redirect(new URL('/portal/login', request.url))
  }

  // Admin guard — JWT claim (fast path; admin layout does authoritative DB check)
  if (pathname.startsWith('/portal/admin')) {
    const role = (user.app_metadata as Record<string, string>)?.role
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/portal/dashboard', request.url))
    }
  }

  // Authenticated user hitting login page — send to dashboard
  if (pathname === '/portal/login') {
    return NextResponse.redirect(new URL('/portal/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/portal/:path*'],
}
