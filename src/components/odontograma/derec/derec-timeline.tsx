"use client"

import { useState } from "react"
import { useOdontogramaStore } from "@/store/odontograma-store"
import { History, X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`
}

export function DerecTimelineTrigger() {
  const [open, setOpen] = useState(false)
  const snapshots = useOdontogramaStore((s) => s.timelineSnapshots) || []

  const mockDates = ["11.08.2018", "05.08.2018", "31.07.2018"]
  const dates = snapshots.length > 0 ? snapshots.map((s: any) => formatDate(s.date)) : mockDates
  const [selected, setSelected] = useState(0)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-teal-400 transition-colors"
        title="Linha do tempo"
      >
        <History className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-80 bg-white rounded-2xl shadow-2xl overflow-hidden text-slate-800"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold">Select Date</h3>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-slate-100 rounded-full">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="py-2">
              <div className="px-5 py-2 text-xs text-slate-400 font-medium">Current state</div>
              {dates.map((d, i) => (
                <button
                  key={d}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "w-full text-left px-5 py-2.5 text-sm transition-colors",
                    i === selected ? "font-bold text-slate-900 bg-slate-50" : "text-slate-400 hover:bg-slate-50"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 px-5 py-4 bg-slate-950 text-foreground">
              <button
                onClick={() => setSelected((s) => Math.min(dates.length - 1, s + 1))}
                className="p-1 hover:bg-slate-800 rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold tracking-wide">{dates[selected]}</span>
              <button
                onClick={() => setSelected((s) => Math.max(0, s - 1))}
                className="p-1 hover:bg-slate-800 rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
