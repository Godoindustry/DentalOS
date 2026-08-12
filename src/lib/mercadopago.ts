import { createAdminClient } from "./supabase/admin"

const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN
const MP_API = "https://api.mercadopago.com"

export const PLANOS = {
  individual: { nome: "Individual", valor: 347 },
  clinica: { nome: "Clínica", valor: 997 },
  clinica_plus: { nome: "Clínica Plus", valor: 1797 },
} as const

export type PlanoKey = keyof typeof PLANOS

function baseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
}

/**
 * Cria uma assinatura recorrente (Preapproval) no Mercado Pago e retorna a
 * URL de checkout hospedada para o cliente pagar/autorizar a cobrança.
 */
export async function criarAssinaturaMP({
  plano,
  clinicaId,
  email,
}: {
  plano: PlanoKey
  clinicaId: string
  email: string
}) {
  if (!MP_ACCESS_TOKEN) {
    return { error: "Mercado Pago não configurado" }
  }

  const config = PLANOS[plano]
  if (!config) {
    return { error: "Plano inválido" }
  }

  const body = {
    reason: `DentalOS - Plano ${config.nome}`,
    external_reference: `${clinicaId}:${plano}`,
    payer_email: email,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: config.valor,
      currency_id: "BRL",
    },
    back_url: `${baseUrl()}/configuracoes?assinatura=processando`,
    status: "pending",
  }

  try {
    const response = await fetch(`${MP_API}/preapproval`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error("[MercadoPago] Erro ao criar preapproval:", data)
      return { error: data?.message || "Falha ao criar assinatura no Mercado Pago" }
    }

    const admin = createAdminClient()
    await admin.from("assinaturas").insert({
      clinica_id: clinicaId,
      plano,
      mp_preapproval_id: data.id,
      status: "pending",
      valor: config.valor,
      payer_email: email,
    })

    return { initPoint: data.init_point as string }
  } catch (error) {
    console.error("[MercadoPago] Exceção ao criar assinatura:", error)
    return { error: "Falha ao conectar com o Mercado Pago" }
  }
}

export async function buscarAssinaturaMP(preapprovalId: string) {
  if (!MP_ACCESS_TOKEN) return { error: "Mercado Pago não configurado" }

  try {
    const response = await fetch(`${MP_API}/preapproval/${preapprovalId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    })
    const data = await response.json()
    if (!response.ok) return { error: data?.message || `HTTP ${response.status}` }
    return { data }
  } catch (error) {
    console.error("[MercadoPago] Exceção ao buscar assinatura:", error)
    return { error: "Falha ao conectar com o Mercado Pago" }
  }
}

/** Sincroniza o status de uma assinatura local com o status atual no Mercado Pago. */
export async function sincronizarAssinatura(preapprovalId: string): Promise<{ error: string; data?: undefined; status?: undefined } | { data: unknown; status: string; error?: undefined }> {
  const result = await buscarAssinaturaMP(preapprovalId)
  if (result.error || !result.data) return { error: result.error || "Assinatura não encontrada" }

  const mpStatus = result.data.status as string
  const statusMap: Record<string, string> = {
    authorized: "authorized",
    paused: "paused",
    cancelled: "cancelled",
    pending: "pending",
  }
  const status = statusMap[mpStatus] || "pending"

  const admin = createAdminClient()
  await admin
    .from("assinaturas")
    .update({
      status,
      proxima_cobranca: result.data.next_payment_date || null,
      atualizada_em: new Date().toISOString(),
    })
    .eq("mp_preapproval_id", preapprovalId)

  return { data: result.data, status }
}
