"use client"

import { useActionState } from "react"
import { useParams } from "next/navigation"
import { PageTransition } from "@/components/ui/page-transition"
import Link from "next/link"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Syringe } from "lucide-react"
import { editarProcedimento } from "../../actions"
import { useProcedimento } from "@/lib/queries"

export default function EditarProcedimentoPage() {
  const params = useParams()
  const id = params.id as string
  const { data: proc, loading } = useProcedimento(id)
  const [state, formAction, pending] = useActionState(editarProcedimento, null)

  if (loading) {
    return (
      <PageTransition className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </PageTransition>
    )
  }

  if (!proc) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/procedimentos"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-2xl font-bold text-white">Procedimento não encontrado</h1>
        </div>
      </PageTransition>
    )
  }

  const custoTotal = (proc.custo_insumos_direto ?? 0) + (proc.custo_laboratorio ?? 0)
  const margem = proc.preco_venda > 0
    ? Math.round(((proc.preco_venda - custoTotal) / proc.preco_venda) * 100)
    : 0

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/procedimentos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{proc.nome_servico}</h1>
          <p className="text-sm text-white/50">Editar dados do procedimento</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Syringe className="h-4 w-4 text-primary" />
            Dados do Procedimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {state.error}
              </div>
            )}
            <input type="hidden" name="id" value={id} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome_servico" className="text-white/70">Nome do Serviço *</Label>
                <Input id="nome_servico" name="nome_servico" defaultValue={proc.nome_servico} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-white/70">Categoria *</Label>
                <Select name="categoria" defaultValue={proc.categoria || undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prevenção">Prevenção</SelectItem>
                    <SelectItem value="Endodontia">Endodontia</SelectItem>
                    <SelectItem value="Implantodontia">Implantodontia</SelectItem>
                    <SelectItem value="Estética">Estética</SelectItem>
                    <SelectItem value="Cirurgia">Cirurgia</SelectItem>
                    <SelectItem value="Ortodontia">Ortodontia</SelectItem>
                    <SelectItem value="Periodontia">Periodontia</SelectItem>
                    <SelectItem value="Diagnóstico">Diagnóstico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo_tuss" className="text-white/70">Código TUSS</Label>
                <Input id="codigo_tuss" name="codigo_tuss" defaultValue={proc.codigo_tuss ?? ""} placeholder="Ex: 5.01.01.01-0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tempo_estimado" className="text-white/70">Tempo Estimado (min)</Label>
                <Input id="tempo_estimado" name="tempo_estimado" type="number" defaultValue={proc.tempo_estimado_minutos ?? 30} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preco_venda" className="text-white/70">Preço de Venda (R$) *</Label>
                <Input id="preco_venda" name="preco_venda" type="number" step="0.01" defaultValue={proc.preco_venda} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custo_insumos" className="text-white/70">Custo Insumos Diretos (R$)</Label>
                <Input id="custo_insumos" name="custo_insumos" type="number" step="0.01" defaultValue={proc.custo_insumos_direto ?? 0} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custo_laboratorio" className="text-white/70">Custo Laboratório (R$)</Label>
                <Input id="custo_laboratorio" name="custo_laboratorio" type="number" step="0.01" defaultValue={proc.custo_laboratorio ?? 0} />
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-sm font-medium text-white/70 mb-1">Margem de Contribuição</p>
              <p className="text-3xl font-bold text-emerald-400">{margem}%</p>
              <p className="text-xs text-white/40 mt-1">
                Custo total: R$ {custoTotal.toFixed(2)} | Lucro bruto: R$ {(proc.preco_venda - custoTotal).toFixed(2)}
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/procedimentos">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageTransition>
  )
}
