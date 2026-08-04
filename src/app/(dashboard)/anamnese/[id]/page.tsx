"use client"

import { useState, useEffect } from "react"
import { PageTransition } from "@/components/ui/page-transition"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, FileText, User, Calendar } from "lucide-react"

const supabase = createClient()

const labelMap: Record<string, string> = {
  alergia_medicamento: "Alergia a medicamentos",
  qualAlergia: "Qual?",
  tratamento_medico: "Em tratamento médico",
  qualTratamento: "Qual?",
  doenca_grave: "Doença grave",
  qualDoenca: "Qual?",
  hospitalizacao: "Hospitalização / Cirurgia",
  qualHospitalizacao: "Qual?",
  problema_cardiovascular: "Problemas cardiovasculares",
  qualProblemaCardiovascular: "Qual?",
  problema_metabolico: "Problemas metabólicos",
  qualProblemaMetabolico: "Qual?",
  problema_respiratorio: "Problemas respiratórios",
  qualProblemaRespiratorio: "Qual?",
  gravida: "Grávida / Amamentando",
  qualGravidez: "Qual?",
  habitos: "Fuma / Bebe",
  quaisHabitos: "Quais?",
  outros_problemas: "Outros problemas",
  quaisOutrosProblemas: "Quais?",
  dor_atual: "Dor atual",
  qualDor: "Qual?",
  tratamento_anterior: "Tratamento anterior",
  qualTratamentoAnterior: "Qual?",
  medo_dentista: "Medo de dentista",
  satisfeito_aparencia: "Satisfeito com aparência",
  qualInsatisfacao: "Qual?",
}

export default function AnamneseDetalhe() {
  const params = useParams()
  const id = params.id as string
  const [anamnese, setAnamnese] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from("anamneses")
      .select("*, pacientes (nome), profissionais (nome)")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (data) setAnamnese(data)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!anamnese) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/40">Anamnese não encontrada</p>
      </div>
    )
  }

  const questoes = anamnese.questionario_respondido as Record<string, string>

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/anamnese">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">Anamnese</h1>
            <Badge variant="success">Finalizado</Badge>
          </div>
          <p className="text-sm text-white/50">
            {(anamnese as any).pacientes?.nome} &middot;{" "}
            {anamnese.finalizado_em
              ? new Date(anamnese.finalizado_em).toLocaleDateString("pt-BR")
              : "—"}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { icon: User, label: "Paciente", value: (anamnese as any).pacientes?.nome ?? "—" },
          { icon: User, label: "Profissional", value: (anamnese as any).profissionais?.nome ?? "—" },
          { icon: Calendar, label: "Realizado em", value: anamnese.finalizado_em ? new Date(anamnese.finalizado_em).toLocaleDateString("pt-BR") : "—" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-3 pt-4 pb-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-white/40">{item.label}</p>
                <p className="text-sm font-medium text-white truncate">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Respostas do Questionário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(labelMap).map(([key, label]) => {
              const val = questoes[key]
              if (!val) return null
              const isQual = key.startsWith("qual")
              const isSim = val === "sim" || val === "nao"
              return (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <p className="text-sm text-white/70">{label}</p>
                  {isSim ? (
                    <Badge variant={val === "sim" ? (key.startsWith("qual") ? "default" : "warning") : "secondary"}>
                      {val === "sim" ? "Sim" : "Não"}
                    </Badge>
                  ) : (
                    <span className="text-sm font-medium text-white">{val}</span>
                  )}
                </div>
              )
            })}
            {Object.keys(questoes).length === 0 && (
              <p className="text-sm text-white/40 text-center py-8">Nenhuma resposta registrada</p>
            )}
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  )
}
