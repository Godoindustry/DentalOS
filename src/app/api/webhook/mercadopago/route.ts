import { NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"
import { sincronizarAssinatura } from "@/lib/mercadopago"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

const WEBHOOK_SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET

function assinaturaValida(request: Request, dataId: string): boolean {
  if (!WEBHOOK_SECRET) return true // sem segredo configurado, não há como validar

  const signatureHeader = request.headers.get("x-signature") || ""
  const requestId = request.headers.get("x-request-id") || ""

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=")
      return [k?.trim(), v?.trim()]
    })
  )
  const ts = parts.ts
  const hash = parts.v1
  if (!ts || !hash) return false

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`
  const expected = createHmac("sha256", WEBHOOK_SECRET).update(manifest).digest("hex")

  const expectedBuf = Buffer.from(expected, "hex")
  const hashBuf = Buffer.from(hash, "hex")
  return expectedBuf.length === hashBuf.length && timingSafeEqual(expectedBuf, hashBuf)
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request)
  if (!rateLimit(`mp-webhook:${clientIp}`, 60, 60_000)) {
    return NextResponse.json({ error: "Muitas requisições" }, { status: 429 })
  }

  let body: { type?: string; action?: string; data?: { id?: string } }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 })
  }

  const dataId = body?.data?.id
  const type = body?.type || body?.action || ""

  if (!dataId) {
    return NextResponse.json({ ok: true, ignored: true })
  }

  if (!assinaturaValida(request, dataId)) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 403 })
  }

  if (type.includes("preapproval") || type.includes("subscription")) {
    const result = await sincronizarAssinatura(dataId)
    if (result.error) {
      console.error("[MercadoPago webhook] Erro ao sincronizar assinatura:", result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json({ ok: true, status: result.status })
  }

  return NextResponse.json({ ok: true, ignored: true })
}

export async function GET() {
  return NextResponse.json({ ok: true })
}
