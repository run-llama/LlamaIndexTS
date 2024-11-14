import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(_: NextRequest): NextResponse {
  const response = NextResponse.next();
  response.headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  return response;
}

export const config = {
  matcher:
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
};
