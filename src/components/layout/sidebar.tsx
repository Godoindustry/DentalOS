"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/lib/sidebar-context"
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
  { title: "Anamnese", href: "/anamnese", icon: ClipboardList },
  { title: "Configurações", href: "/configuracoes", icon: Settings },
]

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed left-0 top-0 z-40 h-screen overflow-hidden border-r border-white/[0.06] bg-[#002B36]/90 backdrop-blur-md"
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-4">
        <motion.div
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary"
        >
          <Stethoscope className="h-5 w-5" />
        </motion.div>
        {mounted ? (
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-lg text-white truncate"
              >
                DentalOS
              </motion.span>
            )}
          </AnimatePresence>
        ) : (
          <span className="font-bold text-lg text-white truncate">DentalOS</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition-all"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex flex-col gap-1 p-3">
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
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
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
    </motion.aside>
  )
}
