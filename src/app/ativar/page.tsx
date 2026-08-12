"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { PageTransition } from "@/components/ui/page-transition"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Stethoscope, Key, Check, X, CreditCard } from "lucide-react"
import Link from "next/link"
import { ativarLicenca, iniciarAssinaturaMP } from "../(auth)/actions"

const PLANOS_LABEL: Record<string, string> = {
  individual: "Individual",
  clinica: "Clínica",
  clinica_plus: "Clínica Plus",
}

function AtivarContent() {
  const searchParams = useSearchParams()
  const plano = searchParams.get("plano")

  const [codigo, setCodigo] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pagando, setPagando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const fd = new FormData()
    fd.append("codigo", codigo.trim())
    const result = await ativarLicenca(fd)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess("Licença ativada com sucesso! Redirecionando...")
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1500)
    }
    setLoading(false)
  }

  async function handlePagar() {
    if (!plano) return
    setError(null)
    setPagando(true)
    const result = await iniciarAssinaturaMP(plano)
    if (result?.error) {
      setError(result.error)
      setPagando(false)
    } else if (result?.initPoint) {
      window.location.href = result.initPoint
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative w-full max-w-md"
    >
      <Card className="border-white/[0.08] shadow-2xl shadow-black/30">
        <CardHeader className="space-y-1 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <div className="rounded-2xl bg-primary/20 p-3 shadow-lg shadow-primary/20">
              {plano ? <CreditCard className="h-8 w-8 text-primary" /> : <Key className="h-8 w-8 text-primary" />}
            </div>
          </motion.div>
          <CardTitle className="text-2xl font-bold text-white">
            {plano ? `Assinar plano ${PLANOS_LABEL[plano] || plano}` : "Ativar Licença"}
          </CardTitle>
          <CardDescription>
            {plano
              ? "Você será redirecionado para o Mercado Pago para autorizar a cobrança mensal."
              : "Insira a chave de licença para ativar o seu plano"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              {success}
            </motion.div>
          )}

          {plano ? (
            <div className="space-y-4">
              <Button className="w-full h-11" onClick={handlePagar} disabled={pagando}>
                {pagando ? "Redirecionando..." : "Pagar com Mercado Pago"}
              </Button>
              <p className="text-center text-xs text-white/40">
                Precisa estar logado. Se ainda não tem conta,{" "}
                <Link href="/cadastro" className="text-primary hover:underline">
                  cadastre-se primeiro
                </Link>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigo" className="text-white/70">
                  Chave de Licença
                </Label>
                <Input
                  id="codigo"
                  name="codigo"
                  type="text"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  required
                  className="uppercase"
                />
              </div>
              <Button className="w-full h-11" type="submit" disabled={loading}>
                {loading ? "Ativando..." : "Ativar Licença"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="text-center text-sm border-t border-white/[0.06] pt-6">
          <p className="w-full text-white/50">
            {plano ? (
              <>
                Prefere um código de licença?{" "}
                <Link href="/ativar" className="text-primary hover:underline font-medium">
                  Ativar com código
                </Link>
              </>
            ) : (
              <>
                Não tem uma licença?{" "}
                <Link href="/precos" className="text-primary hover:underline font-medium">
                  Ver planos
                </Link>
              </>
            )}
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default function AtivarPage() {
  return (
    <PageTransition className="min-h-screen">
      <div className="dark relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#002B36] via-[#0A424F] to-[#002B36]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.05),transparent_50%)]" />

        <Suspense fallback={<div className="text-white/50">Carregando...</div>}>
          <AtivarContent />
        </Suspense>
      </div>
    </PageTransition>
  )
}
