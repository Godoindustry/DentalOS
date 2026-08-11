"use client"

import { useActionState, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { PageTransition } from "@/components/ui/page-transition"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Building, DollarSign, Check, Plus } from "lucide-react"
import { useFinanceiroCadeiras, useProfissionais, formatCurrency } from "@/lib/queries"
import { criarCobrancaCadeira, marcarCobrancaPaga } from "../actions"

const statusMap: Record<string, { label: string; variant: "success" | "default" | "warning" }> = {
  pago: { label: "Pago", variant: "success" },
  pendente: { label: "Pendente", variant: "warning" },
  atrasado: { label: "Atrasado", variant: "default" },
}

function mesAtual() {
  return new Date().toISOString().slice(0, 7)
}

export default function FinanceiroCadeirasPage() {
  const { data: cobrancas, loading, refetch } = useFinanceiroCadeiras()
  const { data: profissionais } = useProfissionais()
  const [state, formAction, pending] = useActionState(criarCobrancaCadeira, null)
  const [tipoCobranca, setTipoCobranca] = useState<"fixo" | "percentual">("fixo")
  const [marcandoPago, setMarcandoPago] = useState<string | null>(null)

  const sublocatarios = useMemo(
    () => profissionais.filter((p) => p.role === "sublocatario"),
    [profissionais]
  )

  const totalMes = useMemo(() => {
    const atual = mesAtual()
    return cobrancas
      .filter((c) => c.competencia.startsWith(atual))
      .reduce((soma, c) => soma + Number(c.valor_calculado), 0)
  }, [cobrancas])

  const totalPendente = useMemo(
    () => cobrancas.filter((c) => c.status_pagamento !== "pago").reduce((soma, c) => soma + Number(c.valor_calculado), 0),
    [cobrancas]
  )

  async function handleMarcarPago(id: string) {
    setMarcandoPago(id)
    await marcarCobrancaPaga(id)
    await refetch()
    setMarcandoPago(null)
  }

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Cadeiras / Salas</h1>
        <p className="text-sm text-white/50">Repasse de sublocação recebido de dentistas parceiros</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { titulo: "Recebido no mês", valor: formatCurrency(totalMes), icon: DollarSign },
          { titulo: "Pendente de recebimento", valor: formatCurrency(totalPendente), icon: Building },
        ].map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div key={item.titulo} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-white/60">{item.titulo}</CardTitle>
                  <Icon className="h-4 w-4 text-white/40" />
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold text-white">{item.valor}</div>}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" /> Lançar cobrança de aluguel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4 md:grid-cols-5 items-end">
            {state?.error && (
              <div className="md:col-span-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {state.error}
              </div>
            )}
            {state?.success && (
              <div className="md:col-span-5 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                <Check className="h-4 w-4" /> Cobrança registrada com sucesso
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="profissional_id" className="text-white/70">Sublocatário</Label>
              <select
                id="profissional_id"
                name="profissional_id"
                required
                className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
              >
                <option value="">Selecione...</option>
                {sublocatarios.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="competencia" className="text-white/70">Competência</Label>
              <Input id="competencia" name="competencia" type="month" defaultValue={mesAtual()} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo_cobranca" className="text-white/70">Tipo</Label>
              <select
                id="tipo_cobranca"
                name="tipo_cobranca"
                value={tipoCobranca}
                onChange={(e) => setTipoCobranca(e.target.value as "fixo" | "percentual")}
                className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
              >
                <option value="fixo">Valor fixo mensal</option>
                <option value="percentual">% do faturamento do mês</option>
              </select>
            </div>
            {tipoCobranca === "fixo" ? (
              <div className="space-y-2">
                <Label htmlFor="valor_fixo_mensal" className="text-white/70">Valor (R$)</Label>
                <Input id="valor_fixo_mensal" name="valor_fixo_mensal" type="number" step="0.01" min="0" placeholder="1500.00" required />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="percentual_faturamento" className="text-white/70">Percentual (%)</Label>
                <Input id="percentual_faturamento" name="percentual_faturamento" type="number" step="0.01" min="0" max="100" placeholder="20" required />
              </div>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Lançar Cobrança"}
            </Button>
          </form>
          <p className="mt-2 text-xs text-white/40">
            No modo percentual, o valor é calculado automaticamente sobre a soma do faturamento do profissional
            selecionado na competência escolhida.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de cobranças</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white/50">Competência</TableHead>
                <TableHead className="text-white/50">Sublocatário</TableHead>
                <TableHead className="text-white/50">Tipo</TableHead>
                <TableHead className="text-white/50">Base de Cálculo</TableHead>
                <TableHead className="text-white/50">Valor</TableHead>
                <TableHead className="text-white/50">Status</TableHead>
                <TableHead className="text-right text-white/50">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-16" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : cobrancas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-white/40">
                    Nenhuma cobrança de sublocação registrada ainda
                  </TableCell>
                </TableRow>
              ) : (
                cobrancas.map((c) => {
                  const statusInfo = statusMap[c.status_pagamento] ?? { label: c.status_pagamento, variant: "default" as const }
                  const [ano, mes] = c.competencia.split("-")
                  return (
                    <TableRow key={c.id} className="hover:bg-white/[0.03] border-white/[0.06]">
                      <TableCell className="text-white/60">{mes}/{ano}</TableCell>
                      <TableCell className="font-medium text-white">{c.profissionais?.nome ?? "—"}</TableCell>
                      <TableCell className="text-white/60">
                        {c.tipo_cobranca === "percentual" ? `${c.percentual_faturamento}% do faturamento` : "Fixo"}
                      </TableCell>
                      <TableCell className="text-white/60">
                        {c.tipo_cobranca === "percentual" ? formatCurrency(Number(c.faturamento_base)) : "—"}
                      </TableCell>
                      <TableCell className="font-semibold text-[#6EE7B7]">{formatCurrency(Number(c.valor_calculado))}</TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {c.status_pagamento !== "pago" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={marcandoPago === c.id}
                            onClick={() => handleMarcarPago(c.id)}
                          >
                            {marcandoPago === c.id ? "Marcando..." : "Marcar como pago"}
                          </Button>
                        )}
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
