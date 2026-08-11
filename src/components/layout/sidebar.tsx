"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/lib/sidebar-context"
import { createClient } from "@/lib/supabase/client"
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Syringe,
  CalendarDays,
  DollarSign,
  ClipboardList,
  Settings,
  ChevronLeft,
  ScanLine,
  MessageCircle,
  Bot,
  Building,
} from "lucide-react"

const sidebarItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Pacientes", href: "/pacientes", icon: Users },
  { title: "Assistente Virtual", href: "/bot", icon: Bot },
  { title: "Potenciais Pacientes", href: "/pacientes-potenciais", icon: MessageCircle },
  { title: "Profissionais", href: "/profissionais", icon: Stethoscope },
  { title: "Procedimentos", href: "/procedimentos", icon: Syringe },
  { title: "Agendamentos", href: "/agendamentos", icon: CalendarDays },
  { title: "Odontograma", href: "/odontograma", icon: ScanLine },
  { title: "Faturamento", href: "/faturamento", icon: DollarSign },
  { title: "Cadeiras/Salas", href: "/financeiro-cadeiras", icon: Building },
  { title: "Anamnese", href: "/anamnese", icon: ClipboardList },
  { title: "Configurações", href: "/configuracoes", icon: Settings },
]

const supabase = createClient()

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [nomeClinica, setNomeClinica] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    supabase.from("clinicas").select("nome_fantasia").limit(1).maybeSingle().then(({ data }) => {
      if (data?.nome_fantasia) setNomeClinica(data.nome_fantasia)
    })
  }, [])

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed left-0 top-0 z-40 h-screen overflow-hidden flex flex-col border-r border-slate-200 bg-white"
    >
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-4">
        <motion.div
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00C49F]/10 text-[#00C49F]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 20.5 8 16c-1-2-1.5-3-1.5-4a6 6 0 1 1 11 0c0 1-.5 2-1.5 4l-2 4.5"/><path d="M12 18.5v-3"/></svg>
        </motion.div>
        {mounted ? (
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-lg text-slate-800 truncate"
              >
                DentalOS
              </motion.span>
            )}
          </AnimatePresence>
        ) : (
          <span className="font-bold text-lg text-slate-800 truncate">DentalOS</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto flex flex-col gap-1 p-3">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-[#00C49F]/10 text-[#00C49F]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <item.icon className="relative z-10 h-5 w-5 shrink-0" />
              {mounted ? (
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="relative z-10"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              ) : (
                <span className="relative z-10">{item.title}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer Unit Selector */}
      <div className="p-4 border-t border-slate-100 bg-slate-50">
        {!collapsed ? (
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unidade Atual</span>
            <span className="text-xs font-semibold text-slate-700 truncate">{nomeClinica ?? "Carregando..."}</span>
          </div>
        ) : (
          <div className="w-full flex justify-center text-xs font-bold text-slate-400">CS</div>
        )}
      </div>

    </motion.aside>
  )
}
