"use client"

import { useState, useEffect } from "react"
import { PageTransition } from "@/components/ui/page-transition"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useActionState } from "react"
import { salvarAnamnese } from "../../actions"
import { ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

const questoes = [
  { id: "alergia_medicamento", label: "Você tem alergia a algum medicamento?" },
  { id: "qualAlergia", label: "Qual alergia?" },
  { id: "tratamento_medico", label: "Está fazendo algum tratamento médico atualmente?" },
  { id: "qualTratamento", label: "Qual tratamento?" },
  { id: "doenca_grave", label: "Já teve alguma doença grave?" },
  { id: "qualDoenca", label: "Qual doença?" },
  { id: "usoMedicamentos", label: "Usa algum medicamento regularmente?" },
  { id: "quaisMedicamentos", label: "Quais medicamentos?" },
  { id: "pressaoAlta", label: "Tem pressão alta?" },
  { id: "diabetes", label: "Tem diabetes?" },
  { id: "gravidez", label: "Está grávida ou amamentando?" },
  { id: "fumante", label: "É fumante?" },
  { id: "alcool", label: "Consome álcool frequentemente?" },
  { id: "dorDente", label: "Está com dor de dente atualmente?" },
  { id: "sangramento", label: "Tem sangramento na gengiva?" },
  { id: "sensibilidade", label: "Tem sensibilidade nos dentes?" },
  { id: "cirurgia", label: "Já fez cirurgia odontológica antes?" },
  { id: "ultimaConsulta", label: "Quando foi sua última consulta odontológica?" },
]

export default function NovaAnamnesePage() {
  const [pacienteId, setPacienteId] = useState("")
  const [profissionalId, setProfissionalId] = useState("")
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [assinatura, setAssinatura] = useState("")
  const [state, formAction, pending] = useActionState(salvarAnamnese, null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pid = params.get("paciente_id")
    if (pid) setPacienteId(pid)
  }, [])

  const handleChange = (id: string, value: string) => {
    setRespostas((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/anamnese">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nova Anamnese</h1>
          <p className="text-sm text-muted-foreground">Preencha o questionário de forma cuidadosa</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Questionário de Anamnese
          </CardTitle>
          <CardDescription>
            Responda todas as questões para avaliação do profissional
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state?.error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
              Anamnese salva com sucesso!
            </div>
          )}
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="paciente_id" value={pacienteId} />
            <input type="hidden" name="profissional_id" value={profissionalId} />
            <input type="hidden" name="questionario" value={JSON.stringify(respostas)} />
            <input type="hidden" name="assinatura" value={assinatura} />

            <div className="grid gap-4">
              {questoes.map((q) => (
                <div key={q.id} className="space-y-2">
                  <Label htmlFor={q.id}>{q.label}</Label>
                  <select
                    id={q.id}
                    name={q.id}
                    value={respostas[q.id] || ""}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                    <option value="as_vezes">Às vezes</option>
                    <option value="nao_sei">Não sei</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assinatura">Assinatura digital (digite seu nome)</Label>
              <Input
                id="assinatura"
                name="assinatura"
                value={assinatura}
                onChange={(e) => setAssinatura(e.target.value)}
                placeholder="Digite seu nome completo"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando..." : "Salvar Anamnese"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/anamnese">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageTransition>
  )
}
