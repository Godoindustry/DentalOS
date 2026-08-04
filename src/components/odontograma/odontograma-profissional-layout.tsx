"use client"

import { useEffect, useRef, useState, Suspense } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, RotateCw } from "lucide-react"
import { useOdontograma } from "@/lib/queries"
import { useOdontogramaStore } from "@/store/odontograma-store"
import { Skeleton } from "@/components/ui/skeleton"
import { OdontogramaProfissional } from "./odontograma-profissional"
import { ProcedimentoPanel } from "./procedimento-panel"

// Canvas 3D só existe no browser (WebGL) — carregado sob demanda, sem SSR,
// para nunca travar a navegação inicial da página.
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
  }
)

interface ProfessionalLayoutProps {
  pacienteId: string
}

export function ProfessionalLayout({ pacienteId }: ProfessionalLayoutProps) {
  const { data: odontoDB, loading } = useOdontograma(pacienteId)

  const initFromDb = useOdontogramaStore((s) => s.initFromDb)
  // Garante que a hidratação a partir do banco só roda uma vez por paciente,
  // mesmo que `odontoDB` mude de referência entre re-renders.
  const hydratedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!odontoDB?.dentes) return
    if (hydratedFor.current === pacienteId) return
    hydratedFor.current = pacienteId
    initFromDb(odontoDB.dentes)
  }, [odontoDB, pacienteId, initFromDb])

  const saving = useOdontogramaStore((s) => s.saving)

  const [show3D, setShow3D] = useState(true)

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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
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
        <button
          onClick={() => setShow3D((v) => !v)}
          className="ml-auto rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {show3D ? "Ocultar arcada 3D" : "Mostrar arcada 3D"}
        </button>
      </div>

      {/* Arcada 3D — visualização espacial complementar, clicável por dente */}
      {show3D && (
        <div className="h-[380px] w-full">
          <Suspense
            fallback={<Skeleton className="h-full w-full rounded-2xl" />}
          >
            <Odontograma3DScene pacienteId={pacienteId} />
          </Suspense>
        </div>
      )}

      {/* Odontograma 2D SVG + Painel de Procedimentos */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-5">
        <div className="min-w-0">
          <OdontogramaProfissional pacienteId={pacienteId} />
        </div>
        <div className="lg:pt-0">
          <div className="sticky top-4 rounded-2xl border border-border bg-card/40 p-4 space-y-4">
            <ProcedimentoPanel pacienteId={pacienteId} />
          </div>
        </div>
      </div>
    </div>
  )
}
