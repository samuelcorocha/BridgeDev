import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Verifica presença do cookie de sessão do next-auth.
// A validação real da sessão ocorre no server component via getRequiredSession().
export function proxy(request: NextRequest) {
  const sessionToken =
    request.cookies.get("next-auth.session-token") ??
    request.cookies.get("__Secure-next-auth.session-token")

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.url)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/challenges/:path*",
    "/sandbox/:path*",
    "/reports/:path*",
  ],
}
