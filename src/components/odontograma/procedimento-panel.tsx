"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { PROCEDIMENTOS } from "./types"
import type { FaceStatus } from "./types"
import { useOdontogramaStore } from "@/store/odontograma-store"
import {
  TriangleAlert, PaintBucket, GitFork, Crown, Syringe,
  Ban, Layers, Bone, Sparkles, Eye,
} from "lucide-react"

const ICONE_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  triangle: TriangleAlert,
  fill: PaintBucket,
  root: GitFork,
  crown: Crown,
  implant: Syringe,
  extract: Ban,
  layer: Layers,
  break: Bone,
  sparkle: Sparkles,
  eye: Eye,
}

interface ProcedimentoPanelProps {
  pacienteId: string
}

export function ProcedimentoPanel({ pacienteId }: ProcedimentoPanelProps) {
  const activeProcedure = useOdontogramaStore((s) => s.activeProcedure)
  const selectedFace = useOdontogramaStore((s) => s.selectedFace)
  const setActiveProcedure = useOdontogramaStore((s) => s.setActiveProcedure)
  const applyProcedure = useOdontogramaStore((s) => s.applyProcedure)

  const schedulePersist = () => useOdontogramaStore.getState().schedulePersist(pacienteId)

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
    if (activeProcedure === status) {
      setActiveProcedure(null)
    } else {
      setActiveProcedure(status)
    }
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

  return (
    <div className="space-y-3">
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

      <div className="grid grid-cols-2 gap-1.5">
        {PROCEDIMENTOS.map((proc) => {
          const isActive = activeProcedure === proc.chave
          const Icone = ICONE_MAP[proc.icone] || TriangleAlert

          return (
            <motion.button
              key={proc.chave}
              onClick={() => {
                if (selectedFace) {
                  handleFastApply(proc.chave)
                } else {
                  handleClick(proc.chave)
                }
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "rounded-lg px-2.5 py-2 text-xs font-medium border transition-all flex items-center gap-2",
                isActive
                  ? "border-purple-500/40 bg-purple-500/15 text-purple-300"
                  : "border-white/[0.06] bg-white/[0.02] text-white/60 hover:bg-white/[0.06] hover:text-white/85",
              )}
              title={selectedFace ? "Aplicar no dente selecionado" : "Clique em um dente no odontograma 2D para aplicar"}
            >
              <div
                className="h-2.5 w-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: proc.cor, opacity: 0.85 }}
              />
              <Icone className="h-3 w-3 shrink-0 opacity-60" />
              <span className="truncate">{proc.label}</span>
            </motion.button>
          )
        })}
      </div>

      {selectedFace && !activeProcedure && (
        <p className="text-[10px] text-white/30 text-center leading-relaxed">
          Dente {selectedFace.numero} selecionado. Clique em um procedimento acima para aplicar na face{" "}
          {selectedFace.face}.
        </p>
      )}

      {activeProcedure && !selectedFace && (
        <p className="text-[10px] text-purple-400/40 text-center leading-relaxed">
          Clique em um dente no odontograma 2D para aplicar{" "}
          <span className="text-purple-300/60 font-medium">
            {PROCEDIMENTOS.find((p) => p.chave === activeProcedure)?.label}
          </span>
        </p>
      )}
    </div>
  )
}
