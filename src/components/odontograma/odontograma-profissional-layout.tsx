"use client"

import { useCallback, useEffect, useRef, useState, Suspense } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, RotateCw } from "lucide-react"
import { useOdontograma } from "@/lib/queries"
import { useOdontogramaStore } from "@/store/odontograma-store"
import { Skeleton } from "@/components/ui/skeleton"
import { OdontogramaInterativo } from "./odontograma-interativo"
import { OdontogramaToolbar } from "./odontograma-toolbar"
import { ProcedimentoPanel } from "./procedimento-panel"
import { AnotacaoPanel } from "./anotacao-panel"
import { exportarJSON, exportarPDF } from "./exportacao-utils"

interface ProfessionalLayoutProps {
  pacienteId: string
  nomePaciente?: string
}

export function ProfessionalLayout({ pacienteId, nomePaciente }: ProfessionalLayoutProps) {
  const { data: odontoDB, loading } = useOdontograma(pacienteId)

  const initFromDb    = useOdontogramaStore((s) => s.initFromDb)
  const arcadaSup     = useOdontogramaStore((s) => s.arcadaSup)
  const arcadaInf     = useOdontogramaStore((s) => s.arcadaInf)
  const anotacoes     = useOdontogramaStore((s) => s.anotacoes)
  const selectedFace  = useOdontogramaStore((s) => s.selectedFace)
  const selectedTooth = useOdontogramaStore((s) => s.selectedTooth)
  const saving        = useOdontogramaStore((s) => s.saving)

  const hydratedFor = useRef<string | null>(null)
  
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!odontoDB?.dentes) return
    if (hydratedFor.current === pacienteId) return
    hydratedFor.current = pacienteId
    initFromDb(odontoDB.dentes)
  }, [odontoDB, pacienteId, initFromDb])

  const annotationTarget = selectedFace?.numero ?? selectedTooth ?? null

  const handleExportJSON = useCallback(() => {
    exportarJSON(arcadaSup, arcadaInf, anotacoes, nomePaciente)
  }, [arcadaSup, arcadaInf, anotacoes, nomePaciente])

  const handleExportPDF = useCallback(() => {
    const svgEl = document.querySelector("#odontograma-svg-container svg")
    exportarPDF(arcadaSup, arcadaInf, anotacoes, nomePaciente, svgEl?.outerHTML)
  }, [arcadaSup, arcadaInf, anotacoes, nomePaciente])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="rounded-xl" style={{ background: "#F8FAFC" }}>
      <div className="p-4 space-y-4">
        {/* Indicador de salvamento */}
        <AnimatePresence>
          {saving && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-xs text-slate-400"
            >
              <Loader2 className="h-3 w-3 animate-spin" />
              Salvando...
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar */}
        <OdontogramaToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onExportPDF={handleExportPDF}
          onExportJSON={handleExportJSON}
        />

        {/* Conteúdo principal: odontograma realista animado + painel lateral */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_220px] gap-4 items-start">
          {/* ── Odontograma Realista (CSS 3D) ── */}
          <OdontogramaInterativo />

          {/* ── Painel lateral ── */}
          <div className="space-y-3">
            {/* Ferramentas / Procedimentos */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <ProcedimentoPanel pacienteId={pacienteId} />
            </div>

            {/* Anotações clínicas */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <AnimatePresence mode="wait">
                {annotationTarget !== null ? (
                  <motion.div
                    key={annotationTarget}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <AnotacaoPanel toothNumber={annotationTarget} />
                  </motion.div>
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[11px] text-slate-400 text-center py-2 leading-relaxed"
                  >
                    Clique em um dente para<br />adicionar anotações.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
