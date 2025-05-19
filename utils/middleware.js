import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === "/auth/signin" || path === "/auth/signup";

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect to signin page if trying to access a protected route without auth
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Check for admin-only pages
  if (path.startsWith("/admin")) {
    // If user is not an admin, redirect to homepage
    if (token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // If user is already logged in and tries to access auth pages, redirect to homepage
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Add all paths that should be protected by the middleware
export const config = {
  matcher: ["/admin/:path*", "/auth/signin", "/auth/signup", "/profile/:path*"],
};
