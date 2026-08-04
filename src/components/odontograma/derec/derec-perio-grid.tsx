"use client"

import { useState } from "react"
import { useOdontogramaStore } from "@/store/odontograma-store"
import { cn } from "@/lib/utils"

export function DerecPerioGrid({ isUpper }: { isUpper: boolean }) {
  const arcadaSup = useOdontogramaStore((s) => s.arcadaSup)
  const arcadaInf = useOdontogramaStore((s) => s.arcadaInf)
  const selectedTooth = useOdontogramaStore((s) => s.selectedTooth)
  const setSelectedTooth = useOdontogramaStore((s) => s.setSelectedTooth)
  const [quickselect, setQuickselect] = useState(false)

  const teeth = isUpper ? arcadaSup : arcadaInf

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Periodontal Probing</p>
          <h3 className="text-sm font-bold text-slate-200">{isUpper ? "Upper Jaw" : "Lower Jaw"}</h3>
        </div>
        <button
          onClick={() => setQuickselect((v) => !v)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors",
            quickselect ? "bg-teal-500/20 border-teal-500 text-teal-400" : "bg-slate-800 border-slate-700 text-slate-400"
          )}
        >
          Quickselect
          <span className={cn("w-7 h-3.5 rounded-full relative transition-colors", quickselect ? "bg-teal-500" : "bg-slate-600")}>
            <span className={cn("absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all", quickselect ? "left-3.5" : "left-0.5")} />
          </span>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center py-6">
        <div className="flex items-end gap-1">
          {teeth.map((d) => (
            <PerioCell
              key={d.numero}
              numero={d.numero}
              isUpper={isUpper}
              selected={selectedTooth === d.numero}
              onSelect={() => setSelectedTooth(d.numero)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function PerioCell({ numero, isUpper, selected, onSelect }: { numero: number; isUpper: boolean; selected: boolean; onSelect: () => void }) {
  const pData = useOdontogramaStore((s) => s.perioData[numero])
  const points = pData?.points

  const dotRow = (positions: ("db" | "b" | "mb")[]) => (
    <div className="flex justify-center gap-0.5">
      {positions.map((pos) => {
        const p = points?.[pos]
        const color = p?.bleeding ? "bg-red-500" : p?.plaque ? "bg-blue-500" : p?.pus ? "bg-yellow-500" : p?.calculus ? "bg-slate-400" : "bg-slate-700"
        return <span key={pos} className={cn("w-1 h-1 rounded-full", color)} />
      })}
    </div>
  )

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-10 flex flex-col items-center gap-1 py-1 rounded-md transition-colors",
        isUpper ? "" : "flex-col-reverse",
        selected ? "bg-teal-500/10 ring-1 ring-teal-500/50" : "hover:bg-slate-800/60"
      )}
    >
      {dotRow(["db", "b", "mb"])}
      <div className={cn("w-6 h-9 rounded-full bg-gradient-to-b from-slate-200 to-slate-400/80 border border-slate-500", !isUpper && "rotate-180")} />
      <span className="text-[9px] font-bold text-slate-500">{numero}</span>
    </button>
  )
}
