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
import { salvarClinica, salvarPerfil, salvarConfiguracaoBot } from "../actions"

const supabase = createClient()

export default function ConfiguracoesPage() {
  const [clinica, setClinica] = useState<any>(null)
  const [perfil, setPerfil] = useState<any>(null)
  const [configBot, setConfigBot] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [state, formAction, pending] = useActionState(salvarClinica, null)
  const [perfilState, perfilAction, perfilPending] = useActionState(salvarPerfil, null)
  const [botState, botAction, botPending] = useActionState(salvarConfiguracaoBot, null)

  useEffect(() => {
    const load = async () => {
      const [{ data: clinicaData }, { data: auth }, { data: botData }] = await Promise.all([
        supabase.from("clinicas").select("*").single(),
        supabase.auth.getUser(),
        supabase.from("configuracoes_bot").select("*").maybeSingle(),
      ])
      if (clinicaData) setClinica(clinicaData)
      if (botData) setConfigBot(botData)

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
              <CardTitle>Assistente Virtual (Bot)</CardTitle>
              <CardDescription>
                Configurações usadas para confirmar agendamentos por WhatsApp (Z-API) e sincronizar
                com o Google Calendar automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={botAction} className="space-y-4">
                {loading ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10" />)}
                  </div>
                ) : (
                  <>
                    {botState?.error && (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {botState.error}
                      </div>
                    )}
                    {botState?.success && (
                      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                        <Check className="h-4 w-4" />
                        Configurações do bot salvas com sucesso
                      </div>
                    )}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="nome_clinica" className="text-white/70">Nome da clínica (usado pelo bot)</Label>
                        <Input id="nome_clinica" name="nome_clinica" defaultValue={configBot?.nome_clinica ?? ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone" className="text-white/70">Telefone da clínica</Label>
                        <Input id="telefone" name="telefone" defaultValue={configBot?.telefone ?? ""} placeholder="(11) 0000-0000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp" className="text-white/70">Número WhatsApp (Z-API)</Label>
                        <Input id="whatsapp" name="whatsapp" defaultValue={configBot?.whatsapp ?? ""} placeholder="(11) 90000-0000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="horario_funcionamento" className="text-white/70">Horário de funcionamento</Label>
                        <Input id="horario_funcionamento" name="horario_funcionamento" defaultValue={configBot?.horario_funcionamento ?? ""} placeholder="seg a sex 08:00-18:00" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="google_calendar_id" className="text-white/70">Google Calendar ID</Label>
                        <Input id="google_calendar_id" name="google_calendar_id" defaultValue={configBot?.google_calendar_id ?? ""} placeholder="ex: seuemail@group.calendar.google.com" />
                        <p className="text-xs text-white/40">
                          ID da agenda Google que receberá os agendamentos automáticos criados no sistema.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">Conexão com Google Calendar</p>
                          <p className="text-xs text-white/40">
                            {configBot?.google_refresh_token
                              ? "Conectado — novos agendamentos são criados automaticamente na agenda acima."
                              : "Não conectado. Sem isso, os agendamentos não são sincronizados com o Google Calendar."}
                          </p>
                        </div>
                        {configBot?.google_refresh_token ? (
                          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                            <Check className="h-3.5 w-3.5" /> Conectado
                          </span>
                        ) : (
                          <Button type="button" variant="outline" size="sm" asChild>
                            <a href="/api/auth/google">Conectar Google Calendar</a>
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mensagem_boas_vindas" className="text-white/70">Mensagem de boas-vindas</Label>
                      <textarea
                        id="mensagem_boas_vindas"
                        name="mensagem_boas_vindas"
                        defaultValue={configBot?.mensagem_boas_vindas ?? ""}
                        rows={2}
                        className="flex w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mensagem_urgencia" className="text-white/70">Mensagem para casos de urgência</Label>
                      <textarea
                        id="mensagem_urgencia"
                        name="mensagem_urgencia"
                        defaultValue={configBot?.mensagem_urgencia ?? ""}
                        rows={2}
                        className="flex w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transferencia_humano" className="text-white/70">Mensagem de transferência para atendimento humano</Label>
                      <textarea
                        id="transferencia_humano"
                        name="transferencia_humano"
                        defaultValue={configBot?.transferencia_humano ?? ""}
                        rows={2}
                        className="flex w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-white/70">
                      <input
                        type="checkbox"
                        name="ativo"
                        value="true"
                        defaultChecked={configBot?.ativo ?? true}
                        className="h-4 w-4 rounded border-white/20 bg-white/5"
                      />
                      Bot ativo
                    </label>
                    <Button type="submit" disabled={botPending}>
                      {botPending ? "Salvando..." : "Salvar Configurações do Bot"}
                    </Button>
                  </>
                )}
              </form>
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
