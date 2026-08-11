"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  pacienteSchema, profissionalSchema, procedimentoSchema, firstZodError,
} from "@/lib/validations"

export async function editarPaciente(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()
  const id = formData.get("id") as string
  if (!id) return { error: "ID do paciente é obrigatório" }

  const parsed = pacienteSchema.safeParse({
    nome: formData.get("nome"),
    cpf: formData.get("cpf") || null,
    data_nascimento: formData.get("data_nascimento"),
    sexo: formData.get("sexo") || null,
    telefone: formData.get("telefone"),
    email: formData.get("email") || null,
    cep: formData.get("cep") || null,
    logradouro: formData.get("logradouro") || null,
    numero: formData.get("numero") || null,
    bairro: formData.get("bairro") || null,
    cidade: formData.get("cidade") || null,
    uf: formData.get("uf") || null,
    responsavel: formData.get("responsavel") || null,
    observacoes: formData.get("observacoes") || null,
  })
  if (!parsed.success) return { error: firstZodError(parsed.error) }
  const dados = parsed.data

  const { error } = await supabase.from("pacientes").update({
    nome: dados.nome,
    cpf: dados.cpf || null,
    data_nascimento: dados.data_nascimento,
    sexo: dados.sexo || null,
    telefone_whatsapp: dados.telefone,
    email: dados.email || null,
    cep: dados.cep || null,
    logradouro: dados.logradouro || null,
    numero: dados.numero || null,
    bairro: dados.bairro || null,
    cidade: dados.cidade || null,
    uf: dados.uf || null,
    responsavel_legal: dados.responsavel || null,
    observacoes_criticas: dados.observacoes || null,
  }).eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/pacientes")
  redirect("/pacientes")
}

async function getClinicaId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: user } = await supabase.auth.getUser()
  let clinicaId = user.user?.user_metadata?.clinica_id
  if (!clinicaId) return null

  const admin = createAdminClient()
  const { data: clinica } = await admin.from("clinicas").select("id").eq("id", clinicaId).maybeSingle()
  if (!clinica) {
    const { data: newClinica } = await admin
      .from("clinicas")
      .insert({ nome_fantasia: "Minha Clínica", plano_assinatura: "basic" })
      .select("id")
      .single()
    if (newClinica) {
      clinicaId = newClinica.id
      await admin.auth.admin.updateUserById(user.user!.id, {
        user_metadata: { ...user.user!.user_metadata, clinica_id: clinicaId },
      })
      await supabase.auth.refreshSession()
    }
  }

  return clinicaId
}

export async function criarPaciente(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()
  const clinicaId = await getClinicaId(supabase)
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const parsed = pacienteSchema.safeParse({
    nome: formData.get("nome"),
    cpf: formData.get("cpf") || null,
    data_nascimento: formData.get("data_nascimento"),
    sexo: formData.get("sexo") || null,
    telefone: formData.get("telefone"),
    email: formData.get("email") || null,
    cep: formData.get("cep") || null,
    logradouro: formData.get("logradouro") || null,
    numero: formData.get("numero") || null,
    bairro: formData.get("bairro") || null,
    cidade: formData.get("cidade") || null,
    uf: formData.get("uf") || null,
    responsavel: formData.get("responsavel") || null,
    observacoes: formData.get("observacoes") || null,
  })
  if (!parsed.success) return { error: firstZodError(parsed.error) }
  const dados = parsed.data

  const { error } = await supabase.from("pacientes").insert({
    clinica_id: clinicaId,
    nome: dados.nome,
    cpf: dados.cpf || null,
    data_nascimento: dados.data_nascimento,
    sexo: dados.sexo || null,
    telefone_whatsapp: dados.telefone,
    email: dados.email || null,
    cep: dados.cep || null,
    logradouro: dados.logradouro || null,
    numero: dados.numero || null,
    bairro: dados.bairro || null,
    cidade: dados.cidade || null,
    uf: dados.uf || null,
    responsavel_legal: dados.responsavel || null,
    observacoes_criticas: dados.observacoes || null,
  })

  if (error) return { error: error.message }

  revalidatePath("/pacientes")
  redirect("/pacientes")
}

export async function editarProfissional(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()
  const id = formData.get("id") as string
  if (!id) return { error: "ID do profissional é obrigatório" }

  const parsed = profissionalSchema.safeParse({
    nome: formData.get("nome"),
    cro: formData.get("cro"),
    uf_cro: formData.get("uf_cro"),
    especialidade: formData.get("especialidade") || null,
    comissao: formData.get("comissao"),
  })
  if (!parsed.success) return { error: firstZodError(parsed.error) }
  const dados = parsed.data

  const { error } = await supabase.from("profissionais").update({
    nome: dados.nome,
    cro: dados.cro,
    uf_cro: dados.uf_cro,
    especialidade_principal: dados.especialidade || null,
    porcentagem_comissao: dados.comissao,
    ativo: formData.get("ativo") === "true",
  }).eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/profissionais")
  redirect("/profissionais")
}

