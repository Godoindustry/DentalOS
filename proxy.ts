import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

const PUBLIC_PATHS = ["/", "/login", "/cadastro", "/landing", "/precos", "/ativar"]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/favicon") ||
    pathname === "/manifest.json" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  )
}

async function checkLicense(supabase: ReturnType<typeof createServerClient>, user: { user_metadata?: { clinica_id?: string } }) {
  const clinicaId = user.user_metadata?.clinica_id
  if (!clinicaId) return false

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const { data: license } = await supabase
    .from("licencas")
    .select("usada_em")
    .eq("clinica_id", clinicaId)
    .eq("usada", true)
    .gte("usada_em", fourteenDaysAgo)
    .maybeSingle()

  return !!license
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next()
  const { pathname } = request.nextUrl

  if (isStaticAsset(pathname)) {
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

  if (isPublicPath(pathname)) {
    if (pathname === "/" || pathname === "/login" || pathname === "/cadastro") {
      const { data } = await supabase.auth.getUser()
      if (data?.user) return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return response
  }

  const { data } = await supabase.auth.getUser()
  if (!data?.user) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const hasLicense = await checkLicense(supabase, data.user)
  if (!hasLicense && pathname !== "/precos" && pathname !== "/ativar") {
    const precosUrl = new URL("/precos", request.url)
    precosUrl.searchParams.set("message", "Ative uma licenca para acessar o sistema")
    return NextResponse.redirect(precosUrl)
  }

  return response
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pacientes/:path*",
    "/profissionais/:path*",
    "/procedimentos/:path*",
    "/agendamentos/:path*",
    "/faturamento/:path*",
    "/financeiro-cadeiras/:path*",
    "/odontograma/:path*",
    "/anamnese/:path*",
    "/bot/:path*",
    "/configuracoes/:path*",
    "/pacientes-potenciais/:path*",
    "/precos/:path*",
    "/ativar/:path*",
  ],
}
