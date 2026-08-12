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
import { Building2, Bell, Shield, Palette, Check, User, FileText } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { salvarClinica, salvarPerfil, salvarConfiguracaoBot } from "../actions"
import { TestBotButton } from "@/components/test-bot-button"
import { registrarConsentimentoLGPD, solicitarExclusaoLGPD } from "@/app/(dashboard)/actions"

const supabase = createClient()

export default function ConfiguracoesPage() {
  const [clinica, setClinica] = useState<any>(null)
  const [perfil, setPerfil] = useState<any>(null)
  const [configBot, setConfigBot] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState("")
  const [googleMessage, setGoogleMessage] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState(salvarClinica, null)
  const [perfilState, perfilAction, perfilPending] = useActionState(salvarPerfil, null)
  const [botState, botAction, botPending] = useActionState(salvarConfiguracaoBot, null)
  const [lgpdState, lgpdAction, lgpdPending] = useActionState(async () => ({ success: true }), null)

  useEffect(() => {
    setOrigin(typeof window !== "undefined" ? window.location.origin : "")
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const googleStatus = params.get("google")
    const message = params.get("message")

    if (googleStatus === "connected") {
      setGoogleMessage("Google Calendar conectado com sucesso!")
    } else if (googleStatus === "error") {
      setGoogleMessage(message === "code_ou_state_ausentes" ? "Erro: código ou state ausentes no callback." : "Erro ao conectar com Google Calendar.")
    }

    if (googleStatus) {
      const url = new URL(window.location.href)
      url.searchParams.delete("google")
      url.searchParams.delete("message")
      window.history.replaceState({}, "", url)
    }
  }, [])

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
          .select("nome, especialidade_principal, cro, uf_cro, telefone_urgencia")
          .eq("user_id", user.id)
          .maybeSingle()
        setPerfil({
          nome: profissional?.nome ?? user.user_metadata?.nome ?? "",
          especialidade: profissional?.especialidade_principal ?? "",
          cro: profissional?.cro ?? "",
          uf_cro: profissional?.uf_cro ?? "",
          telefone_urgencia: profissional?.telefone_urgencia ?? "",
        })
      }

        setLoading(false)
    }
    load()
  }, [])

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie as configurações da sua clínica</p>
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
          <TabsTrigger value="lgpd" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            LGPD
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
                        <Label htmlFor="nome" className="text-foreground/70">Nome exibido</Label>
                        <Input id="nome" name="nome" defaultValue={perfil?.nome ?? ""} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="especialidade" className="text-foreground/70">Especialidade</Label>
                        <Input id="especialidade" name="especialidade" defaultValue={perfil?.especialidade ?? ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cro" className="text-foreground/70">CRO</Label>
                        <Input id="cro" name="cro" defaultValue={perfil?.cro ?? ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="uf_cro" className="text-foreground/70">UF do CRO</Label>
                        <Input id="uf_cro" name="uf_cro" defaultValue={perfil?.uf_cro ?? ""} maxLength={2} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="telefone_urgencia" className="text-foreground/70">Telefone para Urgências</Label>
                        <Input
                          id="telefone_urgencia"
                          name="telefone_urgencia"
                          defaultValue={perfil?.telefone_urgencia ?? ""}
                          placeholder="(11) 90000-0000"
                        />
                        <p className="text-xs text-muted-foreground">
                          Quando um paciente selecionar "Atendimento Urgente" no bot, o contato será direcionado para este número.
                        </p>
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
                        <Label htmlFor="nome_fantasia" className="text-foreground/70">Nome Fantasia</Label>
                        <Input
                          id="nome_fantasia"
                          name="nome_fantasia"
                          defaultValue={clinica?.nome_fantasia ?? ""}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="razao_social" className="text-foreground/70">Razão Social</Label>
                        <Input
                          id="razao_social"
                          name="razao_social"
                          defaultValue={clinica?.razao_social ?? ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cnpj" className="text-foreground/70">CNPJ</Label>
                        <Input
                          id="cnpj"
                          name="cnpj"
                          defaultValue={clinica?.cnpj ?? ""}
                          placeholder="00.000.000/0000-00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="plano" className="text-foreground/70">Plano de Assinatura</Label>
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
                        <Label htmlFor="nome_clinica" className="text-foreground/70">Nome da clínica (usado pelo bot)</Label>
                        <Input id="nome_clinica" name="nome_clinica" defaultValue={configBot?.nome_clinica ?? ""} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone" className="text-foreground/70">Telefone da clínica</Label>
                        <Input id="telefone" name="telefone" defaultValue={configBot?.telefone ?? ""} placeholder="(11) 0000-0000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp" className="text-foreground/70">Número WhatsApp (Z-API)</Label>
                        <Input id="whatsapp" name="whatsapp" defaultValue={configBot?.whatsapp ?? ""} placeholder="(11) 90000-0000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="horario_funcionamento" className="text-foreground/70">Horário de funcionamento</Label>
                        <Input id="horario_funcionamento" name="horario_funcionamento" defaultValue={configBot?.horario_funcionamento ?? ""} placeholder="seg a sex 08:00-18:00" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="n8n_webhook_url" className="text-foreground/70">Webhook n8n</Label>
                        <Input id="n8n_webhook_url" name="n8n_webhook_url" defaultValue={configBot?.n8n_webhook_url ?? ""} placeholder="https://n8n.seudominio.com/webhook/odontolab-bot" />
                        <p className="text-xs text-muted-foreground">
                          Cole aqui a URL do webhook do seu fluxo n8n. Quando salvar, a Z-API será automaticamente configurada para enviar mensagens recebidas para esse endereço.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="n8n_webhook_secret" className="text-foreground/70">Segredo do Webhook n8n</Label>
                        <Input id="n8n_webhook_secret" name="n8n_webhook_secret" type="password" defaultValue={configBot?.n8n_webhook_secret ?? ""} placeholder="Segredo para validar assinatura HMAC" />
                        <p className="text-xs text-muted-foreground">
                          Use o mesmo segredo configurado no n8n para validar que as requisições são legítimas.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ia_model" className="text-foreground/70">Modelo de IA</Label>
                        <Input id="ia_model" name="ia_model" defaultValue={configBot?.ia_model ?? "llama-3.1-8b-instant"} placeholder="llama-3.1-8b-instant" />
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">Conexão com Google Calendar</p>
                          <p className="text-xs text-muted-foreground">
                            {configBot?.google_refresh_token
                              ? "Conectado — novos agendamentos são criados automaticamente na agenda acima."
                              : "Não conectado. Sem isso, os agendamentos não são sincronizados com o Google Calendar."}
                          </p>
                          {googleMessage && (
                            <p className={`text-xs mt-1 ${googleMessage.includes("sucesso") ? "text-emerald-400" : "text-red-400"}`}>
                              {googleMessage}
                            </p>
                          )}
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
                      <Label htmlFor="mensagem_boas_vindas" className="text-foreground/70">Mensagem de boas-vindas</Label>
                      <textarea
                        id="mensagem_boas_vindas"
                        name="mensagem_boas_vindas"
                        defaultValue={configBot?.mensagem_boas_vindas ?? ""}
                        rows={2}
                        className="flex w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mensagem_urgencia" className="text-foreground/70">Mensagem para casos de urgência</Label>
                      <textarea
                        id="mensagem_urgencia"
                        name="mensagem_urgencia"
                        defaultValue={configBot?.mensagem_urgencia ?? ""}
                        rows={2}
                        className="flex w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transferencia_humano" className="text-foreground/70">Mensagem de transferência para atendimento humano</Label>
                      <textarea
                        id="transferencia_humano"
                        name="transferencia_humano"
                        defaultValue={configBot?.transferencia_humano ?? ""}
                        rows={2}
                        className="flex w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
                      />
                    </div>
                    <input
                      type="hidden"
                      name="webhook_slug"
                      value={configBot?.webhook_slug || ""}
                    />
                    <label className="flex items-center gap-2 text-sm text-foreground/70">
                      <input
                        type="checkbox"
                        name="ativo"
                        value="true"
                        defaultChecked={configBot?.ativo ?? true}
                        className="h-4 w-4 rounded border-border bg-card"
                      />
                      Bot ativo
                    </label>

                    {configBot?.webhook_slug && (
                      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">URL do seu Webhook n8n</p>
                        <p className="text-xs text-muted-foreground">
                          Use esta URL no n8n como endpoint do webhook:
                        </p>
                        <code className="block w-full break-all rounded-lg bg-black/30 px-3 py-2 text-xs text-primary">
                          {origin}/api/bot/n8n/{configBot.webhook_slug}
                        </code>
                        <p className="text-[11px] text-muted-foreground/70">
                          Não compartilhe essa URL publicamente. Use o segredo abaixo para validar as requisições.
                        </p>
                      </div>
                    )}

                    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Testar envio de mensagem</p>
                      <p className="text-xs text-muted-foreground">
                        Envie uma mensagem de teste para <strong className="text-foreground/70">{configBot?.whatsapp || "+55 11 966230438"}</strong> para verificar se a Z-API está conectada.
                      </p>
                      <TestBotButton whatsapp={configBot?.whatsapp} />
                    </div>

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
              <p className="text-sm text-muted-foreground">
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
              <p className="text-sm text-muted-foreground">
                Em breve: tema claro/escuro e customização de marca.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lgpd">
          <Card>
            <CardHeader>
              <CardTitle>LGPD e Privacidade</CardTitle>
              <CardDescription>
                Gerencie consentimentos e solicitações de dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Consentimento</p>
                  <p className="text-xs text-muted-foreground">
                    Registre o consentimento do paciente para tratamento de dados.
                  </p>
                  <Button variant="outline" className="w-full" disabled>
                    <FileText className="mr-2 h-4 w-4" />
                    Ver Consentimentos
                  </Button>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Exportar Dados</p>
                  <p className="text-xs text-muted-foreground">
                    Exporte dados dos pacientes para cumprimento de portabilidade.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/pacientes/exportar">Exportar CSV</Link>
                  </Button>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Exclusão</p>
                  <p className="text-xs text-muted-foreground">
                    Solicite exclusão de dados pessoais (direito ao esquecimento).
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/lgpd">Gerenciar Solicitações</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTransition>
  )
}
