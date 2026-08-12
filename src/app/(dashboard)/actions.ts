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

export async function getClinicaId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return null
  let clinicaId = user.user.user_metadata?.clinica_id

  const admin = createAdminClient()
  const clinica = clinicaId
    ? (await admin.from("clinicas").select("id").eq("id", clinicaId).maybeSingle()).data
    : null

  if (!clinica) {
    // Cobre dois casos: usuário nunca teve clinica_id, ou tinha um clinica_id
    // apontando para uma clínica que não existe mais (ex: reset de banco).
    const { data: newClinica } = await admin
      .from("clinicas")
      .insert({ nome_fantasia: "Minha Clínica", plano_assinatura: "basic" })
      .select("id")
      .single()
    if (newClinica) {
      clinicaId = newClinica.id
      await admin.auth.admin.updateUserById(user.user.id, {
        user_metadata: { ...user.user.user_metadata, clinica_id: clinicaId },
      })
      await supabase.auth.refreshSession()
    }
  }

  return clinicaId ?? null
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
  const clinicaId = await getClinicaId(supabase)
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
  const clinicaId = await getClinicaId(supabase)
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
  const clinicaId = await getClinicaId(supabase)
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

  const { data: inserted, error } = await supabase.from("agendamentos").insert({
    clinica_id: clinicaId,
    paciente_id: pacienteId,
    profissional_id: profissionalId,
    data_hora_inicio: inicio.toISOString(),
    data_hora_fim: fim.toISOString(),
    status: "agendado",
    canal_origem: "painel",
  }).select("id").single()

  if (error) return { error: error.message }

  try {
    await enviarMensagemAgendamento(inserted.id)
  } catch (err) {
    console.error("Erro ao integrar Z-API/GCal:", err)
  }

  revalidatePath("/agendamentos")
  redirect("/agendamentos")
}

