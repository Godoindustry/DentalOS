"use client"

import { useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Undo2, Redo2, Baby, User, Shuffle, Search,
  Download, FileJson, Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useOdontogramaStore } from "@/store/odontograma-store"
import type { DenticaoMode } from "./types"

// ─── Props ────────────────────────────────────────────────────────────────────

interface OdontogramaToolbarProps {
  searchTerm: string
  onSearchChange: (v: string) => void
  onExportPDF: () => void
  onExportJSON: () => void
}

// ─── Sub-componente: botão de dentição ────────────────────────────────────────

function DenticaoBtn({
  mode, label, icon: Icon, active, onClick,
}: {
  mode: DenticaoMode
  label: string
  icon: React.ComponentType<{ className?: string }>
  active: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all",
        active
          ? "border-purple-500/50 bg-purple-500/20 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
          : "border-white/[0.07] bg-white/[0.03] text-white/50 hover:bg-white/[0.07] hover:text-white/80",
      )}
      title={label}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export function OdontogramaToolbar({
  searchTerm,
  onSearchChange,
  onExportPDF,
  onExportJSON,
}: OdontogramaToolbarProps) {
  const denticaoMode    = useOdontogramaStore((s) => s.denticaoMode)
  const historico       = useOdontogramaStore((s) => s.historico)
  const historicoFuturo = useOdontogramaStore((s) => s.historicoFuturo)
  const saving          = useOdontogramaStore((s) => s.saving)
  const setDenticaoMode = useOdontogramaStore((s) => s.setDenticaoMode)
  const undo            = useOdontogramaStore((s) => s.undo)
  const redo            = useOdontogramaStore((s) => s.redo)

  const canUndo = historico.length > 0
  const canRedo = historicoFuturo.length > 0

  // Atalhos de teclado Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return

      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.ctrlKey && e.key === "y") || (e.ctrlKey && e.shiftKey && e.key === "z")) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [undo, redo])

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm px-3 py-2.5">

      {/* ── Grupo: Dentição ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        <DenticaoBtn
          mode="adulto"
          label="Adulto"
          icon={User}
          active={denticaoMode === "adulto"}
          onClick={() => setDenticaoMode("adulto")}
        />
        <DenticaoBtn
          mode="infantil"
          label="Infantil"
          icon={Baby}
          active={denticaoMode === "infantil"}
          onClick={() => setDenticaoMode("infantil")}
        />
        <DenticaoBtn
          mode="mista"
          label="Mista"
          icon={Shuffle}
          active={denticaoMode === "mista"}
          onClick={() => setDenticaoMode("mista")}
        />
      </div>

      <div className="h-5 w-px bg-white/10 mx-0.5 hidden sm:block" />

      {/* ── Grupo: Undo / Redo ───────────────────────────────────────────── */}
      <div className="flex items-center gap-1">
        <motion.button
          onClick={undo}
          disabled={!canUndo}
          whileTap={{ scale: canUndo ? 0.92 : 1 }}
          className={cn(
            "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs border transition-all",
            canUndo
              ? "border-white/[0.08] bg-white/[0.03] text-white/60 hover:bg-white/[0.08] hover:text-white/90 cursor-pointer"
              : "border-white/[0.03] text-white/20 cursor-not-allowed",
          )}
          title={`Desfazer (Ctrl+Z) — ${historico.length} passo${historico.length !== 1 ? "s" : ""}`}
        >
          <Undo2 className="h-3.5 w-3.5" />
          {historico.length > 0 && (
            <span className="text-[10px] font-mono text-white/40">{historico.length}</span>
          )}
        </motion.button>

        <motion.button
          onClick={redo}
          disabled={!canRedo}
          whileTap={{ scale: canRedo ? 0.92 : 1 }}
          className={cn(
            "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs border transition-all",
            canRedo
              ? "border-white/[0.08] bg-white/[0.03] text-white/60 hover:bg-white/[0.08] hover:text-white/90 cursor-pointer"
              : "border-white/[0.03] text-white/20 cursor-not-allowed",
          )}
          title={`Refazer (Ctrl+Y) — ${historicoFuturo.length} passo${historicoFuturo.length !== 1 ? "s" : ""}`}
        >
          <Redo2 className="h-3.5 w-3.5" />
          {historicoFuturo.length > 0 && (
            <span className="text-[10px] font-mono text-white/40">{historicoFuturo.length}</span>
          )}
        </motion.button>
      </div>

      <div className="h-5 w-px bg-white/10 mx-0.5 hidden sm:block" />

      {/* ── Grupo: Busca ─────────────────────────────────────────────────── */}
      <div className="relative flex-1 min-w-[120px] max-w-[220px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar dente... ex: 16"
          className="w-full rounded-lg bg-white/[0.04] border border-white/[0.07] pl-8 pr-3 py-1.5 text-xs text-white/80 placeholder:text-white/25 outline-none focus:border-purple-500/40 focus:bg-purple-500/5 transition-all"
        />
      </div>

      {/* ── Spacer ───────────────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Status salvando ──────────────────────────────────────────────── */}
      {saving && (
        <div className="flex items-center gap-1.5 text-[10px] text-white/30">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="hidden sm:inline">Salvando...</span>
        </div>
      )}

      {/* ── Grupo: Exportação ────────────────────────────────────────────── */}
      <div className="flex items-center gap-1">
        <motion.button
          onClick={onExportJSON}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs border border-white/[0.07] bg-white/[0.03] text-white/50 hover:bg-white/[0.07] hover:text-white/80 transition-all"
          title="Exportar JSON (backup)"
        >
          <FileJson className="h-3.5 w-3.5" />
          <span className="hidden md:inline">JSON</span>
        </motion.button>

        <motion.button
          onClick={onExportPDF}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs border border-white/[0.07] bg-white/[0.03] text-white/50 hover:bg-white/[0.07] hover:text-white/80 transition-all"
          title="Exportar / Imprimir PDF"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden md:inline">PDF</span>
        </motion.button>
      </div>
    </div>
  )
}
