import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function proxy(request: NextRequest) {
  let response = NextResponse.next()

  const { pathname } = request.nextUrl

  const isServerAction = request.headers.has("Next-Action") || request.headers.has("next-action") || pathname.startsWith("/_next/action")
  if (isServerAction) return response

  const isApiRoute = pathname.startsWith("/api")
  const isStaticAsset =
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname.startsWith("/_next/action") ||
    pathname === "/favicon.ico" ||
    pathname === "/favicon.png" ||
    pathname === "/manifest.json" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/apple-touch-icon") ||
    pathname.startsWith("/android-chrome-") ||
    pathname.startsWith("/mstile-") ||
    pathname.startsWith("/safari-pinned-tab") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)

  if (isApiRoute || isStaticAsset) {
    return response
  }

  const publicPaths = ["/", "/login", "/cadastro", "/landing"]
  const isPublicPath = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))

  if (isPublicPath) {
    if (pathname === "/" || pathname === "/login" || pathname === "/cadastro") {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return request.cookies.getAll() },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              response = NextResponse.next({ request })
              cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
            },
          },
        }
      )
      const { data } = await supabase.auth.getUser()
      if (data?.user) return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data } = await supabase.auth.getUser()
  if (!data?.user) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|_next/action|favicon\\.ico|favicon\\.png|manifest\\.json|robots\\.txt|sitemap\\.xml|apple-touch-icon|android-chrome-|mstile-|safari-pinned-tab).*)"],
}
