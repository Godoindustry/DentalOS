"use client"

import { useState } from "react"
import { PageTransition } from "@/components/ui/page-transition"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Download, FileText, Users } from "lucide-react"
import { exportarPacientes } from "../../actions"

export default function ExportarPacientesPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ csv?: string; filename?: string; total?: number; error?: string } | null>(null)

  const handleExport = async () => {
    setLoading(true)
    setResult(null)
    const res = await exportarPacientes()
    setResult(res)
    setLoading(false)
  }

  const handleDownload = () => {
    if (!result?.csv) return
    const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = result.filename || "pacientes.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Exportar Dados dos Pacientes</h1>
        <p className="text-sm text-muted-foreground">
          Baixe um arquivo CSV com todos os pacientes desta clínica
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Exportação de Pacientes
          </CardTitle>
          <CardDescription>
            O arquivo CSV contém apenas os pacientes vinculados a este dentista/clínica.
            Os dados são exportados de forma segura e local.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result?.error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {result.error}
            </div>
          )}
          {result?.csv && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
              Exportado {result.total} pacientes com sucesso!
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={handleExport} disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              {loading ? "Gerando arquivo..." : "Exportar CSV"}
            </Button>
            {result?.csv && (
              <Button variant="outline" onClick={handleDownload}>
                <FileText className="mr-2 h-4 w-4" />
                Baixar Arquivo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  )
}
