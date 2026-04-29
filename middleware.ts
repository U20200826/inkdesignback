import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/admin'];

// Public routes that redirect to dashboard if already logged in
const publicRoutes = ['/login', '/'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session from cookie
  const sessionCookie = request.cookies.get('ink_session');
  const isAuthenticated = !!sessionCookie?.value;

  // Handle Supabase session refresh
  const supabaseResponse = await createClient(request);

  // Redirect unauthenticated users trying to access protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from public routes
  if (publicRoutes.includes(pathname) && isAuthenticated) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Match all routes except:
    // - _next/static (static files)
    // - _next/image (image optimization)
    // - favicon.ico (favicon)
    // - public folder
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
