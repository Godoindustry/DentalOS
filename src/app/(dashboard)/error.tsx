"use client"

import { useEffect } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Erro na área do dashboard:", error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-base font-semibold">Algo deu errado nesta tela</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Ocorreu um erro inesperado ao carregar esta página. Você pode tentar
          novamente ou voltar mais tarde.
        </p>
      </div>
      <Button onClick={() => reset()} size="sm" className="gap-2">
        <RotateCcw className="h-3.5 w-3.5" />
        Tentar novamente
      </Button>
    </div>
  )
}
