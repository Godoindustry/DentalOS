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
import { Plus, Search, Syringe } from "lucide-react"
import { useProcedimentos, formatCurrency } from "@/lib/queries"

export default function ProcedimentosPage() {
  const { data: procedimentos, loading } = useProcedimentos()
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return procedimentos
    const term = search.toLowerCase()
    return procedimentos.filter(
      (p) =>
        p.nome_servico.toLowerCase().includes(term) ||
        p.categoria.toLowerCase().includes(term)
    )
  }, [procedimentos, search])

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Procedimentos</h1>
          <p className="text-sm text-muted-foreground">Gerencie os procedimentos e a precificação da clínica</p>
        </div>
        <Button asChild>
          <Link href="/procedimentos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Procedimento
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              placeholder="Buscar procedimento..."
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
                <TableHead className="text-muted-foreground">Procedimento</TableHead>
                <TableHead className="text-muted-foreground">Categoria</TableHead>
                <TableHead className="text-muted-foreground">Preço Venda</TableHead>
                <TableHead className="text-muted-foreground">Custo Total</TableHead>
                <TableHead className="text-muted-foreground">Margem</TableHead>
                <TableHead className="text-muted-foreground">Tempo</TableHead>
                <TableHead className="text-right text-muted-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-16" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    {search ? "Nenhum procedimento encontrado para esta busca" : "Nenhum procedimento cadastrado ainda"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((proc) => {
                  const custoTotal = (proc.custo_insumos_direto || 0) + (proc.custo_laboratorio || 0)
                  const margem = proc.preco_venda > 0
                    ? ((proc.preco_venda - custoTotal) / proc.preco_venda * 100).toFixed(0)
                    : "0"
                  return (
                    <TableRow key={proc.id} className="hover:bg-card border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Syringe className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{proc.nome_servico}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{proc.categoria}</Badge></TableCell>
                      <TableCell className="text-foreground">{formatCurrency(proc.preco_venda)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatCurrency(custoTotal)}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-emerald-400">{margem}%</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{proc.tempo_estimado_minutos}min</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/procedimentos/${proc.id}`}>Editar</Link>
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
