"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { PageTransition } from "@/components/ui/page-transition"
import Link from "next/link"
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
import { DollarSign, Search, Download, TrendingUp, TrendingDown, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/queries"

const supabase = createClient()

const accentColors = {
  teal: { bar: "#4FD1C5", bg: "rgba(79,209,197,0.13)" },
  emerald: { bar: "#6EE7B7", bg: "rgba(110,231,183,0.12)" },
  amber: { bar: "#FBBF77", bg: "rgba(251,191,119,0.12)" },
}

const statusPagamentoMap: Record<string, { label: string; variant: "success" | "default" | "warning" }> = {
  pago: { label: "Pago", variant: "success" },
  pendente: { label: "Pendente", variant: "warning" },
  estornado: { label: "Estornado", variant: "default" },
}

const formaPagamentoLabels: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  credito_a_vista: "Crédito à Vista",
  parcelado: "Parcelado",
  debito: "Débito",
}

export default function FaturamentoPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    supabase
      .from("faturamento")
      .select("*, pacientes (nome), procedimentos (nome_servico), profissionais (nome)")
      .order("data_competencia", { ascending: false })
      .then(({ data: rows }) => {
        setData(rows ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const term = search.toLowerCase()
    return data.filter(
      (f) =>
        (f as any).pacientes?.nome?.toLowerCase().includes(term) ||
        (f as any).procedimentos?.nome_servico?.toLowerCase().includes(term)
    )
  }, [data, search])

  const totals = useMemo(() => {
    let bruto = 0, comissao = 0, lucro = 0
    for (const f of data) {
      bruto += Number(f.valor_bruto_pago) || 0
      comissao += Number(f.comissao_retida_dentista) || 0
      lucro += Number(f.lucro_liquido_clinica) || 0
    }
    return { bruto, comissao, lucro }
  }, [data])

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Faturamento</h1>
          <p className="text-sm text-white/50">Controle financeiro e análise de lucratividade</p>
        </div>
        <Button variant="outline" disabled>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { titulo: "Faturamento Bruto", valor: formatCurrency(totals.bruto), icon: DollarSign, color: accentColors.teal },
          { titulo: "Comissões Pagas", valor: formatCurrency(totals.comissao), icon: TrendingDown, color: accentColors.amber },
          { titulo: "Lucro Líquido", valor: formatCurrency(totals.lucro), icon: TrendingUp, color: accentColors.emerald },
        ].map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.titulo}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="group relative overflow-hidden transition-all duration-300 hover:border-white/[0.15] hover:shadow-lg hover:shadow-black/20">
                <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: item.color.bar }} />
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
                  <CardTitle className="text-sm font-medium text-white/60">{item.titulo}</CardTitle>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-300 group-hover:brightness-125" style={{ background: item.color.bg }}>
                    <Icon className="h-4 w-4" style={{ color: item.color.bar }} />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  {loading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-bold tracking-tight text-white">{item.valor}</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              placeholder="Buscar por paciente ou procedimento..."
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
                <TableHead className="text-white/50">Data</TableHead>
                <TableHead className="text-white/50">Paciente</TableHead>
                <TableHead className="text-white/50">Procedimento</TableHead>
                <TableHead className="text-white/50">Profissional</TableHead>
                <TableHead className="text-white/50">Valor Bruto</TableHead>
                <TableHead className="text-white/50">Comissão</TableHead>
                <TableHead className="text-white/50">Lucro Líquido</TableHead>
                <TableHead className="text-white/50">Status</TableHead>
                <TableHead className="text-right text-white/50">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-16" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-white/40">
                    {search ? "Nenhum lançamento encontrado" : "Nenhum faturamento registrado ainda"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((fat) => {
                  const statusInfo = statusPagamentoMap[fat.status_pagamento] ?? { label: fat.status_pagamento, variant: "default" as const }
                  return (
                    <TableRow key={fat.id} className="hover:bg-white/[0.03] border-white/[0.06]">
                      <TableCell className="text-white/60">
                        {new Date(fat.data_competencia).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {(fat as any).pacientes?.nome ?? "—"}
                      </TableCell>
                      <TableCell className="text-white/60">
                        {(fat as any).procedimentos?.nome_servico ?? "—"}
                      </TableCell>
                      <TableCell className="text-white/60">
                        {(fat as any).profissionais?.nome ?? "—"}
                      </TableCell>
                      <TableCell className="text-white/80">{formatCurrency(Number(fat.valor_bruto_pago))}</TableCell>
                      <TableCell className="text-white/60">{formatCurrency(Number(fat.comissao_retida_dentista))}</TableCell>
                      <TableCell className="font-semibold text-[#6EE7B7]">
                        {formatCurrency(Number(fat.lucro_liquido_clinica))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/faturamento/${fat.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
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
