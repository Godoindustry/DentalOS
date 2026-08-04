"use client"

import { useState } from "react"
import { useOdontogramaStore } from "@/store/odontograma-store"
import {
  getToothType, FaceId, FACE_LABELS, LOG_TIPO_COR,
  ENDO_TEST_LABELS, ENDO_RESULT_LABELS, COLD_TEST_OPTIONS, STANDARD_TEST_OPTIONS,
  type EndoTestKey, type EndoResult,
} from "../types"
import { RotateCcw, CircleOff, AlertTriangle, PlusSquare, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

const FACES: FaceId[] = ["mesial", "vestibular", "distal", "oclusal", "lingual", "palatina"]
const ENDO_KEYS: EndoTestKey[] = ["cold", "percussion", "palpation", "heat", "electricity"]
const PROBING_FIELDS: { key: "distoBuccal" | "buccal" | "mesioBuccal"; label: string }[] = [
  { key: "distoBuccal", label: "Disto Buccal" },
  { key: "buccal", label: "Buccal" },
  { key: "mesioBuccal", label: "Mesio Buccal" },
]

export function DerecSingleTooth() {
  const selectedTooth = useOdontogramaStore((s) => s.selectedTooth)
  const setSelectedTooth = useOdontogramaStore((s) => s.setSelectedTooth)
  const arcadaSup = useOdontogramaStore((s) => s.arcadaSup)
  const arcadaInf = useOdontogramaStore((s) => s.arcadaInf)
  const applyProcedure = useOdontogramaStore((s) => s.applyProcedure)
  const resetDente = useOdontogramaStore((s) => s.resetDente)
  const addAnotacao = useOdontogramaStore((s) => s.addAnotacao)
  const anotacoes = useOdontogramaStore((s) => s.anotacoes[selectedTooth ?? -1]) || []
  const endoData = useOdontogramaStore((s) => s.endoData[selectedTooth ?? -1])
  const perioData = useOdontogramaStore((s) => s.perioData[selectedTooth ?? -1])
  const updateEndoTest = useOdontogramaStore((s) => s.updateEndoTest)

  const [pickerMode, setPickerMode] = useState<"pathology" | "restoration" | null>(null)
  const [openTest, setOpenTest] = useState<EndoTestKey | null>(null)

  const allTeeth = [...arcadaSup, ...arcadaInf]
  const dente = allTeeth.find((d) => d.numero === selectedTooth)

  if (!selectedTooth || !dente) return null

  const type = getToothType(dente.numero)

  const handleMissing = () => {
    applyProcedure(dente.numero, "oclusal", "ausente")
    addAnotacao(dente.numero, "Marcado como ausente", "missing")
  }

  const handlePickFace = (face: FaceId) => {
    if (pickerMode === "pathology") {
      applyProcedure(dente.numero, face, "cariado")
      addAnotacao(dente.numero, `${FACE_LABELS[face]}, Cárie`, "pathology")
    } else if (pickerMode === "restoration") {
      applyProcedure(dente.numero, face, "restaurado")
      addAnotacao(dente.numero, `${FACE_LABELS[face]}, Restauração`, "restoration")
    }
    setPickerMode(null)
  }

  const handleEndoPick = (test: EndoTestKey, value: EndoResult) => {
    updateEndoTest(dente.numero, test, value)
    setOpenTest(null)
  }

  return (
    <div className="flex w-full h-full text-slate-200 bg-slate-900">

      {/* ── Coluna de troca rápida de dente ── */}
      <div className="w-14 shrink-0 bg-slate-950/60 border-r border-slate-800 flex flex-col items-center py-3 gap-1 overflow-y-auto">
        {allTeeth.map((d) => (
          <button
            key={d.numero}
            onClick={() => setSelectedTooth(d.numero)}
            className={cn(
              "w-9 h-7 rounded-md text-[11px] font-bold transition-colors shrink-0",
              d.numero === selectedTooth ? "bg-teal-500 text-slate-950" : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
            )}
          >
            {d.numero}
          </button>
        ))}
      </div>

      {/* ── Tríptico Anatômico ── */}
      <div className="w-56 shrink-0 bg-slate-800/60 border-r border-slate-800 p-6 flex flex-col items-center justify-center gap-8">
        <TriptychView label="Vestibular / Raiz">
          <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-xl">
            <path d="M 20 80 Q 50 -30 80 80 Z" fill="#E2E8F0" />
            <path d="M 15 140 Q 15 80 50 80 Q 85 80 85 140 Q 50 160 15 140 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
            <path d="M 12 108 Q 50 100 88 108" stroke="#3B82F6" strokeWidth="2" fill="none" opacity="0.7" />
            <path d="M 12 112 Q 50 104 88 112" stroke="#EF4444" strokeWidth="2" fill="none" opacity="0.7" />
          </svg>
        </TriptychView>
        <div className="flex gap-8">
          <TriptychView label="Oclusal" small>
            <div className="w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center border border-slate-300">
              <div className="w-8 h-8 rounded-full border border-slate-200 opacity-60" />
            </div>
          </TriptychView>
          <TriptychView label="Lingual" small>
            <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-xl">
              <path d="M 15 80 Q 15 20 50 20 Q 85 20 85 80 Q 50 100 15 80 Z" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
            </svg>
          </TriptychView>
        </div>
      </div>

      {/* ── Painel Principal ── */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Dental <span className="text-teal-400">— Dente {dente.numero}</span></h2>
          <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wide">
            <ActionButton icon={<RotateCcw className="w-3.5 h-3.5" />} label="Reset" onClick={() => resetDente(dente.numero)} />
            <ActionButton icon={<CircleOff className="w-3.5 h-3.5" />} label="Missing" onClick={handleMissing} />
            <ActionButton
              icon={<AlertTriangle className="w-3.5 h-3.5" />}
              label="Pathology"
              onClick={() => setPickerMode(pickerMode === "pathology" ? null : "pathology")}
              active={pickerMode === "pathology"}
            />
            <ActionButton
              icon={<PlusSquare className="w-3.5 h-3.5" />}
              label="Restoration"
              onClick={() => setPickerMode(pickerMode === "restoration" ? null : "restoration")}
              active={pickerMode === "restoration"}
            />
            <button onClick={() => setSelectedTooth(null)} className="p-1 hover:bg-slate-800 rounded-full">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Seletor de face (aparece ao clicar +Pathology / +Restoration) */}
        {pickerMode && (
          <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-slate-800/60 border border-slate-700">
            <span className="text-[11px] text-slate-400 self-center mr-1">Selecione a face:</span>
            {FACES.map((f) => (
              <button
                key={f}
                onClick={() => handlePickFace(f)}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:border-teal-500 hover:text-teal-400 transition-colors"
              >
                {FACE_LABELS[f]}
              </button>
            ))}
          </div>
        )}

        {/* Log de procedimentos */}
        <div className="space-y-1.5">
          {anotacoes.length === 0 && (
            <p className="text-xs text-slate-500">Nenhum procedimento registrado para este dente.</p>
          )}
          {anotacoes.map((a) => (
            <div key={a.id} className="flex items-center gap-3 bg-slate-800/40 rounded-md pl-3 pr-4 py-2" style={{ borderLeft: `3px solid ${LOG_TIPO_COR[a.tipo ?? "nota"]}` }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Done</span>
              <span className="text-xs text-slate-200">{dente.numero}, {a.texto}</span>
            </div>
          ))}
        </div>

        {/* Endodontia + Periodontal */}
        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-300 mb-3">Endodontic</h3>
            <div className="space-y-1">
              {ENDO_KEYS.map((k) => {
                const value = endoData?.[k] ?? null
                const options = k === "cold" ? COLD_TEST_OPTIONS : STANDARD_TEST_OPTIONS
                return (
                  <div key={k} className="relative">
                    <button
                      onClick={() => setOpenTest(openTest === k ? null : k)}
                      className="w-full flex items-center justify-between py-2 border-b border-slate-800/80 hover:bg-slate-800/30 px-1 rounded transition-colors"
                    >
                      <span className="text-xs text-slate-400">{ENDO_TEST_LABELS[k]}</span>
                      <span className="flex items-center gap-1 text-xs font-medium text-teal-400">
                        {value ? ENDO_RESULT_LABELS[value] : "Test"}
                        <ChevronDown className="w-3 h-3" />
                      </span>
                    </button>
                    {openTest === k && (
                      <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg bg-white shadow-xl border border-slate-200 py-1">
                        {options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handleEndoPick(k, opt)}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100"
                          >
                            {ENDO_RESULT_LABELS[opt]}
                          </button>
                        ))}
                        <button
                          onClick={() => handleEndoPick(k, null)}
                          className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-slate-100 border-t border-slate-100"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-300 mb-3">Periodontal</h3>
            <div className="grid grid-cols-3 gap-2">
              {PROBING_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex flex-col items-center gap-1 bg-slate-800/40 rounded-lg py-2">
                  <span className={cn("text-base font-bold", (perioData?.probing[key] ?? 0) >= 4 ? "text-red-400" : "text-slate-200")}>
                    {perioData?.probing[key] ?? 0}
                  </span>
                  <span className="text-[8px] text-slate-500 text-center leading-tight px-1">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function TriptychView({ label, children, small }: { label: string; children: React.ReactNode; small?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500">{label}</span>
      <div className={small ? "w-16 h-16 flex items-center justify-center" : "w-24 h-40 flex items-center justify-center"}>
        {children}
      </div>
    </div>
  )
}

function ActionButton({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 transition-colors",
        active ? "text-teal-300" : "text-teal-400 hover:text-teal-300"
      )}
    >
      {icon}
      {label}
    </button>
  )
}
