import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(req: Request) {
  const clientIp = getClientIp(req)

  if (!rateLimit(`lead:${clientIp}`, 5, 60_000)) {
    return NextResponse.json({ error: "Muitas requisições. Tente novamente em 1 minuto." }, { status: 429 })
  }

  try {
    const { nome, email, telefone, cadeiras } = await req.json()

    if (!nome || !email || !telefone || !cadeiras) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
    }

    const admin = await createClient()
    const { error } = await admin.from("leads").insert({
      nome: String(nome).trim(),
      email: String(email).trim(),
      telefone: String(telefone).trim(),
      cadeiras: Math.max(1, parseInt(String(cadeiras), 10) || 1),
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
