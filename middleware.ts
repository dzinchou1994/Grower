import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const localePrefixRegex = /^\/(ka|en|ru)(\/|$)/;
const excludedPathRegex =
  /^\/(_next|api|favicon\.ico|icon\.png|robots\.txt|sitemap\.xml|images|brand)(\/|$)/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (excludedPathRegex.test(pathname)) {
    return NextResponse.next();
  }

  if (pathname === "/ka" || pathname.startsWith("/ka/")) {
    const cleanedPath = pathname === "/ka" ? "/" : pathname.replace(/^\/ka/, "");
    const url = request.nextUrl.clone();
    url.pathname = cleanedPath;
    return NextResponse.redirect(url, 308);
  }

  if (!localePrefixRegex.test(pathname)) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/ka${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)", "/"],
};
