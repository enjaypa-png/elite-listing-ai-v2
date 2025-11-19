import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected workflow routes that require authentication
const protectedRoutes = [
  '/upload',
  '/photo-checkup',
  '/photo-improve',
  '/keywords',
  '/title-description',
  '/finish',
  '/saved-projects',
  '/etsy-connect',
]

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/signin',
  '/auth/signup',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if this is a protected workflow route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Get session token from cookies
  const sessionToken = request.cookies.get('sb-access-token')?.value || 
                       request.cookies.get('sb-refresh-token')?.value
  
  // If accessing a protected route without session, redirect to signin
  if (isProtectedRoute && !sessionToken) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }
  
  // If authenticated user tries to access signin/signup, redirect to upload
  if (isPublicRoute && pathname.startsWith('/auth/') && sessionToken) {
    return NextResponse.redirect(new URL('/upload', request.url))
  }
  
  // Add security headers
  const response = NextResponse.next()
  
  // Security headers for production
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
