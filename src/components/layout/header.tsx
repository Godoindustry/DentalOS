"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Bell, ChevronDown, LogOut, MapPin, Menu, MessageCircle, Moon, Settings, Sun } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useSidebar } from "@/lib/sidebar-context"

const supabase = createClient()

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="h-10 w-10" />

  const isDark = resolvedTheme === "dark"
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.18 }}
          className="flex"
        >
          {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [usuario, setUsuario] = useState({ nome: "Usuario", especialidade: "Profissional" })
  const { collapsed, setCollapsed } = useSidebar()

  useEffect(() => {
    const loadUsuario = async () => {
      const { data: auth } = await supabase.auth.getUser()
      const user = auth.user
      if (!user) return

      const { data: profissional } = await supabase
        .from("profissionais")
        .select("nome, especialidade_principal")
        .eq("user_id", user.id)
        .maybeSingle()

      setUsuario({
        nome: profissional?.nome ?? (user.user_metadata?.nome as string | undefined) ?? user.email ?? "Usuario",
        especialidade: profissional?.especialidade_principal ?? "Profissional",
      })
    }

    loadUsuario()
  }, [])

  const initials = useMemo(() => (
    usuario.nome
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  ), [usuario.nome])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>Clinica</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-accent hover:text-foreground">
          <MessageCircle className="h-5 w-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-12 w-80 rounded-xl border border-border bg-popover p-2 shadow-2xl backdrop-blur-xl"
              >
                <div className="px-3 py-2 text-sm font-medium text-foreground">Notificacoes</div>
                <div className="rounded-lg px-3 py-6 text-center text-sm text-muted-foreground">
                  Nenhuma notificacao registrada.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-1.5 transition-all hover:bg-accent">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-xs font-medium text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-tight text-foreground">{usuario.nome}</p>
                <p className="text-xs text-muted-foreground">{usuario.especialidade}</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-border bg-popover backdrop-blur-xl">
            <DropdownMenuLabel className="text-muted-foreground">Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem asChild className="text-muted-foreground focus:bg-accent focus:text-foreground">
              <Link href="/configuracoes" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuracoes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-muted-foreground focus:bg-accent focus:text-foreground">
              <Link href="/login" className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sair
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
