import { NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

const protectedRoutes = ["/dashboard", "/appointments", "/chat", "/profile", "/settings", "/admin", "/pending-approval"];
const publicRoutes = ["/login", "/activate", "/activate-request", "/forgot-password", "/reset-password"];

export async function proxy(req) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  // 🔥 AUTO-FIX: If an old session cookie is missing the new 'doctorStatus' property, clear it!
  if (session?.userId && session?.role === "DOCTOR" && !session?.doctorStatus) {
    const response = NextResponse.redirect(new URL("/login", req.nextUrl));
    response.cookies.delete("session"); // Instantly destroys the old cookie
    return response;
  }

  // 1. If trying to access a protected route without a session -> redirect to login
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 2. If user has a session, check if they are a pending doctor
  if (session?.userId) {
    if (session.role === "DOCTOR") {
      if (session.doctorStatus !== "APPROVED") {
        // If they are pending and trying to access anything EXCEPT the pending page and logout
        if (path !== "/pending-approval" && !path.startsWith("/api/auth-logout")) {
          return NextResponse.redirect(new URL("/pending-approval", req.nextUrl));
        }
      } else {
        // If they are approved, they shouldn't be on the pending page
        if (path === "/pending-approval") {
          return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
        }
      }
    } else {
      // If they are a PATIENT or ADMIN, they should never see the pending page
      if (path === "/pending-approval") {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
      }
    }

    // 3. If trying to login/register while already logged in -> redirect to dashboard
    if (isPublicRoute && !path.startsWith("/activate")) {
      if (session.role === "DOCTOR" && session.doctorStatus !== "APPROVED") {
        return NextResponse.redirect(new URL("/pending-approval", req.nextUrl));
      }
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};