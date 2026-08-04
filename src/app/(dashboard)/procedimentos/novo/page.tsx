"use client"

import { useActionState } from "react"
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
import { ArrowLeft } from "lucide-react"
import { criarProcedimento } from "../../actions"

export default function NovoProcedimentoPage() {
  const [state, formAction, pending] = useActionState(criarProcedimento, null)

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/procedimentos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Novo Procedimento</h1>
          <p className="text-sm text-white/50">Cadastre um novo procedimento com precificação</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Procedimento</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {state.error}
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome_servico" className="text-white/70">Nome do Serviço *</Label>
                <Input id="nome_servico" name="nome_servico" placeholder="Ex: Canal (Endodontia)" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-white/70">Categoria *</Label>
                <select
                  id="categoria"
                  name="categoria"
                  className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="Prevenção">Prevenção</option>
                  <option value="Endodontia">Endodontia</option>
                  <option value="Implantodontia">Implantodontia</option>
                  <option value="Estética">Estética</option>
                  <option value="Cirurgia">Cirurgia</option>
                  <option value="Ortodontia">Ortodontia</option>
                  <option value="Periodontia">Periodontia</option>
                  <option value="Diagnóstico">Diagnóstico</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo_tuss" className="text-white/70">Código TUSS</Label>
                <Input id="codigo_tuss" name="codigo_tuss" placeholder="Código ANS" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tempo_estimado" className="text-white/70">Tempo Estimado (minutos)</Label>
                <Input id="tempo_estimado" name="tempo_estimado" type="number" defaultValue="30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preco_venda" className="text-white/70">Preço de Venda (R$) *</Label>
                <Input id="preco_venda" name="preco_venda" type="number" step="0.01" placeholder="0,00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custo_insumos" className="text-white/70">Custo com Insumos Diretos (R$)</Label>
                <Input id="custo_insumos" name="custo_insumos" type="number" step="0.01" placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custo_laboratorio" className="text-white/70">Custo com Laboratório (R$)</Label>
                <Input id="custo_laboratorio" name="custo_laboratorio" type="number" step="0.01" placeholder="0,00" />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando..." : "Salvar Procedimento"}
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
