"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { UFS_BRASIL } from "@/lib/validations"

const UF_SET = new Set<string>(UFS_BRASIL)

export async function loginAction(_prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) return { error: "E-mail e senha são obrigatórios" }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "E-mail inválido" }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) return { error: error.message }

  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) return { error: "Não foi possível validar a sessão após o login" }
  const clinicaId = user.user_metadata?.clinica_id

  const admin = createAdminClient()

  let precisaAtualizarSessao = false

  if (clinicaId) {
    const { data: clinica } = await admin
      .from("clinicas")
      .select("id")
      .eq("id", clinicaId)
      .maybeSingle()
    if (!clinica) {
      const { data: newClinica } = await admin
        .from("clinicas")
        .insert({ nome_fantasia: "Minha Clínica", plano_assinatura: "basic" })
        .select("id")
        .single()
      if (newClinica) {
        await admin.auth.admin.updateUserById(user.id, {
          user_metadata: { ...user.user_metadata, clinica_id: newClinica.id },
        })
        precisaAtualizarSessao = true
      }
    }
  } else {
    const { data: clinica } = await admin
      .from("clinicas")
      .insert({ nome_fantasia: "Minha Clínica", plano_assinatura: "basic" })
      .select("id")
      .single()
    if (clinica) {
      await admin.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, clinica_id: clinica.id },
      })
      precisaAtualizarSessao = true
    }
  }

  if (precisaAtualizarSessao) {
    await supabase.auth.refreshSession()
  }

  redirect("/dashboard")
}

export async function signupAction(_prevState: { success: boolean; error: string } | null, formData: FormData) {
  const nome = formData.get("nome") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const cro = (formData.get("cro") as string || "").trim()
  const ufCro = (formData.get("uf_cro") as string || "").trim().toUpperCase()

  if (!nome || !email || !password || !cro || !ufCro) return { success: false, error: "Preencha todos os campos" }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false, error: "E-mail inválido" }
  if (password.length < 6) return { success: false, error: "A senha deve ter no mínimo 6 caracteres" }
  if (!/^\d{3,6}$/.test(cro)) return { success: false, error: "CRO deve conter de 3 a 6 dígitos numéricos" }
  if (!UF_SET.has(ufCro)) return { success: false, error: "UF do CRO inválida" }

  const admin = createAdminClient()

  // 1. Criar clínica demo
  const { data: clinica, error: clinicaError } = await admin
    .from("clinicas")
    .insert({ nome_fantasia: `Clínica da Dra. ${nome}`, plano_assinatura: "basic" })
    .select("id")
    .single()

  if (clinicaError) {
    console.error("[signupAction] clinicaError:", clinicaError)
    const msg = clinicaError.message || "Erro ao criar clínica"
    if (msg.includes("relation") || msg.includes("does not exist")) {
      return { success: false, error: "Erro: tabela de clínicas não encontrada. Contate o suporte." }
    }
    return { success: false, error: `Erro ao criar clínica: ${msg}` }
  }

  // 2. Tentar criar usuário via admin API
  const { data: authData, error: signUpError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome, clinica_id: clinica.id, role: "titular" },
  })

  let userId = authData?.user?.id ?? null

  // 3. Se admin API falhar, tentar via RPC (diretamente no banco)
  if (signUpError || !authData?.user) {
    const { data: rpcResult, error: rpcError } = await admin.rpc("criar_usuario_demo", {
      p_email: email,
      p_password: password,
      p_nome: nome,
      p_clinica_id: clinica.id,
    })

    if (rpcError || (rpcResult as { error?: string })?.error) {
      await admin.from("clinicas").delete().eq("id", clinica.id)
      const msg = (rpcResult as { error?: string })?.error || rpcError?.message || signUpError?.message
      return { success: false, error: msg || "Erro ao criar usuário" }
    }
    userId = (rpcResult as { user_id?: string })?.user_id ?? null
  }

  // 3.1 Cria o registro de profissional titular vinculado à conta
  if (userId) {
    const { error: profError } = await admin.from("profissionais").insert({
      clinica_id: clinica.id,
      user_id: userId,
      nome,
      cro,
      uf_cro: ufCro,
      role: "titular",
    })
    if (profError) console.error("[signupAction] profError:", profError)
  }

  // 4. Login automático
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError) {
    return { success: false, error: "Conta criada, mas não foi possível entrar automaticamente. Vá para o login." }
  }

  redirect("/dashboard")
}
