import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to extract tenant slug from subdomain
 *
 * URL patterns:
 * - cafe-joe.kiosk.app.com -> tenant: cafe-joe
 * - localhost:3000 -> uses NEXT_PUBLIC_DEFAULT_TENANT
 * - kiosk.app.com (no subdomain) -> redirect to tenant selection or error
 */
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  // Extract subdomain
  let tenantSlug: string | null = null;

  if (hostname === 'localhost:3000' || hostname === 'localhost') {
    // Local development - use default tenant or query param
    tenantSlug = request.nextUrl.searchParams.get('tenant') ||
                 process.env.NEXT_PUBLIC_DEFAULT_TENANT ||
                 null;
  } else if (hostname.endsWith(rootDomain)) {
    // Production - extract subdomain
    const subdomain = hostname.replace(`.${rootDomain}`, '');
    if (subdomain && subdomain !== hostname) {
      tenantSlug = subdomain;
    }
  } else {
    // Direct subdomain access (e.g., cafe-joe.kiosk.app.com)
    const parts = hostname.split('.');
    if (parts.length > 2) {
      tenantSlug = parts[0];
    }
  }

  // Create response with tenant info in headers
  const response = NextResponse.next();

  if (tenantSlug) {
    // Set tenant slug in header for server components
    response.headers.set('x-tenant-slug', tenantSlug);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
