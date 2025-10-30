import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple middleware for Supabase Auth
// For now, we'll allow all requests and handle auth checks in individual API routes
export function middleware(request: NextRequest) {
  // Allow all requests to pass through
  // Auth checks are done in individual API routes using Supabase
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - auth/signin (login page)
     * - auth/signup (signup page)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|auth/signin|auth/signup).*)",
  ],
}
