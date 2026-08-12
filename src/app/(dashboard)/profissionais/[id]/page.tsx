"use client"

import { useActionState, useState } from "react"
import { useParams } from "next/navigation"
import { PageTransition } from "@/components/ui/page-transition"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Stethoscope, ShieldCheck, ShieldAlert, ExternalLink, Bot, Copy } from "lucide-react"
import { editarProfissional, marcarCroVerificado, salvarBotProfissional } from "../../actions"
import { useProfissional } from "@/lib/queries"
import { UFS_BRASIL } from "@/lib/validations"

export default function EditarProfissionalPage() {
  const params = useParams()
  const id = params.id as string
  const { data: prof, loading } = useProfissional(id)
  const [state, formAction, pending] = useActionState(editarProfissional, null)
  const [botState, botFormAction, botPending] = useActionState(salvarBotProfissional, null)
  const [croVerificado, setCroVerificado] = useState(false)
  const [verificando, setVerificando] = useState(false)
  const [croInicializado, setCroInicializado] = useState(false)

  if (prof && !croInicializado) {
    setCroVerificado(prof.cro_verificado)
    setCroInicializado(true)
  }

  async function handleMarcarVerificado() {
    setVerificando(true)
    const result = await marcarCroVerificado(id)
    if (result?.success) setCroVerificado(true)
    setVerificando(false)
  }

  if (loading) {
    return (
      <PageTransition className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </PageTransition>
    )
  }

  if (!prof) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profissionais"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Profissional não encontrado</h1>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profissionais">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{prof.nome}</h1>
          <p className="text-sm text-muted-foreground">Editar dados do profissional</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            Dados do Profissional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {state.error}
              </div>
            )}
            <input type="hidden" name="id" value={id} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-foreground/70">Nome Completo *</Label>
                <Input id="nome" name="nome" defaultValue={prof.nome} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="especialidade" className="text-foreground/70">Especialidade Principal</Label>
                <Input id="especialidade" name="especialidade" defaultValue={prof.especialidade_principal ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cro" className="text-foreground/70">CRO *</Label>
                <Input id="cro" name="cro" defaultValue={prof.cro} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf_cro" className="text-foreground/70">UF do CRO *</Label>
                <select
                  id="uf_cro"
                  name="uf_cro"
                  defaultValue={prof.uf_cro}
                  required
                  className="flex h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
                >
                  <option value="">UF</option>
                  {UFS_BRASIL.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comissao" className="text-foreground/70">Porcentagem de Comissão (%)</Label>
                <Input id="comissao" name="comissao" type="number" step="0.01" defaultValue={prof.porcentagem_comissao} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm">
                    {croVerificado ? (
                      <>
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-400">CRO verificado manualmente</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-4 w-4 text-amber-400" />
                        <span className="text-amber-400">CRO ainda não verificado</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <a href="https://busca-profissionais.cfo.org.br/" target="_blank" rel="noopener noreferrer">
                        Verificar no CFO <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </a>
                    </Button>
                    {!croVerificado && (
                      <Button type="button" size="sm" disabled={verificando} onClick={handleMarcarVerificado}>
                        {verificando ? "Marcando..." : "Marcar como verificado"}
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Não existe API pública para validar CRO automaticamente. Confira no site oficial do CFO
                  (nome + CRO + UF) e marque como verificado depois de confirmar.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ativo" className="text-foreground/70">Status</Label>
                <select
                  id="ativo" name="ativo"
                  defaultValue={String(prof.ativo)}
                  className="flex h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/profissionais">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            Bot de WhatsApp deste profissional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={(fd) => { fd.set("profissional_id", id); botFormAction(fd) }} className="space-y-6">
            {botState?.error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {botState.error}
              </div>
            )}
            {botState?.success && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
                Configuração do bot salva com sucesso
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-foreground/70">
              <input
                type="checkbox"
                name="bot_ativo"
                value="true"
                defaultChecked={prof.bot_ativo}
                className="h-4 w-4 rounded border-border bg-card"
              />
              Bot ativo para este profissional
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bot_whatsapp" className="text-foreground/70">Número WhatsApp (Z-API)</Label>
                <Input id="bot_whatsapp" name="bot_whatsapp" defaultValue={prof.bot_whatsapp ?? ""} placeholder="(11) 90000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bot_groq_key_slot" className="text-foreground/70">Chave Groq (n8n)</Label>
                <select
                  id="bot_groq_key_slot"
                  name="bot_groq_key_slot"
                  defaultValue={String(prof.bot_groq_key_slot ?? 1)}
                  className="flex h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
                >
                  <option value="1">Groq Key 1</option>
                  <option value="2">Groq Key 2</option>
                  <option value="3">Groq Key 3</option>
                </select>
                <p className="text-xs text-muted-foreground">Credencial cadastrada no n8n — ver seção &quot;Bot como secretária&quot;.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bot_zapi_instance_id" className="text-foreground/70">Z-API Instance ID</Label>
                <Input id="bot_zapi_instance_id" name="bot_zapi_instance_id" defaultValue={prof.bot_zapi_instance_id ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bot_zapi_token" className="text-foreground/70">Z-API Token</Label>
                <Input id="bot_zapi_token" name="bot_zapi_token" defaultValue={prof.bot_zapi_token ?? ""} type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bot_zapi_client_token" className="text-foreground/70">Z-API Client-Token</Label>
                <Input id="bot_zapi_client_token" name="bot_zapi_client_token" defaultValue={prof.bot_zapi_client_token ?? ""} type="password" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bot_mensagem_boas_vindas" className="text-foreground/70">Mensagem de boas-vindas (opcional)</Label>
                <Input id="bot_mensagem_boas_vindas" name="bot_mensagem_boas_vindas" defaultValue={prof.bot_mensagem_boas_vindas ?? ""} placeholder="Usa a mensagem padrão da clínica se vazio" />
              </div>
            </div>

            {prof.bot_webhook_slug && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <Label className="text-foreground/70">URL do webhook (configurar no n8n)</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-foreground break-all">
                    {typeof window !== "undefined" ? window.location.origin : ""}/api/bot/n8n/{prof.bot_webhook_slug}
                  </code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/bot/n8n/${prof.bot_webhook_slug}`)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            <Button type="submit" disabled={botPending}>
              {botPending ? "Salvando..." : "Salvar Bot"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageTransition>
  )
}
