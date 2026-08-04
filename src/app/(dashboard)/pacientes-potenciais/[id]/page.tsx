"use client"

import { useState, useEffect } from "react"
import { PageTransition } from "@/components/ui/page-transition"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useConversasBot } from "@/lib/queries"
import { converterPacientePotencial, atualizarStatusPotencial } from "../../actions"
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Calendar,
  Clock,
  FileText,
  UserPlus,
  RefreshCw,
  Bot,
  MessageSquare,
  Zap,
} from "lucide-react"
import type { PacientePotencial } from "@/types/database"

const supabase = createClient()

const statusMap: Record<string, { label: string; variant: "warning" | "success" | "default" | "secondary" | "destructive" }> = {
  novo_lead: { label: "Novo Lead", variant: "secondary" },
  lead_em_conversa: { label: "Em Conversa", variant: "default" },
  lead_agendamento: { label: "Quer Agendar", variant: "success" },
  atendimento_humano: { label: "Atend. Humano", variant: "warning" },
  em_triagem: { label: "Em Triagem", variant: "warning" },
  agendou: { label: "Agendou", variant: "success" },
  convertido: { label: "Convertido", variant: "default" },
  desistiu: { label: "Desistiu", variant: "destructive" },
  inativo: { label: "Inativo", variant: "secondary" },
}

export default function PotencialDetalhe() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { toast } = useToast()

  const [potencial, setPotencial] = useState<PacientePotencial | null>(null)
  const [loading, setLoading] = useState(true)
  const [convertendo, setConvertendo] = useState(false)
  const { data: conversas, loading: conversasLoading } = useConversasBot(id)

  const [nome, setNome] = useState("")
  const [dataNascimento, setDataNascimento] = useState("")
  const [telefone, setTelefone] = useState("")

  useEffect(() => {
    supabase.from("pacientes_potenciais").select("*").eq("id", id).single().then(({ data, error }) => {
      if (data) {
        setPotencial(data as PacientePotencial)
        setNome(data.nome || "")
        setTelefone(data.telefone || "")
        if (data.data_nascimento) {
          setDataNascimento(new Date(data.data_nascimento).toISOString().split("T")[0])
        }
      }
      setLoading(false)
    })
  }, [id])

  async function handleConverter(formData: FormData) {
    setConvertendo(true)
    formData.set("potencial_id", id)
    const result = await converterPacientePotencial(null, formData)
    if (result?.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
      setConvertendo(false)
    }
  }

  async function handleMudarStatus(status: string) {
    const formData = new FormData()
    formData.set("id", id)
    formData.set("status", status)
    const result = await atualizarStatusPotencial(null, formData)
    if (result?.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    } else {
      setPotencial((prev) => prev ? { ...prev, status: status as PacientePotencial["status"] } : prev)
      toast({ title: "Status atualizado" })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (!potencial) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/40">Potencial paciente não encontrado</p>
      </div>
    )
  }

  const anamnese = potencial.anamnese as Record<string, string>
  const statusInfo = statusMap[potencial.status] || statusMap.em_triagem

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/pacientes-potenciais">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {potencial.nome || "Anônimo"}
            </h1>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <p className="text-sm text-white/50">
            {potencial.canal === "whatsapp" ? "Contato via WhatsApp" : "Contato via Telegram"} · {new Date(potencial.created_at).toLocaleDateString("pt-BR")}
            {potencial.total_conversas > 0 && <> · {potencial.total_conversas} mensagens</>}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Converter em Paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleConverter} className="space-y-4">
              <input type="hidden" name="potencial_id" value={id} />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input id="nome" name="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
                  <Input id="data_nascimento" name="data_nascimento" type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input id="telefone" name="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" disabled={convertendo}>
                {convertendo ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                {convertendo ? "Convertendo..." : "Converter em Paciente"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {["novo_lead", "lead_em_conversa", "lead_agendamento", "atendimento_humano", "em_triagem", "agendou", "desistiu", "inativo"].map((s) => (
              <Button
                key={s}
                variant={potencial.status === s ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => handleMudarStatus(s)}
              >
                {statusMap[s]?.label || s}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Anamnese do Bot
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(anamnese).length === 0 ? (
            <p className="text-white/40 text-sm">Nenhuma informação de anamnese coletada</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(anamnese).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <p className="text-xs text-white/40 capitalize">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm text-white bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                    {String(value)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {(potencial.queixa_principal || potencial.regiao_dente || potencial.urgencia) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Dados Extraídos pela IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {potencial.queixa_principal && (
                <div className="space-y-1">
                  <p className="text-xs text-white/40">Queixa Principal</p>
                  <p className="text-sm text-white bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                    {potencial.queixa_principal}
                  </p>
                </div>
              )}
              {potencial.regiao_dente && (
                <div className="space-y-1">
                  <p className="text-xs text-white/40">Região / Dente</p>
                  <p className="text-sm text-white bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                    {potencial.regiao_dente}
                  </p>
                </div>
              )}
              {potencial.urgencia && (
                <div className="space-y-1">
                  <p className="text-xs text-white/40">Nível de Urgência</p>
                  <p className="text-sm text-white bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                    {potencial.urgencia === "alta" ? "🔴 Alta" : potencial.urgencia === "media" ? "🟡 Média" : potencial.urgencia === "baixa" ? "🟢 Baixa" : potencial.urgencia}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Histórico da Conversa
          </CardTitle>
        </CardHeader>
        <CardContent>
          {conversasLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : conversas.length === 0 ? (
            <p className="text-white/40 text-sm">Nenhuma conversa registrada</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {conversas.map((c) => (
                <div key={c.id} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                      <MessageCircle className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white/60">Paciente</span>
                        <span className="text-[10px] text-white/30">{new Date(c.created_at).toLocaleString("pt-BR")}</span>
                      </div>
                      <p className="text-sm text-white/80 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.06]">
                        {c.mensagem_usuario}
                      </p>
                    </div>
                  </div>
                  {c.resposta_bot && (
                    <div className="flex items-start gap-2 ml-6">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 mt-0.5">
                        <Bot className="h-3 w-3 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-emerald-400/60">Lia (Bot)</span>
                          {c.intencao && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                              {c.intencao}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-white/80 bg-emerald-500/[0.04] rounded-lg px-3 py-2 border border-emerald-500/10">
                          {c.resposta_bot}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {potencial.ultima_mensagem && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Última Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/70 bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
              {potencial.ultima_mensagem}
            </p>
            {potencial.ultima_interacao && (
              <p className="text-xs text-white/40 mt-2">
                {new Date(potencial.ultima_interacao).toLocaleString("pt-BR")}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </PageTransition>
  )
}
