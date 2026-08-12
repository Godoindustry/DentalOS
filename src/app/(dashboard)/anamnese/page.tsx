"use client"

import { useState, useEffect } from "react"
import { PageTransition } from "@/components/ui/page-transition"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { FileText, Search, Plus, Filter } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export default function AnamnesePage() {
  const [anamneses, setAnamneses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    supabase
      .from("anamneses")
      .select("id, finalizado_em, pacientes (nome), profissionais (nome)")
      .order("finalizado_em", { ascending: false })
      .then(({ data }) => {
        setAnamneses(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = search.trim()
    ? anamneses.filter((a) =>
        (a as any).pacientes?.nome?.toLowerCase().includes(search.toLowerCase())
      )
    : anamneses

  const finalizadas = anamneses.length
  const pendentes = 0

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Anamnese</h1>
          <p className="text-sm text-muted-foreground">Prontuário clínico e fichas de anamnese</p>
        </div>
        <Button asChild>
          <Link href="/anamnese/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova Anamnese
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { titulo: "Total de Anamneses", valor: anamneses.length, cor: "text-foreground" },
          { titulo: "Finalizadas", valor: finalizadas, cor: "text-emerald-400" },
          { titulo: "Pendentes", valor: pendentes, cor: "text-amber-400" },
        ].map((item) => (
          <Card key={item.titulo}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground/70">{item.titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <span className={`text-2xl font-bold ${item.cor}`}>{item.valor}</span>
                  <p className="text-xs text-muted-foreground mt-1">Registros no sistema</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              placeholder="Buscar por paciente..."
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
                <TableHead className="text-muted-foreground">Data</TableHead>
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
                    {search ? "Nenhuma anamnese encontrada para esta busca" : "Nenhuma anamnese registrada ainda"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((ana) => (
                  <TableRow key={ana.id} className="hover:bg-card border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{(ana as any).pacientes?.nome ?? "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {ana.finalizado_em
                        ? new Date(ana.finalizado_em).toLocaleDateString("pt-BR")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{(ana as any).profissionais?.nome ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="success">Finalizado</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/anamnese/${ana.id}`}>Visualizar</Link>
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
