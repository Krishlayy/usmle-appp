import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If the route is an admin route, check role
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (!['ADMIN', 'SUPERADMIN'].includes(req.nextauth.token?.role as string)) {
        // Redirect non-admins to dashboard
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  },
  {
    pages: {
      signIn: '/login',
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
