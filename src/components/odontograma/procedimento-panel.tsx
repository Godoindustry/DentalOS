"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { PROCEDIMENTOS } from "./types"
import type { FaceStatus } from "./types"
import { useOdontogramaStore } from "@/store/odontograma-store"
import {
  TriangleAlert, PaintBucket, GitFork, Crown, Syringe,
  Ban, Layers, Bone, Sparkles, Eye, Clock,
} from "lucide-react"

const ICONE_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  triangle:  TriangleAlert,
  fill:      PaintBucket,
  root:      GitFork,
  crown:     Crown,
  implant:   Syringe,
  extract:   Ban,
  layer:     Layers,
  break:     Bone,
  sparkle:   Sparkles,
  eye:       Eye,
  clock:     Clock,
}

const CAT_CONFIG = {
  patologia:  { label: "Patologia",  accent: "#EF4444", bg: "bg-red-50",    border: "border-red-200"    },
  tratamento: { label: "Tratamento", accent: "#2563EB", bg: "bg-blue-50",   border: "border-blue-200"   },
  protese:    { label: "Prótese",    accent: "#D97706", bg: "bg-amber-50",  border: "border-amber-200"  },
  especial:   { label: "Especial",   accent: "#0891B2", bg: "bg-cyan-50",   border: "border-cyan-200"   },
}

interface ProcedimentoPanelProps {
  pacienteId: string
}

export function ProcedimentoPanel({ pacienteId }: ProcedimentoPanelProps) {
  const activeProcedure    = useOdontogramaStore((s) => s.activeProcedure)
  const selectedFace       = useOdontogramaStore((s) => s.selectedFace)
  const setActiveProcedure = useOdontogramaStore((s) => s.setActiveProcedure)
  const applyProcedure     = useOdontogramaStore((s) => s.applyProcedure)

  const schedulePersist = () =>
    useOdontogramaStore.getState().schedulePersist(pacienteId)

  const handleClick = (chave: FaceStatus | "implante" | "extracao") => {
    if (chave === "implante" && selectedFace) {
      useOdontogramaStore.getState().toggleImplante(selectedFace.numero)
      schedulePersist(); return
    }
    if (chave === "extracao" && selectedFace) {
      useOdontogramaStore.getState().toggleExtracao(selectedFace.numero)
      schedulePersist(); return
    }
    const status = chave as FaceStatus
    setActiveProcedure(activeProcedure === status ? null : status)
  }

  const handleFastApply = (chave: FaceStatus | "implante" | "extracao") => {
    if (!selectedFace) return
    if (chave === "implante") {
      useOdontogramaStore.getState().toggleImplante(selectedFace.numero)
      schedulePersist(); return
    }
    if (chave === "extracao") {
      useOdontogramaStore.getState().toggleExtracao(selectedFace.numero)
      schedulePersist(); return
    }
    applyProcedure(selectedFace.numero, selectedFace.face, chave as FaceStatus)
    schedulePersist()
  }

  const categorias = Object.keys(CAT_CONFIG) as (keyof typeof CAT_CONFIG)[]

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Ferramentas
        </p>
        {activeProcedure && (
          <button
            onClick={() => setActiveProcedure(null)}
            className="text-[10px] font-medium text-blue-500 hover:text-blue-700 transition-colors"
          >
            Cancelar modo
          </button>
        )}
      </div>

      {/* Categorias */}
      {categorias.map((cat) => {
        const procs  = PROCEDIMENTOS.filter((p) => p.categoria === cat)
        if (!procs.length) return null
        const cfg = CAT_CONFIG[cat]

        return (
          <div key={cat} className="space-y-1.5">
            {/* Separador de categoria */}
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-100" />
              <span
                className="text-[9px] font-bold uppercase tracking-widest"
                style={{ color: cfg.accent }}
              >
                {cfg.label}
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            {/* Botões */}
            {procs.map((proc) => {
              const isActive = activeProcedure === proc.chave
              const Icone    = ICONE_MAP[proc.icone] ?? TriangleAlert

              return (
                <motion.button
                  key={proc.chave}
                  onClick={() => selectedFace ? handleFastApply(proc.chave) : handleClick(proc.chave)}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs font-medium text-left transition-all",
                    isActive
                      ? `${cfg.bg} ${cfg.border} shadow-sm`
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                  )}
                  style={isActive ? { color: cfg.accent } : {}}
                >
                  {/* Indicador de cor */}
                  <span
                    className="h-3 w-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: proc.cor }}
                  />
                  <Icone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="flex-1 truncate">{proc.label}</span>
                  {isActive && (
                    <span
                      className="shrink-0 h-1.5 w-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: cfg.accent }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        )
      })}

      {/* Dica contextual */}
      {selectedFace && !activeProcedure && (
        <p className="text-[10px] text-slate-400 text-center pt-1 leading-relaxed">
          Dente <strong className="text-slate-600">{selectedFace.numero}</strong> selecionado.
          Clique em um procedimento acima.
        </p>
      )}

      {activeProcedure && !selectedFace && (
        <p className="text-[10px] text-blue-500 text-center pt-1 leading-relaxed">
          Clique em uma face do dente para aplicar{" "}
          <strong>{PROCEDIMENTOS.find((p) => p.chave === activeProcedure)?.label}</strong>
        </p>
      )}
    </div>
  )
}
