import { NextResponse } from "next/server"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

interface EnderecoResult {
  cep: string
  logradouro: string
  bairro: string
  cidade: string
  uf: string
}

async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { signal: controller.signal })
    return response
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cep: string }> }
) {
  const clientIp = getClientIp(_request)

  if (!rateLimit(`cep:${clientIp}`, 30, 60_000)) {
    return NextResponse.json({ error: "Muitas requisições. Tente novamente em 1 minuto." }, { status: 429 })
  }

  const { cep: rawCep } = await params
  const cep = rawCep.replace(/\D/g, "")

  if (!/^\d{8}$/.test(cep)) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 })
  }

  try {
    const brasilApiRes = await fetchWithTimeout(`https://brasilapi.com.br/api/cep/v1/${cep}`)
    if (brasilApiRes.ok && brasilApiRes.headers.get("content-type")?.includes("application/json")) {
      const data = await brasilApiRes.json()
      const resultado: EnderecoResult = {
        cep,
        logradouro: data.street ?? "",
        bairro: data.neighborhood ?? "",
        cidade: data.city ?? "",
        uf: data.state ?? "",
      }
      return NextResponse.json(resultado)
    }
  } catch {
    // segue para o fallback
  }

  try {
    const viaCepRes = await fetchWithTimeout(`https://viacep.com.br/ws/${cep}/json/`)
    const contentType = viaCepRes.headers.get("content-type")
    if (!viaCepRes.ok || !contentType?.includes("application/json")) {
      return NextResponse.json({ error: "CEP não encontrado" }, { status: 404 })
    }
    const data = await viaCepRes.json()
    if (data.erro) {
      return NextResponse.json({ error: "CEP não encontrado" }, { status: 404 })
    }
    const resultado: EnderecoResult = {
      cep,
      logradouro: data.logradouro ?? "",
      bairro: data.bairro ?? "",
      cidade: data.localidade ?? "",
      uf: data.uf ?? "",
    }
    return NextResponse.json(resultado)
  } catch {
    return NextResponse.json({ error: "Não foi possível consultar o CEP" }, { status: 502 })
  }
}
