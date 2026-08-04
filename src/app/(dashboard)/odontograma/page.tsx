"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { Search, UserRound } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { PageTransition } from "@/components/ui/page-transition"
import { ProfessionalLayout } from "@/components/odontograma/odontograma-profissional-layout"
import { Odontograma } from "@/components/odontograma/odontograma"
import { createClient } from "@/lib/supabase/client"
import type { Paciente } from "@/types/database"

const supabase = createClient()

export default function OdontogramaPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    supabase
      .from("pacientes")
      .select("*")
      .order("nome", { ascending: true })
      .then(({ data }) => {
        const rows = (data ?? []) as Paciente[]
        setPacientes(rows)
        setSelectedPaciente(rows[0] ?? null)
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return pacientes
    const term = search.toLowerCase()
    return pacientes.filter((paciente) =>
      paciente.nome.toLowerCase().includes(term) ||
      paciente.cpf?.toLowerCase().includes(term)
    )
  }, [pacientes, search])

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Odontograma</h1>
          <p className="text-sm text-muted-foreground">Selecione um paciente e marque dentes, faces e condutas clinicas.</p>
        </div>
        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base">Pacientes</CardTitle>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar paciente..." className="pl-10" readOnly />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-14 w-full" />)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nenhum paciente selecionado</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[520px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Odontograma</h1>
        <p className="text-sm text-muted-foreground">Selecione um paciente e marque dentes, faces e condutas clinicas.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Pacientes</CardTitle>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente..."
                className="pl-10"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              [1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-14 w-full" />)
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-border bg-accent/40 px-3 py-8 text-center text-sm text-muted-foreground">
                Nenhum paciente encontrado.
              </div>
            ) : (
              filtered.map((paciente) => {
                const active = selectedPaciente?.id === paciente.id
                return (
                  <motion.button
                    key={paciente.id}
                    type="button"
                    onClick={() => setSelectedPaciente(paciente)}
                    whileTap={{ scale: 0.98 }}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                      active
                        ? "border-primary/35 bg-primary/10 text-foreground"
                        : "border-border bg-accent/30 text-foreground/70 hover:border-foreground/15 hover:bg-accent/60"
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
                      <UserRound className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{paciente.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">{paciente.cpf || "Sem CPF registrado"}</p>
                    </div>
                  </motion.button>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-base">
              <span>{selectedPaciente ? selectedPaciente.nome : "Nenhum paciente selecionado"}</span>
              {selectedPaciente && (
                <Link href={`/pacientes/${selectedPaciente.id}`} className="text-xs font-medium text-primary hover:text-primary/80">
                  Abrir prontuario
                </Link>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[520px] w-full" />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedPaciente?.id ?? "empty"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {selectedPaciente ? (
                    <ProfessionalLayout pacienteId={selectedPaciente.id} nomePaciente={selectedPaciente.nome} />
                  ) : (
                    <Odontograma />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
