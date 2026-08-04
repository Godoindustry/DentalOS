"use client"

import { useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Undo2, Redo2, Baby, User, Shuffle,
  Search, Download, FileJson, Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useOdontogramaStore } from "@/store/odontograma-store"
import type { DenticaoMode } from "./types"

interface OdontogramaToolbarProps {
  searchTerm: string
  onSearchChange: (v: string) => void
  onExportPDF: () => void
  onExportJSON: () => void
}

const MODO_ITEMS: {
  mode: DenticaoMode
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { mode: "adulto",   label: "Adulto",   icon: User    },
  { mode: "infantil", label: "Infantil", icon: Baby    },
  { mode: "mista",    label: "Mista",    icon: Shuffle },
]

export function OdontogramaToolbar({
  searchTerm, onSearchChange, onExportPDF, onExportJSON,
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

  // Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      if (e.ctrlKey && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.ctrlKey && e.key === "y") || (e.ctrlKey && e.shiftKey && e.key === "z")) {
        e.preventDefault(); redo()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [undo, redo])

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">

      {/* ── Modo de dentição ────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
        {MODO_ITEMS.map(({ mode, label, icon: Icon }) => (
          <button
            key={mode}
            onClick={() => setDenticaoMode(mode)}
            title={label}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
              denticaoMode === mode
                ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-slate-200 hidden sm:block" />

      {/* ── Undo / Redo ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1">
        {([
          { fn: undo, can: canUndo, icon: Undo2,  steps: historico.length,       title: "Desfazer (Ctrl+Z)" },
          { fn: redo, can: canRedo, icon: Redo2,  steps: historicoFuturo.length, title: "Refazer (Ctrl+Y)" },
        ] as const).map(({ fn, can, icon: Icon, steps, title }) => (
          <button
            key={title}
            onClick={fn as () => void}
            disabled={!can}
            title={`${title} — ${steps} passo${steps !== 1 ? "s" : ""}`}
            className={cn(
              "flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition-all",
              can
                ? "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {steps > 0 && (
              <span className="font-mono text-[10px] text-slate-400">{steps}</span>
            )}
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-slate-200 hidden sm:block" />

      {/* ── Busca ───────────────────────────────────────────────────────── */}
      <div className="relative flex-1 min-w-[130px] max-w-[220px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar dente… ex: 16"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:bg-white transition-all"
        />
      </div>

      <div className="flex-1" />

      {/* ── Salvando ────────────────────────────────────────────────────── */}
      {saving && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="hidden sm:inline">Salvando...</span>
        </div>
      )}

      {/* ── Exportação ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1">
        {([
          { fn: onExportJSON, icon: FileJson,  label: "JSON", title: "Exportar JSON (backup)" },
          { fn: onExportPDF,  icon: Download,  label: "PDF",  title: "Exportar / Imprimir PDF" },
        ] as const).map(({ fn, icon: Icon, label, title }) => (
          <button
            key={label}
            onClick={fn as () => void}
            title={title}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 transition-all"
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
