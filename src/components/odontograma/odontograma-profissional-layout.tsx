"use client"

import { useCallback, useEffect, useRef, useState, Suspense } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, RotateCw } from "lucide-react"
import { useOdontograma } from "@/lib/queries"
import { useOdontogramaStore } from "@/store/odontograma-store"
import { Skeleton } from "@/components/ui/skeleton"
import { OdontogramaSVG } from "./odontograma-svg"
import { OdontogramaToolbar } from "./odontograma-toolbar"
import { ProcedimentoPanel } from "./procedimento-panel"
import { AnotacaoPanel } from "./anotacao-panel"
import { exportarJSON, exportarPDF } from "./exportacao-utils"

// ─── Canvas 3D carregado sob demanda (sem SSR) ────────────────────────────────
const Odontograma3DScene = dynamic(
  () => import("./odontograma-3d-scene").then((m) => m.Odontograma3DScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[320px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-accent/20">
        <RotateCw className="h-5 w-5 animate-spin text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Carregando modelo 3D...</p>
      </div>
    ),
  },
)

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProfessionalLayoutProps {
  pacienteId: string
  nomePaciente?: string
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function ProfessionalLayout({ pacienteId, nomePaciente }: ProfessionalLayoutProps) {
  const { data: odontoDB, loading } = useOdontograma(pacienteId)

  const initFromDb     = useOdontogramaStore((s) => s.initFromDb)
  const arcadaSup      = useOdontogramaStore((s) => s.arcadaSup)
  const arcadaInf      = useOdontogramaStore((s) => s.arcadaInf)
  const anotacoes      = useOdontogramaStore((s) => s.anotacoes)
  const selectedFace   = useOdontogramaStore((s) => s.selectedFace)
  const selectedTooth  = useOdontogramaStore((s) => s.selectedTooth)
  const saving         = useOdontogramaStore((s) => s.saving)

  // Referência para evitar re-hidratação na mesma sessão
  const hydratedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!odontoDB?.dentes) return
    if (hydratedFor.current === pacienteId) return
    hydratedFor.current = pacienteId
    initFromDb(odontoDB.dentes)
  }, [odontoDB, pacienteId, initFromDb])

  const [show3D, setShow3D]           = useState(true)
  const [searchTerm, setSearchTerm]   = useState("")

  // Dente para anotações: prioriza a face selecionada, depois o dente selecionado
  const annotationTarget = selectedFace?.numero ?? selectedTooth ?? null

  // ── Exportação ─────────────────────────────────────────────────────────────

  const handleExportJSON = useCallback(() => {
    exportarJSON(arcadaSup, arcadaInf, anotacoes, nomePaciente)
  }, [arcadaSup, arcadaInf, anotacoes, nomePaciente])

  const handleExportPDF = useCallback(() => {
    // Captura o SVG do DOM se disponível
    const svgEl = document.querySelector("#odontograma-svg-container svg")
    const svgHtml = svgEl ? svgEl.outerHTML : undefined
    exportarPDF(arcadaSup, arcadaInf, anotacoes, nomePaciente, svgHtml)
  }, [arcadaSup, arcadaInf, anotacoes, nomePaciente])

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Carregando odontograma...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* ── Barra de status de salvamento ─────────────────────────────── */}
      <AnimatePresence>
        {saving && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Loader2 className="h-3 w-3 animate-spin" />
            Salvando...
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <OdontogramaToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onExportPDF={handleExportPDF}
        onExportJSON={handleExportJSON}
      />

      {/* ── Arcada 3D (opcional) ──────────────────────────────────────── */}
      <div className="flex justify-end">
        <button
          onClick={() => setShow3D((v) => !v)}
          className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {show3D ? "Ocultar arcada 3D" : "Mostrar arcada 3D"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {show3D && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 380, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="h-[380px] w-full">
              <Suspense fallback={<Skeleton className="h-full w-full rounded-2xl" />}>
                <Odontograma3DScene pacienteId={pacienteId} />
              </Suspense>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Grid principal: SVG + painel lateral ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-5">

        {/* Odontograma SVG 2D */}
        <div className="min-w-0">
          <OdontogramaSVG pacienteId={pacienteId} searchTerm={searchTerm} />
        </div>

        {/* Painel lateral sticky */}
        <div className="lg:pt-0">
          <div className="sticky top-4 rounded-2xl border border-border bg-card/40 p-4 space-y-5">

            {/* Procedimentos */}
            <ProcedimentoPanel pacienteId={pacienteId} />

            {/* Separador */}
            <div className="h-px bg-white/[0.05]" />

            {/* Anotações clínicas (aparece quando um dente está selecionado) */}
            <AnimatePresence mode="wait">
              {annotationTarget !== null ? (
                <motion.div
                  key={annotationTarget}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                >
                  <AnotacaoPanel toothNumber={annotationTarget} />
                </motion.div>
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] text-white/20 text-center py-2"
                >
                  Selecione um dente para ver / adicionar anotações clínicas.
                </motion.p>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  )
}
