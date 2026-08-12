"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function TestBotButton({ whatsapp }: { whatsapp?: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleTest = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/bot/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: whatsapp || "+5511966230438",
          message: "Olá! Este é um teste de conexão do bot via Z-API. ✅",
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult("✅ Mensagem enviada com sucesso! Verifique o WhatsApp.")
      } else {
        setResult(`❌ Erro: ${data.error || "Falha ao enviar"}`)
      }
    } catch {
      setResult("❌ Erro de conexão com o servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleTest}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Enviando..." : "Enviar mensagem de teste no WhatsApp"}
      </Button>
      {result && (
        <p className={`text-xs ${result.startsWith("✅") ? "text-emerald-400" : "text-red-400"}`}>
          {result}
        </p>
      )}
    </div>
  )
}
