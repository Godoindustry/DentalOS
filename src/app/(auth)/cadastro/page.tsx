"use client"

import { useActionState } from "react"
import { motion } from "framer-motion"
import { Stethoscope, Check, Mail } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DentalPasswordInput } from "@/components/ui/dental-password-input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { signupAction } from "../actions"
import { UFS_BRASIL } from "@/lib/validations"

export default function CadastroPage() {
  const [state, formAction, pending] = useActionState(signupAction, null)

  if (state?.success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#002B36] via-[#0A424F] to-[#002B36]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-lg"
        >
          <Card className="border-white/[0.08] shadow-2xl shadow-black/30 p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="flex justify-center mb-6"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
                <Check className="h-10 w-10 text-emerald-400" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-white mb-3">Conta criada com sucesso!</CardTitle>
             <p className="text-white/60 text-sm leading-relaxed mb-6">
               Enviámos um email de confirmação para <strong className="text-white/80">{(state as { success: boolean; error: string; email?: string })?.email || "o seu email"}</strong>.
               Clique no link para ativar a sua conta e fazer login.
             </p>
            <div className="flex items-center justify-center gap-2 text-xs text-white/30 mb-8">
              <Mail className="h-3.5 w-3.5" />
              Se não encontrar, verifique a caixa de spam
            </div>
            <Button asChild className="w-full">
              <Link href="/login">Ir para Login</Link>
            </Button>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
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
            <CardTitle className="text-2xl font-bold text-white">Criar Conta Demo</CardTitle>
            <p className="text-sm text-white/50">
              Teste o DentalOS gratuitamente por 14 dias
            </p>
          </CardHeader>
          <form action={formAction}>
            <CardContent className="space-y-4">
              {state?.error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
                >
                  {state.error}
                </motion.div>
              )}
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-white/70">Seu Nome</Label>
                <Input id="nome" name="nome" placeholder="Dra. Ana Silva" autoComplete="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70">E-mail</Label>
                <Input id="email" name="email" type="email" placeholder="ana@clinica.com.br" autoComplete="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/70">Senha</Label>
                <DentalPasswordInput id="password" name="password" placeholder="Mínimo 6 caracteres" autoComplete="new-password" required minLength={6} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="cro" className="text-white/70">CRO</Label>
                  <Input id="cro" name="cro" placeholder="00000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uf_cro" className="text-white/70">UF do CRO</Label>
                  <select
                    id="uf_cro"
                    name="uf_cro"
                    required
                    className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
                  >
                    <option value="">UF</option>
                    {UFS_BRASIL.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button className="w-full h-11" type="submit" disabled={pending}>
                {pending ? "Criando conta..." : "Criar Conta Demo"}
              </Button>
              <p className="text-xs text-center text-white/20">
                14 dias grátis · Sem compromisso · Cancelamento a qualquer momento
              </p>
            </CardContent>
          </form>
          <CardFooter className="text-center text-sm border-t border-white/[0.06] pt-6">
            <p className="w-full text-white/50">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Faça login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
