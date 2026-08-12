"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const statusMap: Record<string, { label: string; variant: "success" | "default" | "warning" | "secondary" | "destructive" }> = {
  agendado: { label: "Agendado", variant: "default" },
  confirmado_wpp: { label: "Confirmado", variant: "success" },
  cancelado: { label: "Cancelado", variant: "destructive" },
  em_atendimento: { label: "Em Atendimento", variant: "warning" },
  finalizado: { label: "Finalizado", variant: "secondary" },
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

interface CalendarAgendaProps {
  agendamentos: any[]
  onSelectPaciente: (pacienteId: string) => void
}

export function CalendarAgenda({ agendamentos, onSelectPaciente }: CalendarAgendaProps) {
  const hoje = new Date()
  const [mesAtual, setMesAtual] = useState(hoje.getMonth())
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear())
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null)

  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate()
  const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay()

  const appointmentsPorDia = useMemo(() => {
    const map = new Map<number, any[]>()
    for (const a of agendamentos) {
      const d = new Date(a.data_hora_inicio)
      if (d.getMonth() === mesAtual && d.getFullYear() === anoAtual) {
        const dia = d.getDate()
        if (!map.has(dia)) map.set(dia, [])
        map.get(dia)!.push(a)
      }
    }
    return map
  }, [agendamentos, mesAtual, anoAtual])

  const diasComEvento = new Set(appointmentsPorDia.keys())

  const appointmentsHoje = diaSelecionado ? appointmentsPorDia.get(diaSelecionado) ?? [] : []
  const appointmentsCount = appointmentsHoje.length

  const mesNome = new Date(anoAtual, mesAtual).toLocaleDateString("pt-BR", { month: "long" })

  const navegar = (dir: number) => {
    let novoMes = mesAtual + dir
    let novoAno = anoAtual
    if (novoMes > 11) { novoMes = 0; novoAno++ }
    if (novoMes < 0) { novoMes = 11; novoAno-- }
    setMesAtual(novoMes)
    setAnoAtual(novoAno)
    setDiaSelecionado(null)
  }

  const hojeEDia = hoje.getDate()
  const hojeEMes = hoje.getMonth()
  const hojeEAno = hoje.getFullYear()

  const celulas: (number | null)[] = []
  for (let i = 0; i < primeiroDiaSemana; i++) celulas.push(null)
  for (let d = 1; d <= diasNoMes; d++) celulas.push(d)

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_320px]">
      {/* Grid do calendário */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => navegar(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm font-semibold text-foreground capitalize">
            {mesNome} {anoAtual}
          </p>
          <Button variant="ghost" size="icon" onClick={() => navegar(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="text-center text-xs text-muted-foreground/70 font-medium py-2">
              {d}
            </div>
          ))}
          {celulas.map((dia, i) => {
            if (dia === null) return <div key={`empty-${i}`} />
            const isHoje = dia === hojeEDia && mesAtual === hojeEMes && anoAtual === hojeEAno
            const isSelecionado = dia === diaSelecionado
            const temEvento = diasComEvento.has(dia)
            return (
              <motion.button
                key={dia}
                onClick={() => setDiaSelecionado(isSelecionado ? null : dia)}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "relative flex items-center justify-center h-10 w-full rounded-xl text-sm transition-colors",
                  isSelecionado
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : isHoje
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-foreground/70 hover:bg-card"
                )}
              >
                {dia}
                {temEvento && (
                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                    <span className={cn(
                      "h-1 w-1 rounded-full",
                      isSelecionado ? "bg-primary" : "bg-primary/50"
                    )} />
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Sidebar: compromissos do dia */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {diaSelecionado
            ? `${diaSelecionado} de ${mesNome}`
            : "Selecione um dia"}
        </p>
        {diaSelecionado === null ? (
          <p className="text-xs text-muted-foreground/70 py-8 text-center">
            Clique em um dia para ver os agendamentos
          </p>
        ) : appointmentsCount === 0 ? (
          <p className="text-xs text-muted-foreground/70 py-8 text-center">
            Nenhum agendamento neste dia
          </p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {appointmentsHoje
              .sort((a, b) => new Date(a.data_hora_inicio).getTime() - new Date(b.data_hora_inicio).getTime())
              .map((a: any) => {
                const info = statusMap[a.status] ?? { label: a.status, variant: "default" as const }
                const hora = new Date(a.data_hora_inicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                const horaFim = new Date(a.data_hora_fim).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                return (
                  <div
                    key={a.id}
                    className="rounded-xl border border-border bg-card p-3 space-y-1.5 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => onSelectPaciente(a.paciente_id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {(a as any).pacientes?.nome ?? "—"}
                      </span>
                      <Badge variant={info.variant} className="text-[10px] px-1.5 py-0">
                        {info.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{hora} - {horaFim}</span>
                      <span>·</span>
                      <span>{(a as any).profissionais?.nome ?? "—"}</span>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
