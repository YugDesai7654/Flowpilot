import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/jwt";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token || !verifyJwt(token)) {
    console.log("Unauthorized access attempt. Token:", token);
    return NextResponse.redirect(new URL("/signup", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/dashboard/:path*",
    "/settings/:path*",
    "/projects/:path*",
    // Add other protected routes here
  ],
}; 