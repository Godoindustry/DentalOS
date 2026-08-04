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
  })
  if (!parsed.success) return { error: firstZodError(parsed.error) }
  const dados = parsed.data

  const { error } = await supabase.from("profissionais").insert({
    clinica_id: clinicaId,
    user_id: user.user?.id,
    nome: dados.nome,
    cro: dados.cro,
    uf_cro: dados.uf_cro,
    especialidade_principal: dados.especialidade || null,
    porcentagem_comissao: dados.comissao,
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
