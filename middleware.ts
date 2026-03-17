import { authConfig } from '@/lib/auth.config';
import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ['/login', '/register', '/api/auth', '/api/blog', '/blog'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p) || pathname === '/')) {
    return NextResponse.next();
  }

  const session = await auth();

  // If trying to access dashboard/tools but not authenticated
  if (!session && (
    pathname.startsWith('/tools') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/learning') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/settings') ||
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/')
  )) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Allow authenticated to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
