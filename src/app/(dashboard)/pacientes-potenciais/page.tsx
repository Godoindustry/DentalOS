"use client"

import { useState, useMemo } from "react"
import { PageTransition } from "@/components/ui/page-transition"
import Link from "next/link"
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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageCircle, Search, User, Clock, AlertCircle, CheckCircle, XCircle, Phone, MessageSquare, Activity, CalendarCheck } from "lucide-react"
import { usePacientesPotenciais } from "@/lib/queries"

const statusConfig: Record<string, { label: string; variant: "warning" | "success" | "default" | "secondary" | "destructive"; icon: typeof Clock }> = {
  novo_lead: { label: "Novo Lead", variant: "secondary", icon: Activity },
  lead_em_conversa: { label: "Em Conversa", variant: "default", icon: MessageSquare },
  lead_agendamento: { label: "Quer Agendar", variant: "success", icon: CalendarCheck },
  atendimento_humano: { label: "Atend. Humano", variant: "warning", icon: Phone },
  em_triagem: { label: "Em Triagem", variant: "warning", icon: Clock },
  agendou: { label: "Agendou", variant: "success", icon: CheckCircle },
  convertido: { label: "Convertido", variant: "default", icon: CheckCircle },
  desistiu: { label: "Desistiu", variant: "destructive", icon: XCircle },
  inativo: { label: "Inativo", variant: "secondary", icon: AlertCircle },
}

export default function PacientesPotenciaisPage() {
  const { data: pacientes, loading } = usePacientesPotenciais()
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return pacientes
    const term = search.toLowerCase()
    return pacientes.filter(
      (p) => p.nome?.toLowerCase().includes(term) || p.telefone?.includes(term)
    )
  }, [pacientes, search])

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Potenciais Pacientes</h1>
          <p className="text-sm text-white/50">
            Pacientes que iniciaram contato pelo bot Telegram mas ainda não foram cadastrados
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              placeholder="Buscar por nome ou telefone..."
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
                <TableHead className="text-white/50">Paciente</TableHead>
                <TableHead className="text-white/50">Telefone</TableHead>
                <TableHead className="text-white/50">Status</TableHead>
                <TableHead className="text-white/50">Última Interação</TableHead>
                <TableHead className="text-right text-white/50">Ações</TableHead>
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
                  <TableCell colSpan={5} className="text-center py-12 text-white/40">
                    {search ? "Nenhum potencial paciente encontrado" : "Nenhum contato do bot Telegram ainda"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => {
                  const cfg = statusConfig[p.status] || statusConfig.em_triagem
                  return (
                    <TableRow key={p.id} className="hover:bg-white/[0.03] border-white/[0.06]">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <MessageCircle className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-white">{p.nome || "Anônimo"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/60">{p.telefone || "–"}</TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant}>
                          <cfg.icon className="h-3 w-3 mr-1" />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/60">
                        {p.ultima_interacao
                          ? new Date(p.ultima_interacao).toLocaleString("pt-BR")
                          : "–"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/pacientes-potenciais/${p.id}`}>Detalhes</Link>
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
    </PageTransition>
  )
}
