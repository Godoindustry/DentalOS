"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function loginAction(_prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  })
  if (error) return { error: error.message }

  const { data: { user } } = await supabase.auth.getUser()
  const clinicaId = user?.user_metadata?.clinica_id

  const admin = createAdminClient()

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
        await admin.auth.admin.updateUserById(user!.id, {
          user_metadata: { ...user!.user_metadata, clinica_id: newClinica.id },
        })
      }
    }
  } else {
    const { data: clinica } = await admin
      .from("clinicas")
      .insert({ nome_fantasia: "Minha Clínica", plano_assinatura: "basic" })
      .select("id")
      .single()
    if (clinica) {
      await admin.auth.admin.updateUserById(user!.id, {
        user_metadata: { ...user!.user_metadata, clinica_id: clinica.id },
      })
    }
  }

  redirect("/dashboard")
}

export async function signupAction(_prevState: { success: boolean; error: string } | null, formData: FormData) {
  const nome = formData.get("nome") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!nome || !email || !password) return { success: false, error: "Preencha todos os campos" }
  if (password.length < 6) return { success: false, error: "A senha deve ter no mínimo 6 caracteres" }

  const admin = createAdminClient()

  // 1. Criar clínica demo
  const { data: clinica, error: clinicaError } = await admin
    .from("clinicas")
    .insert({ nome_fantasia: `Clínica da Dra. ${nome}`, plano_assinatura: "basic" })
    .select("id")
    .single()

  if (clinicaError) {
    console.error("[signupAction] clinicaError:", clinicaError)
    return { success: false, error: "Erro ao criar clínica" }
  }

  // 2. Tentar criar usuário via admin API
  const { data: authData, error: signUpError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome, clinica_id: clinica.id },
  })

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
  }

  // 4. Login automático
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError) {
    return { success: true, error: "", email }
  }

  redirect("/dashboard")
}
