"use client"

import { useActionState, useState } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Stethoscope, ShieldCheck, ShieldAlert, ExternalLink } from "lucide-react"
import { editarProfissional, marcarCroVerificado } from "../../actions"
import { useProfissional } from "@/lib/queries"
import { UFS_BRASIL } from "@/lib/validations"

export default function EditarProfissionalPage() {
  const params = useParams()
  const id = params.id as string
  const { data: prof, loading } = useProfissional(id)
  const [state, formAction, pending] = useActionState(editarProfissional, null)
  const [croVerificado, setCroVerificado] = useState(false)
  const [verificando, setVerificando] = useState(false)
  const [croInicializado, setCroInicializado] = useState(false)

  if (prof && !croInicializado) {
    setCroVerificado(prof.cro_verificado)
    setCroInicializado(true)
  }

  async function handleMarcarVerificado() {
    setVerificando(true)
    const result = await marcarCroVerificado(id)
    if (result?.success) setCroVerificado(true)
    setVerificando(false)
  }

  if (loading) {
    return (
      <PageTransition className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </PageTransition>
    )
  }

  if (!prof) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profissionais"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-2xl font-bold text-white">Profissional não encontrado</h1>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profissionais">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{prof.nome}</h1>
          <p className="text-sm text-white/50">Editar dados do profissional</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            Dados do Profissional
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
                <Label htmlFor="nome" className="text-white/70">Nome Completo *</Label>
                <Input id="nome" name="nome" defaultValue={prof.nome} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="especialidade" className="text-white/70">Especialidade Principal</Label>
                <Input id="especialidade" name="especialidade" defaultValue={prof.especialidade_principal ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cro" className="text-white/70">CRO *</Label>
                <Input id="cro" name="cro" defaultValue={prof.cro} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf_cro" className="text-white/70">UF do CRO *</Label>
                <select
                  id="uf_cro"
                  name="uf_cro"
                  defaultValue={prof.uf_cro}
                  required
                  className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
                >
                  <option value="">UF</option>
                  {UFS_BRASIL.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comissao" className="text-white/70">Porcentagem de Comissão (%)</Label>
                <Input id="comissao" name="comissao" type="number" step="0.01" defaultValue={prof.porcentagem_comissao} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm">
                    {croVerificado ? (
                      <>
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-400">CRO verificado manualmente</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-4 w-4 text-amber-400" />
                        <span className="text-amber-400">CRO ainda não verificado</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <a href="https://busca-profissionais.cfo.org.br/" target="_blank" rel="noopener noreferrer">
                        Verificar no CFO <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </a>
                    </Button>
                    {!croVerificado && (
                      <Button type="button" size="sm" disabled={verificando} onClick={handleMarcarVerificado}>
                        {verificando ? "Marcando..." : "Marcar como verificado"}
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-white/40">
                  Não existe API pública para validar CRO automaticamente. Confira no site oficial do CFO
                  (nome + CRO + UF) e marque como verificado depois de confirmar.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ativo" className="text-white/70">Status</Label>
                <select
                  id="ativo" name="ativo"
                  defaultValue={String(prof.ativo)}
                  className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/profissionais">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageTransition>
  )
}
