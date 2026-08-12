import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function proxy(request: NextRequest) {
  let response = NextResponse.next()
  const { pathname } = request.nextUrl

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

  if (pathname === "/login" || pathname === "/cadastro" || pathname === "/") {
    if (data?.user) return NextResponse.redirect(new URL("/dashboard", request.url))
    return response
  }

  if (!data?.user) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const isMaster = data.user.user_metadata?.role === "ADMIN"
  if (isMaster) return response

  const clinicaId = data.user.user_metadata?.clinica_id
  if (!clinicaId) return NextResponse.redirect(new URL("/precos", request.url))

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const { data: license } = await supabase
    .from("licencas")
    .select("usada_em")
    .eq("clinica_id", clinicaId)
    .eq("usada", true)
    .gte("usada_em", fourteenDaysAgo)
    .maybeSingle()

  if (!license) return NextResponse.redirect(new URL("/precos?message=Ative+uma+licenca", request.url))

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
