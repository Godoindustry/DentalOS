"use client"

import { useState } from "react"
import { useOdontogramaStore } from "@/store/odontograma-store"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Grid3x3, User, FileText, Eye, EyeOff, ZoomIn, ZoomOut, Bone } from "lucide-react"
import { DerecFullChart } from "./derec-full-chart"
import { DerecSingleTooth } from "./derec-single-tooth"
import { DerecPerioGrid } from "./derec-perio-grid"
import { DerecPerioProbingPanel } from "./derec-perio-probing-panel"
import { DerecTimelineTrigger } from "./derec-timeline"
import { cn } from "@/lib/utils"

type DisplayMode = "overview" | "quickselect" | "perio-probing"

export function DerecLayout() {
  const selectedTooth = useOdontogramaStore((s) => s.selectedTooth)
  const setSelectedTooth = useOdontogramaStore((s) => s.setSelectedTooth)
  const viewMode = useOdontogramaStore((s) => s.viewMode)
  const setViewMode = useOdontogramaStore((s) => s.setViewMode)

  const [displayMode, setDisplayMode] = useState<DisplayMode>("overview")
  const [showRoots, setShowRoots] = useState(true)
  const [showBone, setShowBone] = useState(true)

  return (
    <div className="flex h-full w-full bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800 font-sans">

      {/* ── Sidebar Principal (Azul - Esquerda) ── */}
      <div className="w-16 shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-4">
        <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col gap-4 flex-1">
          <SidebarIcon icon={<Grid3x3 className="w-5 h-5" />} active title="Odontograma" />
          <SidebarIcon icon={<User className="w-5 h-5" />} title="Perfil do Paciente" />
          <SidebarIcon icon={<FileText className="w-5 h-5" />} title="Prontuário" />
        </div>

        <div className="flex flex-col gap-3 pb-2">
          <SpecialtyToggle label="Endo" active={viewMode === "endo"} onClick={() => setViewMode("endo")} />
          <SpecialtyToggle label="Perio" active={viewMode === "perio"} onClick={() => { setViewMode("perio"); setDisplayMode("perio-probing") }} />
          <SpecialtyToggle label="Dental" active={viewMode === "dental"} onClick={() => setViewMode("dental")} />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Header (Modos de Exibição) ── */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/50 border-b border-slate-700">
          <div className="flex gap-1 bg-slate-900/60 rounded-lg p-1">
            <ModeTab active={displayMode === "overview"} onClick={() => setDisplayMode("overview")} label="Overview" />
            <ModeTab active={displayMode === "quickselect"} onClick={() => setDisplayMode("quickselect")} label="Quickselect" />
            <ModeTab active={displayMode === "perio-probing"} onClick={() => setDisplayMode("perio-probing")} label="Periodontal Probing" />
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400" /> Restauração</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400" /> Cárie</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-400" /> Canal</span>
          </div>
        </div>

        {/* ── Área Principal ── */}
        <div className="flex-1 relative overflow-hidden bg-slate-900/50 flex">
          <AnimatePresence mode="wait">
            {displayMode === "perio-probing" ? (
              <motion.div key="perio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex">
                <DerecPerioProbingPanel toothNumber={selectedTooth ?? 24} onClose={() => setSelectedTooth(null)} />
                <div className="flex-1 flex flex-col overflow-auto">
                  <DerecPerioGrid isUpper={true} />
                  <DerecPerioGrid isUpper={false} />
                </div>
              </motion.div>
            ) : selectedTooth ? (
              <motion.div
                key="single-tooth"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="absolute inset-0 z-10 bg-slate-900 flex"
              >
                <DerecSingleTooth />
              </motion.div>
            ) : (
              <motion.div
                key="full-chart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8 overflow-auto"
              >
                <DerecFullChart />
                {displayMode === "quickselect" && (
                  <p className="mt-6 text-xs text-teal-400/80 tracking-wide">Modo Quickselect — clique num dente para aplicar o procedimento ativo rapidamente</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Ferramentas Flutuantes (Direita) ── */}
          <div className="absolute right-4 top-4 flex flex-col gap-2 z-30">
            <ToolIcon icon={showRoots ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />} onClick={() => setShowRoots((v) => !v)} title="Mostrar/Ocultar Raízes" />
            <ToolIcon icon={<Bone className="w-4 h-4" />} onClick={() => setShowBone((v) => !v)} active={showBone} title="Nível Ósseo" />
            <ToolIcon icon={<ZoomIn className="w-4 h-4" />} title="Zoom In" />
            <ToolIcon icon={<ZoomOut className="w-4 h-4" />} title="Zoom Out" />
          </div>

          {/* ── Timeline / Rollback ── */}
          <div className="absolute left-4 bottom-4 z-30">
            <DerecTimelineTrigger />
          </div>
        </div>
      </div>

    </div>
  )
}

function SidebarIcon({ icon, active, title }: { icon: React.ReactNode; active?: boolean; title: string }) {
  return (
    <button
      title={title}
      className={cn(
        "p-2.5 rounded-xl transition-colors",
        active ? "bg-teal-500/15 text-teal-400 ring-1 ring-teal-500/40" : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
      )}
    >
      {icon}
    </button>
  )
}

function SpecialtyToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 py-1.5 px-1 rounded-lg transition-colors",
        active ? "text-teal-400" : "text-slate-600 hover:text-slate-400"
      )}
    >
      {active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
    </button>
  )
}

function ModeTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-md text-xs font-semibold transition-all",
        active ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
      )}
    >
      {label}
    </button>
  )
}

function ToolIcon({ icon, onClick, active, title }: { icon: React.ReactNode; onClick?: () => void; active?: boolean; title: string }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        "p-2 rounded-lg bg-slate-800/80 border border-slate-700 transition-colors",
        active ? "text-teal-400 border-teal-500/50" : "text-slate-400 hover:text-slate-200"
      )}
    >
      {icon}
    </button>
  )
}
