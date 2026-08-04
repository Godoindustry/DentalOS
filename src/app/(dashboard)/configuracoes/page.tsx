"use client"

import { useState, useEffect, useActionState } from "react"
import { PageTransition } from "@/components/ui/page-transition"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Bell, Shield, Palette, Check, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { salvarClinica, salvarPerfil } from "../actions"

const supabase = createClient()

export default function ConfiguracoesPage() {
  const [clinica, setClinica] = useState<any>(null)
  const [perfil, setPerfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [state, formAction, pending] = useActionState(salvarClinica, null)
  const [perfilState, perfilAction, perfilPending] = useActionState(salvarPerfil, null)

  useEffect(() => {
    const load = async () => {
      const [{ data: clinicaData }, { data: auth }] = await Promise.all([
        supabase.from("clinicas").select("*").single(),
        supabase.auth.getUser(),
      ])
      if (clinicaData) setClinica(clinicaData)

      const user = auth.user
      if (user) {
        const { data: profissional } = await supabase
          .from("profissionais")
          .select("nome, especialidade_principal, cro, uf_cro")
          .eq("user_id", user.id)
          .maybeSingle()
        setPerfil({
          nome: profissional?.nome ?? user.user_metadata?.nome ?? "",
          especialidade: profissional?.especialidade_principal ?? "",
          cro: profissional?.cro ?? "",
          uf_cro: profissional?.uf_cro ?? "",
        })
      }

        setLoading(false)
    }
    load()
  }, [])

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Configurações</h1>
        <p className="text-sm text-white/50">Gerencie as configurações da sua clínica</p>
      </div>

      <Tabs defaultValue="clinica">
        <TabsList>
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="clinica" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Clínica
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="aparencia" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Profissional</CardTitle>
              <CardDescription>
                Essas informacoes aparecem no topo do sistema e devem vir do cadastro do usuario.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={perfilAction} className="space-y-4">
                {loading ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10" />)}
                  </div>
                ) : (
                  <>
                    {perfilState?.error && (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {perfilState.error}
                      </div>
                    )}
                    {perfilState?.success && (
                      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                        <Check className="h-4 w-4" />
                        Perfil salvo com sucesso
                      </div>
                    )}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="nome" className="text-white/70">Nome exibido</Label>
                        <Input id="nome" name="nome" defaultValue={perfil?.nome ?? ""} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="especialidade" className="text-white/70">Especialidade</Label>
                        <Input id="especialidade" name="especialidade" defaultValue={perfil?.especialidade ?? ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cro" className="text-white/70">CRO</Label>
                        <Input id="cro" name="cro" defaultValue={perfil?.cro ?? ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="uf_cro" className="text-white/70">UF do CRO</Label>
                        <Input id="uf_cro" name="uf_cro" defaultValue={perfil?.uf_cro ?? ""} maxLength={2} />
                      </div>
                    </div>
                    <Button type="submit" disabled={perfilPending}>
                      {perfilPending ? "Salvando..." : "Salvar Perfil"}
                    </Button>
                  </>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinica" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Clínica</CardTitle>
              <CardDescription>
                Informações cadastrais da sua clínica odontológica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={formAction} className="space-y-4">
                {loading ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10" />)}
                  </div>
                ) : (
                  <>
                    {state?.error && (
                      <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                        {state.error}
                      </div>
                    )}
                    {state?.success && (
                      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Dados salvos com sucesso
                      </div>
                    )}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="nome_fantasia" className="text-white/70">Nome Fantasia</Label>
                        <Input
                          id="nome_fantasia"
                          name="nome_fantasia"
                          defaultValue={clinica?.nome_fantasia ?? ""}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="razao_social" className="text-white/70">Razão Social</Label>
                        <Input
                          id="razao_social"
                          name="razao_social"
                          defaultValue={clinica?.razao_social ?? ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cnpj" className="text-white/70">CNPJ</Label>
                        <Input
                          id="cnpj"
                          name="cnpj"
                          defaultValue={clinica?.cnpj ?? ""}
                          placeholder="00.000.000/0000-00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="plano" className="text-white/70">Plano de Assinatura</Label>
                        <Input
                          id="plano"
                          defaultValue={clinica?.plano_assinatura === "pro" ? "Profissional" : clinica?.plano_assinatura === "premium" ? "Premium" : "Básico"}
                          disabled
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={pending}>
                      {pending ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Configure os alertas e notificações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/50">
                Em breve: integração com WhatsApp e e-mail transacional.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Configurações de segurança e controle de acesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/50">
                Em breve: políticas RLS, logs de auditoria e MFA.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>
                Personalize a aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/50">
                Em breve: tema claro/escuro e customização de marca.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTransition>
  )
}
