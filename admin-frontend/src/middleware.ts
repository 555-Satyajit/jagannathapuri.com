import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if user is accessing a protected route
  // Our dashboard is at '/' and '/admin/*'
  const isDashboardRoute = request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/admin')
  const isLoginRoute = request.nextUrl.pathname === '/login'

  // The Express backend issues an 'admin_sid' cookie upon successful login
  const hasAdminCookie = request.cookies.has('admin_sid')

  // If trying to access dashboard without cookie, redirect to login
  if (isDashboardRoute && !hasAdminCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If trying to access login page WITH a cookie, redirect to dashboard
  if (isLoginRoute && hasAdminCookie) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - admin_login_hero.png or any other static assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg).*)',
  ],
}
