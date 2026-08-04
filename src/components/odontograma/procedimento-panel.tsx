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

// ─── Mapa de ícones ───────────────────────────────────────────────────────────

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

// ─── Mapeamento de categoria → label / cor ────────────────────────────────────

const CAT_CONFIG = {
  patologia:  { label: "Patologia",   cor: "#EF4444" },
  tratamento: { label: "Tratamento",  cor: "#10B981" },
  protese:    { label: "Prótese",     cor: "#F59E0B" },
  especial:   { label: "Especial",    cor: "#06B6D4" },
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProcedimentoPanelProps {
  pacienteId: string
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function ProcedimentoPanel({ pacienteId }: ProcedimentoPanelProps) {
  const activeProcedure = useOdontogramaStore((s) => s.activeProcedure)
  const selectedFace    = useOdontogramaStore((s) => s.selectedFace)
  const setActiveProcedure = useOdontogramaStore((s) => s.setActiveProcedure)
  const applyProcedure     = useOdontogramaStore((s) => s.applyProcedure)

  const schedulePersist = () =>
    useOdontogramaStore.getState().schedulePersist(pacienteId)

  const handleClick = (chave: FaceStatus | "implante" | "extracao") => {
    if (chave === "implante" && selectedFace) {
      useOdontogramaStore.getState().toggleImplante(selectedFace.numero)
      schedulePersist()
      return
    }
    if (chave === "extracao" && selectedFace) {
      useOdontogramaStore.getState().toggleExtracao(selectedFace.numero)
      schedulePersist()
      return
    }
    const status = chave as FaceStatus
    setActiveProcedure(activeProcedure === status ? null : status)
  }

  const handleFastApply = (chave: FaceStatus | "implante" | "extracao") => {
    if (!selectedFace) return
    if (chave === "implante") {
      useOdontogramaStore.getState().toggleImplante(selectedFace.numero)
      schedulePersist()
      return
    }
    if (chave === "extracao") {
      useOdontogramaStore.getState().toggleExtracao(selectedFace.numero)
      schedulePersist()
      return
    }
    applyProcedure(selectedFace.numero, selectedFace.face, chave as FaceStatus)
    schedulePersist()
  }

  // Agrupa procedimentos por categoria
  const categorias = Object.keys(CAT_CONFIG) as (keyof typeof CAT_CONFIG)[]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
          Procedimentos
        </h3>
        {activeProcedure && (
          <button
            onClick={() => setActiveProcedure(null)}
            className="text-[10px] text-purple-400/70 hover:text-purple-300 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>

      {categorias.map((cat) => {
        const procs = PROCEDIMENTOS.filter((p) => p.categoria === cat)
        if (!procs.length) return null
        const catCfg = CAT_CONFIG[cat]

        return (
          <div key={cat} className="space-y-1.5">
            {/* Label da categoria */}
            <div className="flex items-center gap-2">
              <div className="h-px flex-1" style={{ background: `${catCfg.cor}30` }} />
              <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: `${catCfg.cor}70` }}>
                {catCfg.label}
              </span>
              <div className="h-px flex-1" style={{ background: `${catCfg.cor}30` }} />
            </div>

            {/* Botões dos procedimentos */}
            <div className="grid grid-cols-1 gap-1">
              {procs.map((proc) => {
                const isActive = activeProcedure === proc.chave
                const Icone    = ICONE_MAP[proc.icone] || TriangleAlert

                return (
                  <motion.button
                    key={proc.chave}
                    onClick={() => {
                      selectedFace
                        ? handleFastApply(proc.chave)
                        : handleClick(proc.chave)
                    }}
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-xs font-medium border transition-all flex items-center gap-2.5 text-left",
                      isActive
                        ? "border-purple-500/40 bg-purple-500/15 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.15)]"
                        : "border-white/[0.06] bg-white/[0.02] text-white/55 hover:bg-white/[0.06] hover:text-white/85",
                    )}
                    title={
                      selectedFace
                        ? `Aplicar "${proc.label}" no dente ${selectedFace.numero}`
                        : "Selecione um dente no odontograma"
                    }
                  >
                    {/* Dot de cor */}
                    <span
                      className="h-2.5 w-2.5 rounded-sm shrink-0 shadow-sm"
                      style={{ backgroundColor: proc.cor, opacity: 0.9 }}
                    />
                    {/* Ícone */}
                    <Icone className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    {/* Label */}
                    <span className="truncate flex-1">{proc.label}</span>
                    {/* Indicador ativo */}
                    {isActive && (
                      <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Dica contextual */}
      {selectedFace && !activeProcedure && (
        <p className="text-[10px] text-white/30 text-center leading-relaxed pt-1">
          Dente <span className="text-white/50 font-medium">{selectedFace.numero}</span> selecionado
          — clique em um procedimento acima para aplicar na face{" "}
          <span className="text-white/50">{selectedFace.face}</span>.
        </p>
      )}

      {activeProcedure && !selectedFace && (
        <p className="text-[10px] text-purple-400/40 text-center leading-relaxed pt-1">
          Clique em uma face do dente para aplicar{" "}
          <span className="text-purple-300/60 font-medium">
            {PROCEDIMENTOS.find((p) => p.chave === activeProcedure)?.label}
          </span>
        </p>
      )}
    </div>
  )
}
