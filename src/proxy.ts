import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Check if the route is an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for the presence of the accessToken cookie set by the backend
    const hasAccessToken = request.cookies.has('accessToken');
    
    if (!hasAccessToken) {
      // If no token is present, redirect to the login page
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow the request to proceed if not an admin route or if authenticated
  return NextResponse.next();
}

// Configure the proxy to only run on specific paths to optimize performance
export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
