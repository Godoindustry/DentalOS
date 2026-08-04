"use client"

import { useActionState, useEffect, useState } from "react"
import { PageTransition } from "@/components/ui/page-transition"
import Link from "next/link"
import { ArrowLeft, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { criarAgendamento } from "../../actions"

type Option = {
  id: string
  nome: string
}

const supabase = createClient()

export default function NovoAgendamentoPage() {
  const [state, formAction, pending] = useActionState(criarAgendamento, null)
  const [pacientes, setPacientes] = useState<Option[]>([])
  const [profissionais, setProfissionais] = useState<Option[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from("pacientes").select("id, nome").order("nome"),
      supabase.from("profissionais").select("id, nome").eq("ativo", true).order("nome"),
    ]).then(([pacientesResult, profissionaisResult]) => {
      setPacientes(pacientesResult.data ?? [])
      setProfissionais(profissionaisResult.data ?? [])
      setLoading(false)
    })
  }, [])

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/agendamentos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Novo Agendamento</h1>
          <p className="text-sm text-white/50">Reserve um horario na agenda da clinica</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            Dados da Consulta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="rounded-lg border border-[var(--clinical-red)]/20 bg-[var(--clinical-red)]/10 px-4 py-3 text-sm text-[var(--clinical-red)]">
                {state.error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="paciente_id" className="text-white/70">Paciente *</Label>
                <Select name="paciente_id" required disabled={loading || pending}>
                  <SelectTrigger id="paciente_id">
                    <SelectValue placeholder={loading ? "Carregando pacientes..." : "Selecione o paciente"} />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientes.map((paciente) => (
                      <SelectItem key={paciente.id} value={paciente.id}>
                        {paciente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profissional_id" className="text-white/70">Profissional *</Label>
                <Select name="profissional_id" required disabled={loading || pending}>
                  <SelectTrigger id="profissional_id">
                    <SelectValue placeholder={loading ? "Carregando profissionais..." : "Selecione o profissional"} />
                  </SelectTrigger>
                  <SelectContent>
                    {profissionais.map((profissional) => (
                      <SelectItem key={profissional.id} value={profissional.id}>
                        {profissional.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data" className="text-white/70">Data *</Label>
                <Input id="data" name="data" type="date" required disabled={pending} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora" className="text-white/70">Hora *</Label>
                <Input id="hora" name="hora" type="time" required disabled={pending} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracao" className="text-white/70">Duracao</Label>
                <select
                  id="duracao"
                  name="duracao"
                  defaultValue="30"
                  disabled={pending}
                  className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="90">1 hora e 30 minutos</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={pending || loading}>
                {pending ? "Agendando..." : "Salvar Agendamento"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/agendamentos">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageTransition>
  )
}
