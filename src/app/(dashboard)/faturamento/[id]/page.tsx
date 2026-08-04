"use client"

import { useState, useEffect } from "react"
import { PageTransition } from "@/components/ui/page-transition"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/queries"
import { ReciboPrint } from "@/components/recibo"
import { ArrowLeft, DollarSign, User, Calendar, CreditCard } from "lucide-react"

const supabase = createClient()

const formaPagamentoLabels: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  credito_a_vista: "Crédito à Vista",
  parcelado: "Parcelado",
  debito: "Débito",
}

export default function DetalhesFaturamentoPage() {
  const params = useParams()
  const id = params.id as string
  const [fat, setFat] = useState<any>(null)
  const [clinicaNome, setClinicaNome] = useState("")
  const [clinicaCnpj, setClinicaCnpj] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from("faturamento")
      .select("*, pacientes (nome), procedimentos (nome_servico), profissionais (nome)")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (data) setFat(data)
        setLoading(false)
      })
    supabase.from("clinicas").select("nome_fantasia, cnpj").single().then(({ data }) => {
      if (data) {
        setClinicaNome(data.nome_fantasia)
        setClinicaCnpj(data.cnpj ?? "")
      }
    })
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (!fat) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-white/50">Lançamento não encontrado.</p>
        <Button asChild variant="outline"><Link href="/faturamento">Voltar</Link></Button>
      </div>
    )
  }

  const isPago = fat.status_pagamento === "pago"

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/faturamento"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">Detalhes do Lançamento</h1>
            <Badge variant={isPago ? "success" : "warning"}>
              {isPago ? "Pago" : fat.status_pagamento === "pendente" ? "Pendente" : "Estornado"}
            </Badge>
          </div>
          <p className="text-sm text-white/50">Informações completas do procedimento cobrado</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: DollarSign, label: "Valor Bruto", value: formatCurrency(Number(fat.valor_bruto_pago)), cor: "text-white" },
          { icon: User, label: "Comissão", value: formatCurrency(Number(fat.comissao_retida_dentista)), cor: "text-amber-400" },
          { icon: DollarSign, label: "Lucro Líquido", value: formatCurrency(Number(fat.lucro_liquido_clinica)), cor: "text-emerald-400" },
          { icon: CreditCard, label: "Forma de Pagamento", value: formaPagamentoLabels[fat.forma_pagamento] ?? fat.forma_pagamento, cor: "text-primary" },
        ].map((item) => (
          <Card key={item.label} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/70">{item.label}</CardTitle>
              <item.icon className="h-4 w-4 text-white/30" />
            </CardHeader>
            <CardContent>
              <p className={`text-xl font-bold ${item.cor}`}>{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Atendimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: "Paciente", value: (fat as any).pacientes?.nome ?? "—" },
              { label: "Profissional", value: (fat as any).profissionais?.nome ?? "—" },
              { label: "Procedimento", value: (fat as any).procedimentos?.nome_servico ?? "—" },
              { label: "Data", value: new Date(fat.data_competencia).toLocaleDateString("pt-BR") },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-xs text-white/40">{item.label}</p>
                <p className="text-sm font-medium text-white bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <ReciboPrint
              dados={{
                paciente: (fat as any).pacientes?.nome ?? "—",
                profissional: (fat as any).profissionais?.nome ?? "—",
                procedimento: (fat as any).procedimentos?.nome_servico ?? "—",
                valor: Number(fat.valor_bruto_pago),
                comissao: Number(fat.comissao_retida_dentista),
                lucro: Number(fat.lucro_liquido_clinica),
                data: fat.data_competencia,
                formaPagamento: formaPagamentoLabels[fat.forma_pagamento] ?? fat.forma_pagamento,
                clinicaNome,
                clinicaCnpj,
              }}
            />
            <Button variant="outline" asChild>
              <Link href="/faturamento">Voltar à Lista</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  )
}
