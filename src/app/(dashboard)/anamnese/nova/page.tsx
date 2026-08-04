"use client"

import { Suspense, useState, useEffect, useActionState } from "react"
import { PageTransition } from "@/components/ui/page-transition"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
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
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { salvarAnamnese } from "../../actions"
import { createClient } from "@/lib/supabase/client"

const questoes = [
  { id: "alergia_medicamento", texto: "É alérgico a algum medicamento ou anestésico?", qual: "qualAlergia" },
  { id: "tratamento_medico", texto: "Está em tratamento médico atualmente?", qual: "qualTratamento" },
  { id: "doenca_grave", texto: "Teve alguma doença grave?", qual: "qualDoenca" },
  { id: "hospitalizacao", texto: "Já foi hospitalizado ou passou por cirurgia?", qual: "qualHospitalizacao" },
  { id: "problema_cardiovascular", texto: "Tem problemas cardiovasculares (pressão alta, coração)?", qual: "qualProblemaCardiovascular" },
  { id: "problema_metabolico", texto: "Tem problemas metabólicos (diabetes, rins, fígado)?", qual: "qualProblemaMetabolico" },
  { id: "problema_respiratorio", texto: "Tem problemas respiratórios?", qual: "qualProblemaRespiratorio" },
  { id: "gravida", texto: "Está grávida ou amamentando?", qual: "qualGravidez" },
  { id: "habitos", texto: "Fuma ou consome bebidas alcoólicas?", qual: "quaisHabitos" },
  { id: "outros_problemas", texto: "Tem outros problemas de saúde?", qual: "quaisOutrosProblemas" },
  { id: "dor_atual", texto: "Sente dor ou desconforto nos dentes atualmente?", qual: "qualDor" },
  { id: "tratamento_anterior", texto: "Já fez tratamento odontológico anteriormente?", qual: "qualTratamentoAnterior" },
  { id: "medo_dentista", texto: "Tem medo de tratamento odontológico?", qual: null },
  { id: "satisfeito_aparencia", texto: "Está satisfeito com a aparência dos seus dentes?", qual: "qualInsatisfacao" },
]

const supabase = createClient()

function FormularioAnamnese() {
  const searchParams = useSearchParams()
  const preselectedPaciente = searchParams.get("paciente")
  const [state, formAction, pending] = useActionState(salvarAnamnese, null)

  const [pacientes, setPacientes] = useState<any[]>([])
  const [profissionais, setProfissionais] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPaciente, setSelectedPaciente] = useState(preselectedPaciente ?? "")

  useEffect(() => {
    Promise.all([
      supabase.from("pacientes").select("id, nome").order("nome"),
      supabase.from("profissionais").select("id, nome").order("nome"),
    ]).then(([pacData, profData]) => {
      setPacientes(pacData.data ?? [])
      setProfissionais(profData.data ?? [])
      setLoading(false)
    })
  }, [])

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/anamnese">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Nova Anamnese</h1>
          <p className="text-sm text-white/50">Preencha a ficha clínica do paciente</p>
        </div>
      </div>

      <form action={formAction}>
        <input type="hidden" name="paciente_id" value={selectedPaciente} />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Identificação</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2].map((i) => <Skeleton key={i} className="h-10" />)}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-white/70">Paciente *</Label>
                      <Select
                        value={selectedPaciente}
                        onValueChange={setSelectedPaciente}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o paciente..." />
                        </SelectTrigger>
                        <SelectContent>
                          {pacientes.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70">Profissional Responsável *</Label>
                      <Select name="profissional_id" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {profissionais.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Questionário de Saúde</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {questoes.map((q, i) => (
                  <div key={q.id}>
                    <div className="flex items-start justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <p className="text-sm text-white/80 flex-1">{q.texto}</p>
                      <div className="flex gap-2 shrink-0">
                        <label className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all has-[:checked]:bg-emerald-500/30 has-[:checked]:ring-2 has-[:checked]:ring-emerald-500/50">
                          <input type="radio" name={q.id} value="sim" className="sr-only" />
                          Sim
                        </label>
                        <label className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all has-[:checked]:bg-red-500/20 has-[:checked]:border-red-500/30 has-[:checked]:text-red-400">
                          <input type="radio" name={q.id} value="nao" className="sr-only" defaultChecked />
                          Não
                        </label>
                      </div>
                    </div>
                    {q.qual && (
                      <div className="ml-4 mt-1">
                        <Input
                          name={q.qual}
                          placeholder="Qual?"
                          className="text-xs h-8 max-w-xs"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {state?.error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {state.error}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={pending || !selectedPaciente}>
                {pending ? "Salvando..." : "Salvar Anamnese"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/anamnese">Cancelar</Link>
              </Button>
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sobre a Anamnese</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-white/60">
                <p>A anamnese é o histórico clínico do paciente. É fundamental para um tratamento seguro.</p>
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                  <p className="text-amber-400 font-medium text-xs mb-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Atenção
                  </p>
                  <p className="text-xs">Verifique sempre alergias e condições sistêmicas antes de iniciar qualquer procedimento.</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Condições de Alerta</p>
                  {["Diabetes", "Hipertensão", "Cardiopatia", "Coagulopatia", "Gravidez"].map((c) => (
                    <div key={c} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                      <span className="text-xs">{c}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </PageTransition>
  )
}

export default function NovaAnamnesePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <p className="text-white/40">Carregando...</p>
      </div>
    }>
      <FormularioAnamnese />
    </Suspense>
  )
}
