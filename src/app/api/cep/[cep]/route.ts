import { NextResponse } from "next/server"

interface EnderecoResult {
  cep: string
  logradouro: string
  bairro: string
  cidade: string
  uf: string
}

/**
 * Consulta pública de CEP (sem credenciais): tenta BrasilAPI primeiro
 * (mais completa) e cai para ViaCEP se a primeira falhar/não achar.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cep: string }> }
) {
  const { cep: rawCep } = await params
  const cep = rawCep.replace(/\D/g, "")

  if (cep.length !== 8) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 })
  }

  try {
    const brasilApiRes = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`, {
      next: { revalidate: 60 * 60 * 24 },
    })
    if (brasilApiRes.ok) {
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
    const viaCepRes = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      next: { revalidate: 60 * 60 * 24 },
    })
    const data = await viaCepRes.json()
    if (!viaCepRes.ok || data.erro) {
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