export async function enviarMensagemAgendamento(agendamentoId: string) {
  const supabase = await createClient()
  const clinicaId = await getClinicaId(supabase)
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const { data: agendamento } = await supabase
    .from("agendamentos")
    .select("*, pacientes (nome, telefone_whatsapp), profissionais (nome, google_calendar_id)")
    .eq("id", agendamentoId)
    .single()

  if (!agendamento) return { error: "Agendamento não encontrado" }

  const { data: botConfig } = await supabase
    .from("configuracoes_bot")
    .select("mensagem_boas_vindas, ativo, google_calendar_id, google_refresh_token")
    .eq("clinica_id", clinicaId)
    .single()

  const inicio = new Date(agendamento.data_hora_inicio)
  const fim = new Date(agendamento.data_hora_fim)
  const calendarId = agendamento.profissionais?.google_calendar_id || botConfig?.google_calendar_id

  if (botConfig?.ativo && agendamento.pacientes?.telefone_whatsapp) {
    const msgData = `${inicio.toLocaleDateString("pt-BR")} às ${inicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    let texto = botConfig.mensagem_boas_vindas || "Olá {nome}, sua consulta está confirmada para {data} com o Dr(a). {profissional}!";
    texto = texto.replace("{nome}", agendamento.pacientes.nome).replace("{data}", msgData).replace("{profissional}", agendamento.profissionais?.nome || "");
    
    const { sendWhatsAppMessage } = await import("@/lib/zapi");
    await sendWhatsAppMessage(agendamento.pacientes.telefone_whatsapp, texto);
  }

  if (calendarId && botConfig?.google_refresh_token) {
    const { createGoogleCalendarEvent } = await import("@/lib/gcal");
    await createGoogleCalendarEvent({
      clinicaId,
      calendarId,
      summary: `Consulta: ${agendamento.pacientes?.nome}`,
      description: `Consulta com Dr(a). ${agendamento.profissionais?.nome}\nGerado automaticamente pelo DentalOS.`,
      startTime: inicio,
      endTime: fim,
    });
  }

  return { success: true }
}

export async function salvarClinica(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()

  const clinicaId = await getClinicaId(supabase)
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

export async function salvarBotProfissional(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()
  const profissionalId = formData.get("profissional_id") as string
  if (!profissionalId) return { error: "Profissional é obrigatório" }

  const { data: prof, error: profError } = await supabase
    .from("profissionais")
    .select("id, nome, bot_webhook_slug")
    .eq("id", profissionalId)
    .maybeSingle()
  if (profError || !prof) return { error: "Profissional não encontrado" }

  let webhookSlug = prof.bot_webhook_slug || ""
  if (!webhookSlug) {
    const base = prof.nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30)
    webhookSlug = `${base || "dentista"}-${Math.random().toString(36).slice(2, 7)}`
  }

  const groqSlot = parseInt(formData.get("bot_groq_key_slot") as string, 10)

  const { error } = await supabase.from("profissionais").update({
    bot_ativo: formData.get("bot_ativo") === "true",
    bot_whatsapp: (formData.get("bot_whatsapp") as string || "").trim(),
    bot_zapi_instance_id: (formData.get("bot_zapi_instance_id") as string || "").trim(),
    bot_zapi_token: (formData.get("bot_zapi_token") as string || "").trim(),
    bot_zapi_client_token: (formData.get("bot_zapi_client_token") as string || "").trim(),
    bot_groq_key_slot: [1, 2, 3].includes(groqSlot) ? groqSlot : 1,
    bot_mensagem_boas_vindas: (formData.get("bot_mensagem_boas_vindas") as string || "").trim(),
    bot_webhook_slug: webhookSlug,
  }).eq("id", profissionalId)

  if (error) return { error: error.message }

  revalidatePath(`/profissionais/${profissionalId}`)
  return { success: true }
}

export async function salvarConfiguracaoBot(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()
  const clinicaId = await getClinicaId(supabase)
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const { data: existing } = await supabase
    .from("configuracoes_bot")
    .select("webhook_slug")
    .eq("clinica_id", clinicaId)
    .maybeSingle()

  let webhookSlug = existing?.webhook_slug || ""
  if (!webhookSlug) {
    const base = (formData.get("nome_clinica") as string || "clinica").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30)
    const { data: slugCheck } = await supabase.from("configuracoes_bot").select("webhook_slug").eq("webhook_slug", base).maybeSingle()
    if (slugCheck) {
      webhookSlug = `${base}-${Math.random().toString(36).slice(2, 7)}`
    } else {
      webhookSlug = base || `clinica-${Math.random().toString(36).slice(2, 7)}`
    }
  }

  const n8nWebhookUrl = (formData.get("n8n_webhook_url") as string || "").trim()
  const n8nWebhookSecret = (formData.get("n8n_webhook_secret") as string || "").trim()

  const { error } = await supabase.from("configuracoes_bot").upsert({
    clinica_id: clinicaId,
    nome_clinica: formData.get("nome_clinica") as string || "",
    endereco: formData.get("endereco") as string || "",
    cidade: formData.get("cidade") as string || "",
    horario_funcionamento: formData.get("horario_funcionamento") as string || "",
    telefone: formData.get("telefone") as string || "",
    whatsapp: formData.get("whatsapp") as string || "",
    google_calendar_id: formData.get("google_calendar_id") as string || "",
    mensagem_boas_vindas: formData.get("mensagem_boas_vindas") as string || "",
    mensagem_urgencia: formData.get("mensagem_urgencia") as string || "",
    transferencia_humano: formData.get("transferencia_humano") as string || "",
    ia_model: formData.get("ia_model") as string || "llama-3.1-8b-instant",
    ia_temperature: parseFloat(formData.get("ia_temperature") as string) || 0.2,
    ativo: formData.get("ativo") === "true",
    n8n_webhook_url: n8nWebhookUrl,
    n8n_webhook_secret: n8nWebhookSecret,
    webhook_slug: webhookSlug,
  }, { onConflict: "clinica_id" })

  if (error) return { error: error.message }

  if (n8nWebhookUrl) {
    const { setReceivedWebhook } = await import("@/lib/zapi")
    const result = await setReceivedWebhook(n8nWebhookUrl)
    if (result.error) {
      console.error("Aviso: Z-API webhook não atualizado:", result.error)
    }
  }

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

export async function converterPacientePotencial(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const supabase = await createClient()
  const clinicaId = await getClinicaId(supabase)
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
  const clinicaId = await getClinicaId(supabase)
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const id = formData.get("id") as string
  const status = formData.get("status") as string

  if (!id || !status) return { error: "ID e status são obrigatórios" }

  const { data: potencial } = await supabase
    .from("pacientes_potenciais")
    .select("clinica_id")
    .eq("id", id)
    .maybeSingle()

  if (!potencial || potencial.clinica_id !== clinicaId) {
    return { error: "Lead não encontrado ou não pertence a esta clínica" }
  }

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

  const clinicaId = await getClinicaId(supabase)
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
  const clinicaId = await getClinicaId(supabase)
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
  const clinicaId = await getClinicaId(supabase)
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const { data: cobranca } = await supabase
    .from("financeiro_cadeiras")
    .select("clinica_id")
    .eq("id", id)
    .maybeSingle()

  if (!cobranca || cobranca.clinica_id !== clinicaId) {
    return { error: "Cobrança não encontrada ou não pertence a esta clínica" }
  }

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
  const clinicaId = await getClinicaId(supabase)
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
  const clinicName = (clinica?.nome_fantasia || "Sua Clínica").replace(/[&<>"']/g, (c: string) => {
    const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
    return map[c] || c
  })
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #0F766E;">Relatório Financeiro Mensal</h2>
      <p><strong>Clínica:</strong> ${clinicName}</p>
      <p>Confira o resumo financeiro parcial deste mês:</p>
      <div style="background: #F1F5F9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Faturamento Bruto:</strong> ${formatter.format(totalBruto)}</p>
        <p style="margin: 5px 0;"><strong>Lucro Líquido da Clínica:</strong> ${formatter.format(totalLiquido)}</p>
      </div>
      <p>Acesse o painel <strong>DentalOS</strong> para ver todos os detalhes e emitir notas.</p>
    </div>
  `

  const { sendEmail } = await import("@/lib/resend")
  const emailTo = process.env.FINANCEIRO_EMAIL || "diogo.godoi.industry@gmail.com"

  const result = await sendEmail({
    to: emailTo,
    subject: `Relatório Financeiro DentalOS - ${clinica?.nome_fantasia || "Clínica"}`,
    html,
  })

  if (result.error) return { error: "Falha ao enviar e-mail pelo Resend" }

  return { success: true }
}

export async function marcarCroVerificado(profissionalId: string) {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return { error: "Usuário não autenticado" }

  const clinicaId = await getClinicaId(supabase)
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const { data: profissional } = await supabase
    .from("profissionais")
    .select("clinica_id")
    .eq("id", profissionalId)
    .maybeSingle()

  if (!profissional || profissional.clinica_id !== clinicaId) {
    return { error: "Profissional não encontrado ou não pertence a esta clínica" }
  }

  const { error } = await supabase
    .from("profissionais")
    .update({
      cro_verificado: true,
      cro_verificado_em: new Date().toISOString(),
      cro_verificado_por: user.user.id,
    })
    .eq("id", profissionalId)

  if (error) return { error: error.message }

  revalidatePath("/profissionais")
  return { success: true }
}

// =============================================
// NOVAS FUNCIONALIDADES: BOT, LGPD, URGÊNCIA, EXPORTAÇÃO
// =============================================

export async function aprovarLeadEPaciente(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const clinicaId = await getClinicaId(supabase)
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const potencialId = formData.get("potencial_id") as string
  const nome = formData.get("nome") as string
  const cpf = formData.get("cpf") as string || null
  const data_nascimento = formData.get("data_nascimento") as string
  const sexo = formData.get("sexo") as string || null
  const telefone = formData.get("telefone") as string
  const email = formData.get("email") as string || null
  const cep = formData.get("cep") as string || null
  const logradouro = formData.get("logradouro") as string || null
  const numero = formData.get("numero") as string || null
  const bairro = formData.get("bairro") as string || null
  const cidade = formData.get("cidade") as string || null
  const uf = formData.get("uf") as string || null
  const responsavel = formData.get("responsavel") as string || null
  const observacoes = formData.get("observacoes") as string || null
  const origem = formData.get("origem") as string || "bot_whatsapp"

  if (!potencialId || !nome || !telefone || !data_nascimento) {
    return { error: "Preencha todos os campos obrigatórios" }
  }

  const { data: potencial } = await admin
    .from("pacientes_potenciais")
    .select("*")
    .eq("id", potencialId)
    .eq("clinica_id", clinicaId)
    .maybeSingle()

  if (!potencial) {
    return { error: "Lead não encontrado ou não pertence a esta clínica" }
  }

  const { data: paciente, error: pacienteError } = await admin
    .from("pacientes")
    .insert({
      clinica_id: clinicaId,
      nome,
      cpf: cpf || potencial.cpf || null,
      data_nascimento: data_nascimento || potencial.data_nascimento || new Date().toISOString().split('T')[0],
      sexo: sexo || potencial.sexo || null,
      telefone_whatsapp: telefone || potencial.telefone,
      email: email || potencial.email || null,
      cep: cep || potencial.cep || null,
      logradouro: logradouro || potencial.logradouro || null,
      numero: numero || null,
      bairro: bairro || potencial.bairro || null,
      cidade: cidade || potencial.cidade || null,
      uf: uf || potencial.uf || null,
      responsavel_legal: responsavel || potencial.responsavel_legal || null,
      observacoes_criticas: observacoes || potencial.queixa_principal || null,
      origem,
    })
    .select("id")
    .single()

  if (pacienteError || !paciente) {
    return { error: pacienteError?.message || "Erro ao criar paciente" }
  }

  await admin.from("pacientes_potenciais")
    .update({ status: "convertido", paciente_id: paciente.id })
    .eq("id", potencialId)

  revalidatePath("/pacientes-potenciais")
  return { success: true, paciente_id: paciente.id }
}

export async function exportarPacientes() {
  const supabase = await createClient()
  const admin = createAdminClient()
  const clinicaId = await getClinicaId(supabase)
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const { data: pacientes, error } = await admin
    .from("pacientes")
    .select("*")
    .eq("clinica_id", clinicaId)
    .order("created_at", { ascending: false })

  if (error) return { error: error.message }
  if (!pacientes || pacientes.length === 0) return { error: "Nenhum paciente encontrado" }

  const csvHeader = "Nome,CPF,Data Nascimento,Sexo,Telefone,Email,CEP,Logradouro,Número,Bairro,Cidade,UF,Responsável,Observações,Origem,Data Cadastro\n"
  const csvRows = pacientes.map((p) => {
    const row = [
      p.nome || "",
      p.cpf || "",
      p.data_nascimento || "",
      p.sexo || "",
      p.telefone_whatsapp || "",
      p.email || "",
      p.cep || "",
      p.logradouro || "",
      p.numero || "",
      p.bairro || "",
      p.cidade || "",
      p.uf || "",
      (p.responsavel_legal || "").replace(/"/g, '""'),
      (p.observacoes_criticas || "").replace(/"/g, '""'),
      p.origem || "",
      p.created_at || "",
    ].map((v) => `"${v}"`).join(",")
    return row
  }).join("\n")

  const csv = csvHeader + csvRows
  const base64 = Buffer.from(csv, "utf-8").toString("base64")
  const filename = `pacientes-clinica-${clinicaId}-${new Date().toISOString().split('T')[0]}.csv`

  return { success: true, csv, filename, total: pacientes.length }
}

export async function cadastrarPacienteManual(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const clinicaId = await getClinicaId(supabase)
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const nome = formData.get("nome") as string
  const cpf = formData.get("cpf") as string || null
  const data_nascimento = formData.get("data_nascimento") as string
  const sexo = formData.get("sexo") as string || null
  const telefone = formData.get("telefone") as string
  const email = formData.get("email") as string || null
  const cep = formData.get("cep") as string || null
  const logradouro = formData.get("logradouro") as string || null
  const numero = formData.get("numero") as string || null
  const bairro = formData.get("bairro") as string || null
  const cidade = formData.get("cidade") as string || null
  const uf = formData.get("uf") as string || null
  const responsavel = formData.get("responsavel") as string || null
  const observacoes = formData.get("observacoes") as string || null

  if (!nome || !telefone || !data_nascimento) {
    return { error: "Preencha nome, telefone e data de nascimento" }
  }

  const { error } = await admin.from("pacientes").insert({
    clinica_id: clinicaId,
    nome,
    cpf,
    data_nascimento,
    sexo,
    telefone_whatsapp: telefone,
    email,
    cep,
    logradouro,
    numero,
    bairro,
    cidade,
    uf,
    responsavel_legal: responsavel,
    observacoes_criticas: observacoes,
    origem: "manual",
  })

  if (error) return { error: error.message }

  revalidatePath("/pacientes")
  return { success: true }
}

export async function salvarAnamnese(_prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const clinicaId = await getClinicaId(supabase)
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const pacienteId = formData.get("paciente_id") as string
  const profissionalId = formData.get("profissional_id") as string
  const questionario = formData.get("questionario") as string
  const assinatura = formData.get("assinatura") as string

  if (!pacienteId || !profissionalId || !questionario) {
    return { error: "Preencha todos os campos obrigatórios" }
  }

  const { data: paciente } = await admin
    .from("pacientes")
    .select("clinica_id")
    .eq("id", pacienteId)
    .maybeSingle()

  if (!paciente || paciente.clinica_id !== clinicaId) {
    return { error: "Paciente não encontrado ou não pertence a esta clínica" }
  }

  const assinaturaHash = assinatura
    ? Buffer.from(assinatura + pacienteId + profissionalId).toString("base64")
    : Buffer.from(questionario + pacienteId + profissionalId).toString("base64")

  const { error } = await supabase.from("anamneses").insert({
    paciente_id: pacienteId,
    profissional_id: profissionalId,
    questionario_respondido: JSON.parse(questionario),
    assinatura_digital_hash: assinaturaHash,
  })

  if (error) return { error: error.message }

  revalidatePath(`/anamnese/${pacienteId}`)
  return { success: true }
}

export async function atualizarTelefoneUrgencia(profissionalId: string, telefoneUrgencia: string) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const clinicaId = await getClinicaId(supabase)
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const { data: profissional } = await admin
    .from("profissionais")
    .select("clinica_id")
    .eq("id", profissionalId)
    .maybeSingle()

  if (!profissional || profissional.clinica_id !== clinicaId) {
    return { error: "Profissional não encontrado ou não pertence a esta clínica" }
  }

  const telefoneLimpo = telefoneUrgencia.replace(/\D/g, "")

  const { error } = await admin
    .from("profissionais")
    .update({ telefone_urgencia: telefoneLimpo })
    .eq("id", profissionalId)

  if (error) return { error: error.message }

  revalidatePath("/configuracoes")
  return { success: true }
}

export async function registrarConsentimentoLGPD(pacienteId: string, tipo: string, versao: string, consentido: boolean, ip?: string, userAgent?: string) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const clinicaId = await getClinicaId(supabase)
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const { error } = await admin.from("lgpd_consentimentos").insert({
    clinica_id: clinicaId,
    paciente_id: pacienteId || null,
    tipo_consentimento: tipo,
    versao_termo: versao,
    consentido,
    ip_address: ip || null,
    user_agent: userAgent || null,
  })

  if (error) return { error: error.message }

  if (pacienteId && consentido) {
    await admin.from("pacientes_potenciais")
      .update({ lgpd_consentimento: true, lgpd_consentimento_em: new Date().toISOString() })
      .eq("id", pacienteId)
  }

  return { success: true }
}

export async function solicitarExclusaoLGPD(pacienteId: string, tipo: string, motivo?: string) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const clinicaId = await getClinicaId(supabase)
  if (!clinicaId) return { error: "Usuário não vinculado a uma clínica" }

  const { error } = await admin.from("lgpd_solicitacoes").insert({
    clinica_id: clinicaId,
    paciente_id: pacienteId,
    tipo,
    motivo: motivo || null,
    status: "pendente",
  })

  if (error) return { error: error.message }

  return { success: true }
}
