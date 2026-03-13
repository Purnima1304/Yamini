import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add the routes you want to be completely public here
const publicRoutes = ['/login', '/api/auth/signin', '/api/auth/signup', '/api/auth/logout'];

export function proxy(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  // If the user navigates directly to the base URL (typing it in or opening a new tab),
  // they specifically requested that they are ALWAYS given the login page.
  // We can detect this direct navigation if the referer is missing.
  if (request.nextUrl.pathname === '/' && !request.headers.get('referer')) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }

  // If the user is trying to access a protected route without a token, redirect to login
  if (!authToken && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user already has a token and attempts to access the login page, redirect to dashboard
  if (authToken && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Ensure the middleware runs on all routes except static files, Next.js internals, etc.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
