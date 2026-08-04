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
import { Plus, Search, Stethoscope } from "lucide-react"
import { useProfissionais } from "@/lib/queries"

export default function ProfissionaisPage() {
  const { data: profissionais, loading } = useProfissionais()
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return profissionais
    const term = search.toLowerCase()
    return profissionais.filter(
      (p) =>
        p.nome.toLowerCase().includes(term) ||
        p.especialidade_principal?.toLowerCase().includes(term) ||
        p.cro.toLowerCase().includes(term)
    )
  }, [profissionais, search])

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Profissionais</h1>
          <p className="text-sm text-white/50">Gerencie os dentistas e profissionais da clínica</p>
        </div>
        <Button asChild>
          <Link href="/profissionais/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Profissional
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              placeholder="Buscar profissional..."
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
                <TableHead className="text-white/50">Profissional</TableHead>
                <TableHead className="text-white/50">CRO</TableHead>
                <TableHead className="text-white/50">Especialidade</TableHead>
                <TableHead className="text-white/50">Comissão</TableHead>
                <TableHead className="text-white/50">Status</TableHead>
                <TableHead className="text-right text-white/50">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-16" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-white/40">
                    {search ? "Nenhum profissional encontrado para esta busca" : "Nenhum profissional cadastrado ainda"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((prof) => (
                  <TableRow key={prof.id} className="hover:bg-white/[0.03] border-white/[0.06]">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <Stethoscope className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-white">{prof.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white/60">{prof.cro}-{prof.uf_cro}</TableCell>
                    <TableCell className="text-white/60">{prof.especialidade_principal || "–"}</TableCell>
                    <TableCell className="text-white/60">{prof.porcentagem_comissao}%</TableCell>
                    <TableCell>
                      <Badge variant={prof.ativo ? "success" : "secondary"}>
                        {prof.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/profissionais/${prof.id}`}>Editar</Link>
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
