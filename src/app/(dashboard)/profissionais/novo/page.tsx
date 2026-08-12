"use client"

import { useActionState, useState } from "react"
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
import { ArrowLeft } from "lucide-react"
import { criarProfissional } from "../../actions"
import { UFS_BRASIL } from "@/lib/validations"

export default function NovoProfissionalPage() {
  const [state, formAction, pending] = useActionState(criarProfissional, null)
  const [comLogin, setComLogin] = useState(false)

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profissionais">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Novo Profissional</h1>
          <p className="text-sm text-muted-foreground">Cadastre um novo dentista ou profissional</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Profissional</CardTitle>
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
                <Label htmlFor="nome" className="text-foreground/70">Nome Completo *</Label>
                <Input id="nome" name="nome" placeholder="Dr. Nome do Profissional" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="especialidade" className="text-foreground/70">Especialidade Principal</Label>
                <select
                  id="especialidade"
                  name="especialidade"
                  className="flex h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
                >
                  <option value="">Selecione...</option>
                  <option value="Clínico Geral">Clínico Geral</option>
                  <option value="Implantodontia">Implantodontia</option>
                  <option value="Endodontia">Endodontia</option>
                  <option value="Ortodontia">Ortodontia</option>
                  <option value="Periodontia">Periodontia</option>
                  <option value="Harmonização Orofacial">Harmonização Orofacial</option>
                  <option value="Odontopediatria">Odontopediatria</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cro" className="text-foreground/70">CRO *</Label>
                <Input id="cro" name="cro" placeholder="00000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf_cro" className="text-foreground/70">UF do CRO *</Label>
                <select
                  id="uf_cro"
                  name="uf_cro"
                  className="flex h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
                  required
                >
                  <option value="">UF</option>
                  {UFS_BRASIL.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Formato validado (dígitos + UF); não consulta o cadastro oficial do CRO em tempo real.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comissao" className="text-foreground/70">Porcentagem de Comissão (%)</Label>
                <Input id="comissao" name="comissao" type="number" placeholder="40" defaultValue="40" />
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-6">
              <Label htmlFor="role" className="text-foreground/70">Tipo de Vínculo</Label>
              <select
                id="role"
                name="role"
                defaultValue="sublocatario"
                className="flex h-10 w-full max-w-sm rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
              >
                <option value="sublocatario">Dentista sublocatário (cadeira/sala própria)</option>
                <option value="titular">Titular adicional</option>
              </select>

              <label className="mt-3 flex items-center gap-2 text-sm text-foreground/70">
                <input
                  type="checkbox"
                  checked={comLogin}
                  onChange={(e) => setComLogin(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-card"
                />
                Criar login próprio para este profissional
              </label>
              <p className="text-xs text-muted-foreground">
                Sem login, o cadastro serve apenas para agenda/faturamento. Com login, o profissional acessa o
                sistema e — se for sublocatário — só vê seus próprios pacientes e agendamentos.
              </p>

              {comLogin && (
                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground/70">E-mail de acesso *</Label>
                    <Input id="email" name="email" type="email" placeholder="dentista@clinica.com.br" required={comLogin} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha" className="text-foreground/70">Senha temporária *</Label>
                    <Input id="senha" name="senha" type="password" placeholder="Mínimo 6 caracteres" required={comLogin} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando..." : "Salvar Profissional"}
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
