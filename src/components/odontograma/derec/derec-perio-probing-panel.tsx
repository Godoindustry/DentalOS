"use client"

import { useState } from "react"
import { useOdontogramaStore } from "@/store/odontograma-store"
import { ChevronLeft, ChevronRight, VolumeX, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PerioToothData, ProbingDepth } from "../types"

type FieldKey = keyof ProbingDepth

const FIELD_LABELS: Record<FieldKey, string> = {
  distoPalatal: "Disto Palatal",
  palatal: "Palatal",
  mesioPalatal: "Mesio Palatal",
  distoBuccal: "Disto Buccal",
  buccal: "Buccal",
  mesioBuccal: "Mesio Buccal",
}

const TOP_ROW: FieldKey[] = ["distoPalatal", "palatal", "mesioPalatal"]
const BOTTOM_ROW: FieldKey[] = ["distoBuccal", "buccal", "mesioBuccal"]

const KEYPAD: (number | ">12")[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, ">12"]

interface Props {
  toothNumber: number
  onClose: () => void
}

export function DerecPerioProbingPanel({ toothNumber, onClose }: Props) {
  const perioData = useOdontogramaStore((s) => s.perioData[toothNumber])
  const updateProbingDepth = useOdontogramaStore((s) => s.updateProbingDepth)
  const updatePerioPoint = useOdontogramaStore((s) => s.updatePerioPoint)
  const setSelectedTooth = useOdontogramaStore((s) => s.setSelectedTooth)
  const nextTooth = useOdontogramaStore((s) => s.nextTooth)
  const arcadaSup = useOdontogramaStore((s) => s.arcadaSup)
  const arcadaInf = useOdontogramaStore((s) => s.arcadaInf)

  const [tab, setTab] = useState<"probing" | "margin">("probing")
  const [activeField, setActiveField] = useState<FieldKey>("buccal")

  const target: ProbingDepth = (tab === "probing" ? perioData?.probing : perioData?.gingivalMargin) || {
    distoBuccal: null, buccal: null, mesioBuccal: null,
    distoPalatal: null, palatal: null, mesioPalatal: null,
  }

  // ponto de placa/sangramento associado ao campo ativo (mapeado por posição vestibular/palatina)
  const positionKey: keyof PerioToothData["points"] =
    activeField === "distoBuccal" ? "db" : activeField === "buccal" ? "b" : activeField === "mesioBuccal" ? "mb"
    : activeField === "distoPalatal" ? "dp" : activeField === "palatal" ? "p" : "mp"
  const point = perioData?.points?.[positionKey]

  const handleKeypad = (val: number | ">12") => {
    const numeric = val === ">12" ? 13 : val
    updateProbingDepth(toothNumber, tab === "margin", activeField, numeric)
  }

  const handleNext = () => {
    const next = nextTooth(toothNumber)
    if (next) setSelectedTooth(next)
    else onClose()
  }

  const handlePrev = () => {
    const sequence = [...arcadaSup, ...arcadaInf].map((d) => d.numero)
    const idx = sequence.indexOf(toothNumber)
    if (idx > 0) setSelectedTooth(sequence[idx - 1])
  }

  return (
    <div className="w-72 shrink-0 bg-slate-800/60 border-r border-slate-700 flex flex-col text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <button onClick={handlePrev} className="p-1 hover:bg-slate-700 rounded">
          <ChevronLeft className="w-4 h-4 text-slate-400" />
        </button>
        <span className="text-sm font-semibold tracking-wide">Tooth {toothNumber}</span>
        <div className="flex items-center gap-1">
          <button onClick={handleNext} className="p-1 hover:bg-slate-700 rounded"><ChevronRight className="w-4 h-4 text-slate-400" /></button>
          <button className="p-1 hover:bg-slate-700 rounded"><VolumeX className="w-4 h-4 text-slate-400" /></button>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded"><X className="w-4 h-4 text-slate-400" /></button>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-auto">
        {/* Grade de valores 3x2 */}
        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-1">
            {TOP_ROW.map((f) => (
              <FieldCell key={f} field={f} value={target[f]} active={activeField === f} onClick={() => setActiveField(f)} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1">
            {BOTTOM_ROW.map((f) => (
              <FieldCell key={f} field={f} value={target[f]} active={activeField === f} onClick={() => setActiveField(f)} />
            ))}
          </div>
        </div>

        {/* Tabs Probing Depth / Gingival Margin */}
        <div className="flex gap-4 border-b border-slate-700 text-[11px] font-bold tracking-wide uppercase">
          <button
            onClick={() => setTab("probing")}
            className={cn("pb-2 border-b-2", tab === "probing" ? "border-teal-400 text-teal-400" : "border-transparent text-slate-500")}
          >
            Probing Depth
          </button>
          <button
            onClick={() => setTab("margin")}
            className={cn("pb-2 border-b-2", tab === "margin" ? "border-teal-400 text-teal-400" : "border-transparent text-slate-500")}
          >
            Gingival Margin
          </button>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-5 gap-1.5">
          {KEYPAD.map((v) => {
            const active = target[activeField] === (v === ">12" ? 13 : v)
            return (
              <button
                key={v}
                onClick={() => handleKeypad(v)}
                className={cn(
                  "h-9 rounded-md text-xs font-semibold transition-colors",
                  active ? "bg-slate-200 text-slate-900" : "bg-slate-900/60 text-slate-300 hover:bg-slate-700"
                )}
              >
                {v}
              </button>
            )
          })}
        </div>

        {/* Bleeding */}
        <button
          onClick={() => updatePerioPoint(toothNumber, positionKey, "bleeding", !point?.bleeding)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-700 transition-colors"
        >
          <span className="text-xs font-medium text-slate-300">Bleeding</span>
          <span className={cn("w-2.5 h-2.5 rounded-full", point?.bleeding ? "bg-red-500" : "bg-slate-600")} />
        </button>

        {/* Plaque / Pus / Tartar */}
        <div className="grid grid-cols-3 gap-2">
          <ToggleDot label="Plaque" color="bg-blue-500" active={!!point?.plaque} onClick={() => updatePerioPoint(toothNumber, positionKey, "plaque", !point?.plaque)} />
          <ToggleDot label="Pus" color="bg-yellow-500" active={!!point?.pus} onClick={() => updatePerioPoint(toothNumber, positionKey, "pus", !point?.pus)} />
          <ToggleDot label="Tartar" color="bg-slate-400" active={!!point?.calculus} onClick={() => updatePerioPoint(toothNumber, positionKey, "calculus", !point?.calculus)} />
        </div>
      </div>

      <button
        onClick={handleNext}
        className="m-4 mt-0 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm tracking-wider transition-colors"
      >
        NEXT TOOTH
      </button>
    </div>
  )
}

function FieldCell({ field, value, active, onClick }: { field: FieldKey; value: number | null; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 py-2 rounded-lg border transition-colors",
        active ? "bg-slate-950 border-red-500" : "bg-slate-900/60 border-slate-700 hover:border-slate-500"
      )}
    >
      <span className={cn("text-lg font-bold", active ? "text-red-400" : "text-slate-200")}>{value ?? 0}</span>
      <span className="text-[9px] text-slate-500 text-center leading-tight px-1">{FIELD_LABELS[field]}</span>
    </button>
  )
}

function ToggleDot({ label, color, active, onClick }: { label: string; color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-700 transition-colors"
    >
      <span className={cn("w-2.5 h-2.5 rounded-full", active ? color : "bg-slate-600")} />
      <span className="text-[10px] font-medium text-slate-400">{label}</span>
    </button>
  )
}
