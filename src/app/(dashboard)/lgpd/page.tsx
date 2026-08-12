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
import { Shield, Trash2, Download, Eye } from "lucide-react"
import Link from "next/link"

export default function LGPDPage() {
  const [pacienteId, setPacienteId] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pid = params.get("paciente_id")
    if (pid) setPacienteId(pid)
  }, [])

  async function handleSolicitacao(tipo: string, motivo?: string) {
    setLoading(true)
    setMessage(null)
    const res = await fetch("/api/lgpd/solicitacao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paciente_id: pacienteId || null, tipo, motivo }),
    })
    const data = await res.json()
    if (data.error) {
      setMessage("Erro: " + data.error)
    } else {
      setMessage("Solicitação registrada com sucesso!")
    }
    setLoading(false)
  }

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">LGPD e Privacidade</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie consentimentos e solicitações de dados pessoais
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Consentimento
            </CardTitle>
            <CardDescription>
              Registre o consentimento do paciente para tratamento de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              O consentimento é registrado automaticamente quando o paciente inicia o atendimento pelo bot.
            </p>
            <Button variant="outline" className="w-full" disabled>
              <Eye className="mr-2 h-4 w-4" />
              Ver Consentimentos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar Dados
            </CardTitle>
            <CardDescription>
              Exporte todos os dados do paciente (direito à portabilidade)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Use a exportação de pacientes na página de Pacientes para baixar os dados em CSV.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/pacientes/exportar">Exportar CSV</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Excluir Dados
            </CardTitle>
            <CardDescription>
              Solicite exclusão de dados pessoais (direito ao esquecimento)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {message && (
              <div className={`rounded-lg px-3 py-2 text-xs ${message.startsWith("Erro") ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                {message}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo da exclusão</Label>
              <Input
                id="motivo"
                placeholder="Motivo opcional"
                onChange={(e) => setMessage(null)}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              disabled={loading}
              onClick={() => handleSolicitacao("exclusao", (document.getElementById("motivo") as HTMLInputElement)?.value)}
            >
              {loading ? "Enviando..." : "Solicitar Exclusão"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
