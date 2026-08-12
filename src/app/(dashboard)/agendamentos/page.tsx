"use client"

import { useState, useEffect, useMemo } from "react"
import { PageTransition } from "@/components/ui/page-transition"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { CalendarAgenda } from "@/components/calendar-agenda"
import { CalendarDays, List, Plus, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

const statusMap: Record<string, { label: string; variant: "success" | "default" | "warning" | "secondary" | "destructive" }> = {
  agendado: { label: "Agendado", variant: "default" },
  confirmado_wpp: { label: "Confirmado", variant: "success" },
  cancelado: { label: "Cancelado", variant: "destructive" },
  em_atendimento: { label: "Em Atendimento", variant: "warning" },
  finalizado: { label: "Finalizado", variant: "secondary" },
}

type ModoVisao = "lista" | "calendario"

export default function AgendamentosPage() {
  const router = useRouter()
  const [agendamentos, setAgendamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modo, setModo] = useState<ModoVisao>("lista")

  useEffect(() => {
    supabase
      .from("agendamentos")
      .select("*, pacientes (nome), profissionais (nome)")
      .order("data_hora_inicio", { ascending: false })
      .then(({ data }) => {
        setAgendamentos(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return agendamentos
    const term = search.toLowerCase()
    return agendamentos.filter(
      (a) =>
        (a as any).pacientes?.nome?.toLowerCase().includes(term) ||
        (a as any).profissionais?.nome?.toLowerCase().includes(term)
    )
  }, [agendamentos, search])

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Agendamentos</h1>
          <p className="text-sm text-muted-foreground">Gerencie a agenda da clínica</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border p-0.5 bg-card">
            <button
              onClick={() => setModo("lista")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                modo === "lista" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Lista
            </button>
            <button
              onClick={() => setModo("calendario")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                modo === "calendario" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Calendário
            </button>
          </div>
          <Button asChild>
            <Link href="/agendamentos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Link>
          </Button>
        </div>
      </div>

      {modo === "lista" ? (
        <Card>
          <CardHeader>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                placeholder="Buscar por paciente ou profissional..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">Data/Hora</TableHead>
                  <TableHead className="text-muted-foreground">Paciente</TableHead>
                  <TableHead className="text-muted-foreground">Profissional</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      {search ? "Nenhum agendamento encontrado para esta busca" : "Nenhum agendamento encontrado"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((ag) => {
                    const statusInfo = statusMap[ag.status] || { label: ag.status, variant: "default" as const }
                    const dataHora = new Date(ag.data_hora_inicio).toLocaleString("pt-BR", {
                      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                    })
                    return (
                      <TableRow key={ag.id} className="hover:bg-card border-border">
                        <TableCell className="font-medium text-foreground">{dataHora}</TableCell>
                        <TableCell className="text-foreground">{(ag as any).pacientes?.nome ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{(ag as any).profissionais?.nome ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/pacientes/${ag.paciente_id}`}>Ver Paciente</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <CalendarAgenda
          agendamentos={loading ? [] : filtered}
          onSelectPaciente={(pacienteId) => router.push(`/pacientes/${pacienteId}`)}
        />
      )}
    </PageTransition>
  )
}