export async function criarProfissional(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  const clinicaId = user.user?.user_metadata?.clinica_id
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const parsed = profissionalSchema.safeParse({
    nome: formData.get("nome"),
    cro: formData.get("cro"),
    uf_cro: formData.get("uf_cro"),
    especialidade: formData.get("especialidade") || null,
    comissao: formData.get("comissao"),
    role: formData.get("role") || "sublocatario",
    email: formData.get("email") || null,
    senha: formData.get("senha") || null,
  })
  if (!parsed.success) return { error: firstZodError(parsed.error) }
  const dados = parsed.data

  let novoUserId: string | null = null

  // Se e-mail/senha foram informados, cria login próprio para o sublocatário
  // acessar o sistema vendo apenas seus próprios pacientes/agenda.
  if (dados.email && dados.senha) {
    const admin = createAdminClient()
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: dados.email,
      password: dados.senha,
      email_confirm: true,
      user_metadata: { nome: dados.nome, clinica_id: clinicaId, role: dados.role },
    })
    if (authError || !authData?.user) {
      return { error: authError?.message || "Erro ao criar login do profissional" }
    }
    novoUserId = authData.user.id
  }

  const { error } = await supabase.from("profissionais").insert({
    clinica_id: clinicaId,
    user_id: novoUserId,
    nome: dados.nome,
    cro: dados.cro,
    uf_cro: dados.uf_cro,
    especialidade_principal: dados.especialidade || null,
    porcentagem_comissao: dados.comissao,
    role: dados.role,
  })

  if (error) return { error: error.message }

  revalidatePath("/profissionais")
  redirect("/profissionais")
}

export async function editarProcedimento(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()
  const id = formData.get("id") as string
  if (!id) return { error: "ID do procedimento é obrigatório" }

  const parsed = procedimentoSchema.safeParse({
    nome_servico: formData.get("nome_servico"),
    categoria: formData.get("categoria"),
    codigo_tuss: formData.get("codigo_tuss") || null,
    preco_venda: formData.get("preco_venda"),
    custo_insumos: formData.get("custo_insumos"),
    custo_laboratorio: formData.get("custo_laboratorio"),
    tempo_estimado: formData.get("tempo_estimado"),
  })
  if (!parsed.success) return { error: firstZodError(parsed.error) }
  const dados = parsed.data

  const { error } = await supabase.from("procedimentos").update({
    nome_servico: dados.nome_servico,
    categoria: dados.categoria,
    codigo_tuss: dados.codigo_tuss || null,
    preco_venda: dados.preco_venda,
    custo_insumos_direto: dados.custo_insumos,
    custo_laboratorio: dados.custo_laboratorio,
    tempo_estimado_minutos: dados.tempo_estimado,
  }).eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/procedimentos")
  redirect("/procedimentos")
}

export async function criarProcedimento(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  const clinicaId = user.user?.user_metadata?.clinica_id
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const parsed = procedimentoSchema.safeParse({
    nome_servico: formData.get("nome_servico"),
    categoria: formData.get("categoria"),
    codigo_tuss: formData.get("codigo_tuss") || null,
    preco_venda: formData.get("preco_venda"),
    custo_insumos: formData.get("custo_insumos"),
    custo_laboratorio: formData.get("custo_laboratorio"),
    tempo_estimado: formData.get("tempo_estimado"),
  })
  if (!parsed.success) return { error: firstZodError(parsed.error) }
  const dados = parsed.data

  const { error } = await supabase.from("procedimentos").insert({
    clinica_id: clinicaId,
    nome_servico: dados.nome_servico,
    categoria: dados.categoria,
    codigo_tuss: dados.codigo_tuss || null,
    preco_venda: dados.preco_venda,
    custo_insumos_direto: dados.custo_insumos,
    custo_laboratorio: dados.custo_laboratorio,
    tempo_estimado_minutos: dados.tempo_estimado,
  })

  if (error) return { error: error.message }

  revalidatePath("/procedimentos")
  redirect("/procedimentos")
}

