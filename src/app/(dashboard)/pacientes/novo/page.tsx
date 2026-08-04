"use client"

import { Suspense, useActionState, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
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
import { ArrowLeft, Loader2 } from "lucide-react"
import { criarPaciente, editarPaciente } from "../../actions"
import { usePaciente } from "@/lib/queries"
import { isValidCpf } from "@/lib/utils"

function NovoPacienteForm() {
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")
  const { data: paciente, loading } = usePaciente(editId ?? "")
  const [state, formAction, pending] = useActionState(editId ? editarPaciente : criarPaciente, null)

  const logradouroRef = useRef<HTMLInputElement>(null)
  const bairroRef = useRef<HTMLInputElement>(null)
  const cidadeRef = useRef<HTMLInputElement>(null)
  const ufRef = useRef<HTMLInputElement>(null)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [cepErro, setCepErro] = useState<string | null>(null)
  const [cpfInvalido, setCpfInvalido] = useState(false)

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "")
    if (cep.length !== 8) return
    setBuscandoCep(true)
    setCepErro(null)
    try {
      const res = await fetch(`/api/cep/${cep}`)
      const data = await res.json()
      if (!res.ok) {
        setCepErro(data.error ?? "CEP não encontrado")
        return
      }
      if (logradouroRef.current && !logradouroRef.current.value) logradouroRef.current.value = data.logradouro
      if (bairroRef.current && !bairroRef.current.value) bairroRef.current.value = data.bairro
      if (cidadeRef.current) cidadeRef.current.value = data.cidade
      if (ufRef.current) ufRef.current.value = data.uf
    } catch {
      setCepErro("Não foi possível consultar o CEP")
    } finally {
      setBuscandoCep(false)
    }
  }

  const handleCpfBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    setCpfInvalido(value.length > 0 && !isValidCpf(value))
  }

  if (editId && loading) {
    return (
      <PageTransition className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </PageTransition>
    )
  }

  const isEdit = !!editId && !!paciente

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/pacientes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isEdit ? "Editar Paciente" : "Novo Paciente"}
          </h1>
          <p className="text-sm text-white/50">
            {isEdit ? "Altere os dados do paciente" : "Cadastre um novo paciente no sistema"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {state.error}
              </div>
            )}
            {isEdit && <input type="hidden" name="id" value={editId} />}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-white/70">Nome Completo *</Label>
                <Input id="nome" name="nome" defaultValue={paciente?.nome ?? ""} placeholder="Nome do paciente" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-white/70">CPF</Label>
                <Input
                  id="cpf" name="cpf"
                  defaultValue={paciente?.cpf ?? ""}
                  placeholder="000.000.000-00"
                  onBlur={handleCpfBlur}
                  onChange={() => cpfInvalido && setCpfInvalido(false)}
                  aria-invalid={cpfInvalido}
                />
                {cpfInvalido && (
                  <p className="text-xs text-destructive">CPF inválido — confira os dígitos.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_nascimento" className="text-white/70">Data de Nascimento *</Label>
                <Input id="data_nascimento" name="data_nascimento" type="date" defaultValue={paciente?.data_nascimento ?? ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sexo" className="text-white/70">Sexo</Label>
                <select
                  id="sexo" name="sexo"
                  defaultValue={paciente?.sexo ?? ""}
                  className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-white/70">Telefone (WhatsApp) *</Label>
                <Input id="telefone" name="telefone" defaultValue={paciente?.telefone_whatsapp ?? ""} placeholder="(11) 99999-9999" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70">E-mail</Label>
                <Input id="email" name="email" type="email" defaultValue={paciente?.email ?? ""} placeholder="paciente@email.com" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Endereço</p>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="cep" className="text-white/70 flex items-center gap-1.5">
                    CEP
                    {buscandoCep && <Loader2 className="h-3 w-3 animate-spin" />}
                  </Label>
                  <Input
                    id="cep" name="cep"
                    defaultValue={paciente?.cep ?? ""}
                    placeholder="00000-000"
                    onBlur={handleCepBlur}
                  />
                  {cepErro && <p className="text-xs text-destructive">{cepErro}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="logradouro" className="text-white/70">Logradouro</Label>
                  <Input ref={logradouroRef} id="logradouro" name="logradouro" defaultValue={paciente?.logradouro ?? ""} placeholder="Rua, Avenida..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero" className="text-white/70">Número</Label>
                  <Input id="numero" name="numero" defaultValue={paciente?.numero ?? ""} placeholder="Nº" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bairro" className="text-white/70">Bairro</Label>
                  <Input ref={bairroRef} id="bairro" name="bairro" defaultValue={paciente?.bairro ?? ""} placeholder="Bairro" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade" className="text-white/70">Cidade</Label>
                  <Input ref={cidadeRef} id="cidade" name="cidade" defaultValue={paciente?.cidade ?? ""} placeholder="Cidade" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uf" className="text-white/70">UF</Label>
                  <Input ref={ufRef} id="uf" name="uf" defaultValue={paciente?.uf ?? ""} placeholder="SP" maxLength={2} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavel" className="text-white/70">Responsável Legal</Label>
              <Input id="responsavel" name="responsavel" defaultValue={paciente?.responsavel_legal ?? ""} placeholder="Para menores de idade" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes" className="text-white/70">Observações Críticas</Label>
              <textarea
                id="observacoes"
                name="observacoes"
                defaultValue={paciente?.observacoes_criticas ?? ""}
                className="flex min-h-[80px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Alergias graves, cardiopatias, ou outras condições críticas"
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando..." : isEdit ? "Salvar Alterações" : "Salvar Paciente"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/pacientes">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageTransition>
  )
}

export default function NovoPacientePage() {
  return (
    <Suspense fallback={
      <PageTransition className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </PageTransition>
    }>
      <NovoPacienteForm />
    </Suspense>
  )
}
