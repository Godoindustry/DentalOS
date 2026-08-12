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
import { Plus, Search, User, Calendar } from "lucide-react"
import { usePacientes, calculateAge } from "@/lib/queries"

export default function PacientesPage() {
  const { data: pacientes, loading } = usePacientes()
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return pacientes
    const term = search.toLowerCase()
    return pacientes.filter(
      (p) =>
        p.nome.toLowerCase().includes(term) ||
        (p.cpf && p.cpf.includes(term))
    )
  }, [pacientes, search])

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Pacientes</h1>
          <p className="text-sm text-muted-foreground">Gerencie o cadastro de pacientes da clínica</p>
        </div>
        <Button asChild>
          <Link href="/pacientes/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Paciente
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              placeholder="Buscar por nome ou CPF..."
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
                <TableHead className="text-muted-foreground">Paciente</TableHead>
                <TableHead className="text-muted-foreground">CPF</TableHead>
                <TableHead className="text-muted-foreground">Telefone</TableHead>
                <TableHead className="text-muted-foreground">Idade</TableHead>
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
                    {search ? "Nenhum paciente encontrado para esta busca" : "Nenhum paciente cadastrado ainda"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((paciente) => (
                  <TableRow key={paciente.id} className="hover:bg-card border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{paciente.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{paciente.cpf || "–"}</TableCell>
                    <TableCell className="text-muted-foreground">{paciente.telefone_whatsapp}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {calculateAge(paciente.data_nascimento)} anos
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/pacientes/${paciente.id}`}>Ver Prontuário</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageTransition>
  )
}
