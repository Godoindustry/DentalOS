"use client"

import { useActionState } from "react"
import { motion } from "framer-motion"
import { Stethoscope, X } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DentalPasswordInput } from "@/components/ui/dental-password-input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { loginAction } from "../actions"

function LoginContent() {
  const [state, formAction, pending] = useActionState(loginAction, null)
  const searchParams = useSearchParams()
  const message = searchParams.get("message")

  return (
    <div className="dark relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#002B36] via-[#0A424F] to-[#002B36]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.05),transparent_50%)]" />

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
                <Stethoscope className="h-8 w-8 text-primary" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-white">DentalOS</CardTitle>
            <CardDescription>
              Entre na sua conta para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-400 flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                {message}
              </motion.div>
            )}
            {state?.error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {state.error}
              </div>
            )}
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70">E-mail</Label>
                <Input id="email" name="email" type="email" placeholder="seu@email.com" autoComplete="email" required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white/70">Senha</Label>
                  <Link
                    href="#"
                    className="text-xs text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <DentalPasswordInput id="password" name="password" placeholder="••••••••" autoComplete="current-password" required />
              </div>
              <Button className="w-full h-11" type="submit" disabled={pending}>
                {pending ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm border-t border-white/[0.06] pt-6">
            <p className="w-full text-white/50">
              Não tem uma conta?{" "}
              <Link href="/cadastro" className="text-primary hover:underline font-medium">
                Cadastre-se
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="dark relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#002B36] via-[#0A424F] to-[#002B36]" />
        <div className="w-full max-w-md">
          <Card className="border-white/[0.08] shadow-2xl shadow-black/30">
            <CardContent className="p-6 text-center">
              <p className="text-white/60">Carregando...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}

