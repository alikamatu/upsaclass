import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Enforce role-based access
    if (pathname.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (
      pathname.startsWith("/rep") &&
      token?.role !== "rep" &&
      token?.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only allow authenticated users through the matcher paths
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    // Protect the main timetable and dashboard routes
    "/",
    "/schedule/:path*",
    "/student/:path*",
    "/admin/:path*",
    "/rep/:path*",
    // Exclude public API routes and Next.js internals
    "/((?!api/auth|login|register|verify-email|forgot-password|reset-password|_next/static|_next/image|favicon.ico).*)",
  ],
};
