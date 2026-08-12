"use client"

import { useState, useEffect } from "react"
import { PageTransition } from "@/components/ui/page-transition"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { ProfessionalLayout } from "@/components/odontograma"
import { formatCurrency } from "@/lib/queries"
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Activity,
  DollarSign,
  Stethoscope,
  Clock,
  Edit3,
  Plus,
  Receipt,
} from "lucide-react"
import type { Paciente } from "@/types/database"

const supabase = createClient()

const statusAgendaMap: Record<string, { label: string; variant: "success" | "default" | "warning" | "secondary" | "destructive" }> = {
  agendado: { label: "Agendado", variant: "default" },
  confirmado_wpp: { label: "Confirmado", variant: "success" },
  cancelado: { label: "Cancelado", variant: "destructive" },
  em_atendimento: { label: "Em Atendimento", variant: "warning" },
  finalizado: { label: "Finalizado", variant: "secondary" },
}

export default function PacienteDetalhe() {
  const params = useParams()
  const id = params.id as string
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [totalTreatment, setTotalTreatment] = useState(0)

  useEffect(() => {
    supabase.from("pacientes").select("*").eq("id", id).single().then(({ data, error }) => {
      if (data) setPaciente(data as Paciente)
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true)
      const { data: agendamentos } = await supabase
        .from("agendamentos")
        .select("id, data_hora_inicio, status, profissionais (nome)")
        .eq("paciente_id", id)
        .order("data_hora_inicio", { ascending: false })
        .limit(50)

      const { data: faturamentos } = await supabase
        .from("faturamento")
        .select("id, valor_bruto_pago, data_competencia, agendamento_id, procedimentos (nome_servico)")
        .eq("paciente_id", id)
        .order("data_competencia", { ascending: false })
        .limit(50)

      const agendaMap = new Map<string, any>()
      for (const a of agendamentos ?? []) {
        agendaMap.set(a.id, a)
      }

      const combined: any[] = []
      let total = 0

      for (const f of faturamentos ?? []) {
        const ag = f.agendamento_id ? agendaMap.get(f.agendamento_id) : null
        combined.push({
          id: f.id,
          data: f.data_competencia,
          data_hora: ag?.data_hora_inicio ?? f.data_competencia,
          procedimento: (f as any).procedimentos?.nome_servico ?? "—",
          valor: Number(f.valor_bruto_pago),
          profissional: (ag as any)?.profissionais?.nome ?? "—",
          status: "finalizado",
          tipo: "faturamento",
        })
        total += Number(f.valor_bruto_pago)
      }

      for (const a of agendamentos ?? []) {
        if (!a.data_hora_inicio) continue
        const exists = combined.some(
          (c) => c.id === a.id && c.tipo === "faturamento"
        )
        if (!exists) {
          combined.push({
            id: a.id,
            data: a.data_hora_inicio,
            data_hora: a.data_hora_inicio,
            procedimento: "—",
            valor: 0,
            profissional: (a as any).profissionais?.nome ?? "—",
            status: a.status,
            tipo: "agendamento",
          })
        }
      }

      combined.sort(
        (a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime()
      )

      setHistory(combined)
      setTotalTreatment(total)
      setHistoryLoading(false)
    }

    if (id) fetchHistory()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Paciente não encontrado</p>
      </div>
    )
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/pacientes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{paciente.nome}</h1>
            <Badge variant="success">Ativo</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Prontuário completo do paciente</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/pacientes/novo?edit=${paciente.id}`}>
            <Edit3 className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
        <Button asChild>
          <Link href="/agendamentos">
            <Plus className="mr-2 h-4 w-4" />
            Agendar Consulta
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { icon: User, label: "CPF", value: paciente.cpf || "–" },
          { icon: Phone, label: "WhatsApp", value: paciente.telefone_whatsapp },
          { icon: Mail, label: "E-mail", value: paciente.email || "–" },
          { icon: Calendar, label: "Nascimento", value: `${new Date(paciente.data_nascimento).toLocaleDateString("pt-BR")}${paciente.sexo ? ` · ${paciente.sexo === "M" ? "Masc" : "Fem"}` : ""}` },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-3 pt-4 pb-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground truncate">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {paciente.observacoes_criticas && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="text-sm font-semibold text-amber-400 mb-1">Observações Críticas</p>
          <p className="text-sm text-foreground/70">{paciente.observacoes_criticas}</p>
        </div>
      )}

      <Tabs defaultValue="odontograma">
        <TabsList>
          <TabsTrigger value="odontograma" className="gap-2">
            <Stethoscope className="h-4 w-4" />
            Odontograma
          </TabsTrigger>
          <TabsTrigger value="dados" className="gap-2">
            <FileText className="h-4 w-4" />
            Dados
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2">
            <Activity className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="odontograma" className="mt-6">
          <ProfessionalLayout pacienteId={id} />
        </TabsContent>

        <TabsContent value="dados" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados Cadastrais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { label: "Nome Completo", value: paciente.nome },
                  { label: "CPF", value: paciente.cpf || "–" },
                  { label: "Data de Nascimento", value: new Date(paciente.data_nascimento).toLocaleDateString("pt-BR") },
                  { label: "Sexo", value: paciente.sexo === "M" ? "Masculino" : paciente.sexo === "F" ? "Feminino" : "–" },
                  { label: "Telefone / WhatsApp", value: paciente.telefone_whatsapp },
                  { label: "E-mail", value: paciente.email || "–" },
                  { label: "CEP", value: paciente.cep || "–" },
                  { label: "Logradouro", value: paciente.logradouro || "–" },
                  { label: "Número", value: paciente.numero || "–" },
                  { label: "Bairro", value: paciente.bairro || "–" },
                  { label: "Cidade", value: paciente.cidade || "–" },
                  { label: "UF", value: paciente.uf || "–" },
                  { label: "Responsável Legal", value: paciente.responsavel_legal || "–" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground bg-card border border-border rounded-lg px-3 py-2">{item.value}</p>
                  </div>
                ))}
              </div>
              {paciente.observacoes_criticas && (
                <div className="mt-4 space-y-1">
                  <p className="text-xs text-muted-foreground">Observações Críticas</p>
                  <p className="text-sm text-foreground bg-card border border-amber-500/30 rounded-lg px-3 py-2">{paciente.observacoes_criticas}</p>
                </div>
              )}
              <div className="mt-4 flex gap-3">
                <Button variant="outline" asChild>
                  <Link href={`/anamnese/nova?paciente=${paciente.id}`}>Nova Anamnese</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atendimentos</CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Clock className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">Nenhum atendimento registrado</p>
                  <p className="text-xs mt-1">Agende uma consulta para o paciente</p>
                  <Button className="mt-4" asChild>
                    <Link href="/agendamentos">
                      <Plus className="mr-2 h-4 w-4" />
                      Agendar Consulta
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((h) => {
                    const statusInfo = statusAgendaMap[h.status] ?? { label: h.status, variant: "default" as const }
                    return (
                      <div
                        key={`${h.tipo}-${h.id}`}
                        className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          {h.tipo === "faturamento" ? (
                            <DollarSign className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Calendar className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-foreground">
                              {h.procedimento !== "—" ? h.procedimento : "Consulta agendada"}
                            </p>
                            {h.valor > 0 && (
                              <span className="text-sm font-semibold text-emerald-400">
                                {formatCurrency(h.valor)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(h.data_hora).toLocaleDateString("pt-BR", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                            {" "}&middot;{" "}
                            {h.profissional !== "—" ? h.profissional : "—"}
                          </p>
                        </div>
                        <Badge variant={statusInfo.variant} className="shrink-0">
                          {statusInfo.label}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <Skeleton className="h-24" />
              ) : history.filter((h) => h.valor > 0).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <DollarSign className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">Nenhum registro financeiro encontrado</p>
                  <p className="text-xs mt-1">Os lançamentos aparecerão automaticamente após o faturamento</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <span className="text-sm text-foreground/70">Total Geral do Tratamento</span>
                    <span className="text-xl font-bold text-emerald-400">{formatCurrency(totalTreatment)}</span>
                  </div>
                  <div className="space-y-2">
                    {history
                      .filter((h) => h.valor > 0)
                      .map((h) => (
                        <div
                          key={`fin-${h.tipo}-${h.id}`}
                          className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
                        >
                          <div>
                            <p className="text-sm text-foreground">{h.procedimento}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(h.data_hora).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-emerald-400">
                            {formatCurrency(h.valor)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTransition>
  )
}
