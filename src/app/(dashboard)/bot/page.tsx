"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { PageTransition } from "@/components/ui/page-transition"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MessageCircle,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bot,
  TrendingUp,
  ArrowRight,
  MessageSquare,
  CalendarCheck,
  Phone,
  Activity,
} from "lucide-react"
import { usePacientesPotenciais, useBotStats, useConversasRecentes } from "@/lib/queries"

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  novo_lead: { label: "Novo Lead", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  lead_em_conversa: { label: "Em Conversa", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  lead_agendamento: { label: "Quer Agendar", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  atendimento_humano: { label: "Atend. Humano", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  em_triagem: { label: "Em Triagem", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  agendou: { label: "Agendou", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  convertido: { label: "Convertido", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  desistiu: { label: "Desistiu", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  inativo: { label: "Inativo", color: "text-muted-foreground", bg: "bg-card", border: "border-border" },
}

const canalLabel: Record<string, string> = {
  telegram: "Telegram",
  whatsapp: "WhatsApp",
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function KpiCard({ title, value, icon: Icon, loading, color }: {
  title: string; value: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  loading: boolean; color: string
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="group relative overflow-hidden transition-all duration-300 hover:border-border">
        <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: color }} />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${color}15` }}>
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function BotPage() {
  const { data: pacientes, loading: pacientesLoading } = usePacientesPotenciais()
  const { data: conversasRecentes, loading: conversasLoading } = useConversasRecentes(10)
  const { stats, loading: statsLoading } = useBotStats()

  const recentes = useMemo(() => {
    return [...pacientes].sort(
      (a, b) => new Date(b.ultima_interacao || b.created_at).getTime() - new Date(a.ultima_interacao || a.created_at).getTime()
    ).slice(0, 10)
  }, [pacientes])

  const anamneseSummary = useMemo(() => {
    const reasons: Record<string, number> = {}
    const procedimentos: Record<string, number> = {}
    for (const p of pacientes) {
      if (p.queixa_principal) {
        const key = p.queixa_principal.slice(0, 60)
        reasons[key] = (reasons[key] || 0) + 1
      } else if (p.anamnese?.reason && typeof p.anamnese.reason === "string") {
        const key = (p.anamnese.reason as string).slice(0, 60)
        reasons[key] = (reasons[key] || 0) + 1
      }
      if (p.anamnese?.desired_procedure && typeof p.anamnese.desired_procedure === "string") {
        const key = (p.anamnese.desired_procedure as string).slice(0, 60)
        procedimentos[key] = (procedimentos[key] || 0) + 1
      }
    }
    return {
      reasons: Object.entries(reasons).sort((a, b) => b[1] - a[1]).slice(0, 5),
      procedimentos: Object.entries(procedimentos).sort((a, b) => b[1] - a[1]).slice(0, 5),
    }
  }, [pacientes])

  return (
    <PageTransition className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Assistente Virtual</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe os atendimentos do bot Telegram e gerencie os leads
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
          <span className="text-xs font-medium text-emerald-400">
            {statsLoading ? "..." : `${stats.sessoesAtivas} conversas`}
          </span>
        </div>
      </motion.div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <KpiCard title="Total de Leads" value={stats.totalLeads.toString()} icon={MessageCircle} loading={statsLoading} color="#4FD1C5" />
        <KpiCard title="Novos" value={stats.novoLead.toString()} icon={Activity} loading={statsLoading} color="#A78BFA" />
        <KpiCard title="Em Conversa" value={stats.emConversa.toString()} icon={MessageSquare} loading={statsLoading} color="#60A5FA" />
        <KpiCard title="Querem Agendar" value={stats.leadAgendamento.toString()} icon={CalendarCheck} loading={statsLoading} color="#6EE7B7" />
        <KpiCard title="Atend. Humano" value={stats.atendimentoHumano.toString()} icon={Phone} loading={statsLoading} color="#FB923C" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Conversas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pacientesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-[68px] w-full rounded-xl" />
                  ))}
                </div>
              ) : recentes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground/70">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card mb-4">
                    <Bot className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Nenhuma conversa ainda</p>
                  <p className="text-xs mt-1">As conversas do bot Telegram aparecerão aqui</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentes.map((p, i) => {
                    const cfg = statusConfig[p.status] || statusConfig.novo_lead
                    return (
                      <Link
                        key={p.id}
                        href={`/pacientes-potenciais/${p.id}`}
                        className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all duration-200 hover:border-border hover:bg-card"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate group-hover:text-foreground">
                              {p.nome || "Anônimo"}
                            </p>
                            {p.canal && canalLabel[p.canal] && (
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                                {canalLabel[p.canal]}
                              </span>
                            )}
                            {p.urgencia === "alta" && (
                              <span className="text-[10px] uppercase tracking-wider text-red-400 font-medium">
                                URGENTE
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
                            {p.etapa_atual && (
                              <>
                                <span className="text-muted-foreground/60">·</span>
                                <span className="text-xs text-muted-foreground">{p.etapa_atual.replace(/_/g, " ")}</span>
                              </>
                            )}
                            {p.telefone && (
                              <>
                                <span className="text-muted-foreground/60">·</span>
                                <span className="text-xs text-muted-foreground">{p.telefone}</span>
                              </>
                            )}
                          </div>
                          {p.ultima_mensagem && (
                            <p className="text-xs text-muted-foreground/70 mt-1 truncate max-w-md">
                              "{p.ultima_mensagem}"
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">
                            {p.ultima_interacao
                              ? new Date(p.ultima_interacao).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                              : "–"}
                          </p>
                          <p className="text-[11px] text-muted-foreground/70">
                            {p.ultima_interacao
                              ? new Date(p.ultima_interacao).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                              : ""}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors shrink-0" />
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Status dos Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-8 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(statusConfig).map(([key, cfg]) => {
                    const count = stats[key as keyof typeof stats] as number
                    const total = stats.totalLeads || 1
                    const pct = ((count / total) * 100).toFixed(0)
                    return (
                      <div key={key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-2.5 w-2.5 rounded-full ${cfg.bg}`} style={{ background: cfg.color.replace("text-", "").replace("amber", "#FBBF77").replace("emerald", "#6EE7B7").replace("sky", "#7DD3FC").replace("red", "#FCA5A5").replace("white", "rgba(255,255,255,0.4)") }} />
                          <span className="text-sm text-foreground/70">{cfg.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{count}</span>
                          <span className="text-xs text-muted-foreground/70">{pct}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {anamneseSummary.reasons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Motivos Mais Comuns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {anamneseSummary.reasons.map(([reason, count]) => (
                    <div key={reason} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                      <span className="text-sm text-foreground/70 truncate mr-2">{reason}</span>
                      <span className="text-sm font-medium text-foreground shrink-0">{count}x</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button variant="outline" className="w-full" asChild>
            <Link href="/pacientes-potenciais">
              <MessageCircle className="h-4 w-4 mr-2" />
              Ver Todos os Leads
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </PageTransition>
  )
}