export async function criarAgendamento(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  const clinicaId = user.user?.user_metadata?.clinica_id
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const pacienteId = formData.get("paciente_id") as string
  const profissionalId = formData.get("profissional_id") as string
  const data = formData.get("data") as string
  const hora = formData.get("hora") as string
  const duracao = parseInt(formData.get("duracao") as string) || 30

  if (!pacienteId || !profissionalId || !data || !hora) {
    return { error: "Preencha paciente, profissional, data e hora." }
  }

  const inicio = new Date(`${data}T${hora}:00`)
  const fim = new Date(inicio.getTime() + duracao * 60 * 1000)

  const { error } = await supabase.from("agendamentos").insert({
    clinica_id: clinicaId,
    paciente_id: pacienteId,
    profissional_id: profissionalId,
    data_hora_inicio: inicio.toISOString(),
    data_hora_fim: fim.toISOString(),
    status: "agendado",
    canal_origem: "painel",
  })

  if (error) return { error: error.message }

  // [Z-API] Enviar WhatsApp automaticamente
  try {
    const [{ data: paciente }, { data: botConfig }, { data: profissional }] = await Promise.all([
      supabase.from("pacientes").select("nome, telefone_whatsapp").eq("id", pacienteId).single(),
      supabase.from("configuracoes_bot").select("mensagem_boas_vindas, ativo, google_calendar_id, google_refresh_token").eq("clinica_id", clinicaId).single(),
      supabase.from("profissionais").select("nome").eq("id", profissionalId).single(),
    ]);

    if (botConfig?.ativo && paciente?.telefone_whatsapp) {
      const msgData = `${inicio.toLocaleDateString("pt-BR")} às ${inicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
      let texto = botConfig.mensagem_boas_vindas || "Olá {nome}, sua consulta está confirmada para {data} com o Dr(a). {profissional}!";
      texto = texto.replace("{nome}", paciente.nome).replace("{data}", msgData).replace("{profissional}", profissional?.nome || "");
      
      const { sendWhatsAppMessage } = await import("@/lib/zapi");
      await sendWhatsAppMessage(paciente.telefone_whatsapp, texto);
    }

    // [Google Calendar] Criar evento
    if (botConfig?.google_calendar_id && botConfig?.google_refresh_token) {
      const { createGoogleCalendarEvent } = await import("@/lib/gcal");
      await createGoogleCalendarEvent({
        clinicaId,
        calendarId: botConfig.google_calendar_id,
        summary: `Consulta: ${paciente?.nome}`,
        description: `Consulta com Dr(a). ${profissional?.nome}\nGerado automaticamente pelo DentalOS.`,
        startTime: inicio,
        endTime: fim,
      });
    }
  } catch (err) {
    console.error("Erro ao integrar Z-API/GCal:", err);
  }

  revalidatePath("/agendamentos")
  redirect("/agendamentos")
}

export async function salvarClinica(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()

  const { data: user } = await supabase.auth.getUser()
  const clinicaId = user.user?.user_metadata?.clinica_id
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const { error } = await supabase.from("clinicas").upsert({
    id: clinicaId,
    nome_fantasia: formData.get("nome_fantasia") as string,
    razao_social: formData.get("razao_social") as string || null,
    cnpj: formData.get("cnpj") as string || null,
  })

  if (error) return { error: error.message }

  revalidatePath("/configuracoes")
  return { success: true }
}

export async function salvarPerfil(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  const usuario = user.user
  if (!usuario) return { error: "Usuario nao autenticado" }

  const nome = formData.get("nome") as string
  const especialidade = formData.get("especialidade") as string
  const cro = formData.get("cro") as string
  const ufCro = formData.get("uf_cro") as string

  if (!nome) return { error: "Informe o nome do profissional" }

  const { error: authError } = await supabase.auth.updateUser({
    data: { ...usuario.user_metadata, nome },
  })
  if (authError) return { error: authError.message }

  const { data: profissional } = await supabase
    .from("profissionais")
    .select("id")
    .eq("user_id", usuario.id)
    .maybeSingle()

  if (profissional?.id) {
    const { error } = await supabase
      .from("profissionais")
      .update({
        nome,
        especialidade_principal: especialidade || null,
        cro: cro || "",
        uf_cro: ufCro || "",
      })
      .eq("id", profissional.id)
    if (error) return { error: error.message }
  }

  revalidatePath("/configuracoes")
  return { success: true }
}

export async function salvarConfiguracaoBot(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  const clinicaId = user.user?.user_metadata?.clinica_id
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const { error } = await supabase.from("configuracoes_bot").upsert({
    clinica_id: clinicaId,
    nome_clinica: formData.get("nome_clinica") as string || "",
    telefone: formData.get("telefone") as string || "",
    whatsapp: formData.get("whatsapp") as string || "",
    horario_funcionamento: formData.get("horario_funcionamento") as string || "",
    google_calendar_id: formData.get("google_calendar_id") as string || "",
    mensagem_boas_vindas: formData.get("mensagem_boas_vindas") as string || "",
    mensagem_urgencia: formData.get("mensagem_urgencia") as string || "",
    transferencia_humano: formData.get("transferencia_humano") as string || "",
    ativo: formData.get("ativo") === "true",
  }, { onConflict: "clinica_id" })

  if (error) return { error: error.message }

  revalidatePath("/configuracoes")
  return { success: true }
}

export interface OdontogramaInput {
  paciente_id: string
  dentes: Record<string, {
    ausente: boolean
    implante: boolean
    coroa: boolean
    extracao?: boolean
    faces: Record<string, string>
  }>
}

export async function salvarAnamnese(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()

  const { data: user } = await supabase.auth.getUser()
  const clinicaId = user.user?.user_metadata?.clinica_id
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const pacienteId = formData.get("paciente_id") as string
  const profissionalId = formData.get("profissional_id") as string

  if (!pacienteId || !profissionalId) return { error: "Selecione paciente e profissional" }

  const questoes = [
    "alergia_medicamento", "qualAlergia",
    "tratamento_medico", "qualTratamento",
    "doenca_grave", "qualDoenca",
    "hospitalizacao", "qualHospitalizacao",
    "problema_cardiovascular", "qualProblemaCardiovascular",
    "problema_metabolico", "qualProblemaMetabolico",
    "problema_respiratorio", "qualProblemaRespiratorio",
    "gravida", "qualGravidez",
    "habitos", "quaisHabitos",
    "outros_problemas", "quaisOutrosProblemas",
    "dor_atual", "qualDor",
    "tratamento_anterior", "qualTratamentoAnterior",
    "medo_dentista",
    "satisfeito_aparencia", "qualInsatisfacao",
  ]

  const questionario: Record<string, string> = {}
  for (const q of questoes) {
    const val = formData.get(q) as string
    if (val) questionario[q] = val
  }

  const { error } = await supabase.from("anamneses").insert({
    paciente_id: pacienteId,
    profissional_id: profissionalId,
    questionario_respondido: questionario,
    assinatura_digital_hash: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
  })

  if (error) return { error: error.message }

  revalidatePath("/anamnese")
  return { success: true }
}

export async function converterPacientePotencial(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  const clinicaId = user.user?.user_metadata?.clinica_id
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const potencialId = formData.get("potencial_id") as string
  const nome = formData.get("nome") as string
  const dataNascimento = formData.get("data_nascimento") as string
  const telefone = formData.get("telefone") as string

  if (!nome || !dataNascimento || !telefone) {
    return { error: "Preencha nome, data de nascimento e telefone" }
  }

  const { data: potencial, error: fetchError } = await supabase
    .from("pacientes_potenciais")
    .select("*")
    .eq("id", potencialId)
    .single()

  if (fetchError || !potencial) return { error: "Potencial paciente não encontrado" }

  let observacoes = `Convertido do bot ${potencial.canal === "whatsapp" ? "WhatsApp" : "Telegram"}.`
  if (potencial.anamnese && Object.keys(potencial.anamnese as object).length > 0) {
    observacoes += ` Anamnese: ${JSON.stringify(potencial.anamnese)}.`
  }
  if (potencial.queixa_principal) {
    observacoes += ` Queixa: ${potencial.queixa_principal}.`
  }
  if (potencial.regiao_dente) {
    observacoes += ` Região: ${potencial.regiao_dente}.`
  }

  const { error: insertError } = await supabase.from("pacientes").insert({
    clinica_id: clinicaId,
    nome,
    data_nascimento: dataNascimento,
    telefone_whatsapp: telefone,
    observacoes_criticas: observacoes,
  })

  if (insertError) return { error: insertError.message }

  const { error: updateError } = await supabase
    .from("pacientes_potenciais")
    .update({ status: "convertido" })
    .eq("id", potencialId)

  if (updateError) return { error: updateError.message }

  revalidatePath("/pacientes-potenciais")
  redirect("/pacientes-potenciais")
}

export async function atualizarStatusPotencial(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const supabase = await createClient()

  const id = formData.get("id") as string
  const status = formData.get("status") as string

  if (!id || !status) return { error: "ID e status são obrigatórios" }

  const { error } = await supabase
    .from("pacientes_potenciais")
    .update({ status })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/pacientes-potenciais")
  return { success: true }
}

export async function salvarOdontograma(dados: OdontogramaInput) {
  const supabase = await createClient()

  const { data: user } = await supabase.auth.getUser()
  const clinicaId = user.user?.user_metadata?.clinica_id
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const { error } = await supabase.from("odontograma").upsert(
    {
      clinica_id: clinicaId,
      paciente_id: dados.paciente_id,
      dentes: dados.dentes,
    },
    { onConflict: "paciente_id" }
  )

  if (error) return { error: error.message }

  revalidatePath(`/pacientes/${dados.paciente_id}`)
  return { success: true }
}

export async function criarCobrancaCadeira(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  const clinicaId = user.user?.user_metadata?.clinica_id
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const profissionalId = formData.get("profissional_id") as string
  const tipoCobranca = formData.get("tipo_cobranca") as string
  const competencia = formData.get("competencia") as string
  const valorFixoMensal = formData.get("valor_fixo_mensal") as string
  const percentualFaturamento = formData.get("percentual_faturamento") as string

  if (!profissionalId || !competencia) return { error: "Selecione o profissional e a competência" }

  const primeiroDiaMes = `${competencia}-01`
  const [ano, mes] = competencia.split("-").map(Number)
  const ultimoDiaMes = new Date(ano, mes, 0).toISOString().slice(0, 10)

  let faturamentoBase = 0
  let valorCalculado = 0

  if (tipoCobranca === "percentual") {
    const percentual = parseFloat(percentualFaturamento || "0")
    const { data: faturamentos } = await supabase
      .from("faturamento")
      .select("valor_bruto_pago")
      .eq("profissional_executor_id", profissionalId)
      .gte("data_competencia", primeiroDiaMes)
      .lte("data_competencia", ultimoDiaMes)

    faturamentoBase = (faturamentos ?? []).reduce((soma, f) => soma + Number(f.valor_bruto_pago), 0)
    valorCalculado = Math.round(faturamentoBase * (percentual / 100) * 100) / 100
  } else {
    valorCalculado = parseFloat(valorFixoMensal || "0")
  }

  const { error } = await supabase.from("financeiro_cadeiras").upsert({
    clinica_id: clinicaId,
    profissional_id: profissionalId,
    tipo_cobranca: tipoCobranca,
    valor_fixo_mensal: tipoCobranca === "fixo" ? valorCalculado : null,
    percentual_faturamento: tipoCobranca === "percentual" ? parseFloat(percentualFaturamento || "0") : null,
    competencia: primeiroDiaMes,
    faturamento_base: faturamentoBase,
    valor_calculado: valorCalculado,
  }, { onConflict: "profissional_id,competencia" })

  if (error) return { error: error.message }

  revalidatePath("/financeiro-cadeiras")
  return { success: true }
}

export async function marcarCobrancaPaga(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("financeiro_cadeiras")
    .update({ status_pagamento: "pago", data_pagamento: new Date().toISOString().slice(0, 10) })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/financeiro-cadeiras")
  return { success: true }
}

export async function enviarRelatorioMensal() {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  const clinicaId = user.user?.user_metadata?.clinica_id
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const { data: clinica } = await supabase.from("clinicas").select("nome_fantasia").eq("id", clinicaId).single()
  
  const hoje = new Date()
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10)
  
  const { data: faturamentos } = await supabase
    .from("faturamento")
    .select("valor_bruto_pago, lucro_liquido_clinica")
    .eq("clinica_id", clinicaId)
    .gte("data_competencia", primeiroDia)

  const totalBruto = (faturamentos ?? []).reduce((soma, f) => soma + Number(f.valor_bruto_pago), 0)
  const totalLiquido = (faturamentos ?? []).reduce((soma, f) => soma + Number(f.lucro_liquido_clinica), 0)

  const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #0F766E;">Relatório Financeiro Mensal</h2>
      <p><strong>Clínica:</strong> ${clinica?.nome_fantasia || "Sua Clínica"}</p>
      <p>Confira o resumo financeiro parcial deste mês:</p>
      <div style="background: #F1F5F9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Faturamento Bruto:</strong> ${formatter.format(totalBruto)}</p>
        <p style="margin: 5px 0;"><strong>Lucro Líquido da Clínica:</strong> ${formatter.format(totalLiquido)}</p>
      </div>
      <p>Acesse o painel <strong>DentalOS</strong> para ver todos os detalhes e emitir notas.</p>
    </div>
  `

  const { sendEmail } = await import("@/lib/resend")
  const emailTo = "diogo.godoi.industry@gmail.com" // Forçado conforme documentação
  
  const result = await sendEmail({
    to: emailTo,
    subject: `Relatório Financeiro DentalOS - ${clinica?.nome_fantasia || ""}`,
    html,
  })

  if (result.error) return { error: "Falha ao enviar e-mail pelo Resend" }

  return { success: true }
}
