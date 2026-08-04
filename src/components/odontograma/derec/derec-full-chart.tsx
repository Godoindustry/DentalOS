"use client"

import { useOdontogramaStore } from "@/store/odontograma-store"
import { getToothType, ToothType, DenteData } from "../types"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// ── Helpers de SVG Anatômico (Wireframe + Preenchimento) ──────────────────────

function getCrownPath(type: ToothType): string {
  switch (type) {
    case "incisor": return "M 20 80 Q 20 20 50 20 Q 80 20 80 80 L 20 80 Z"
    case "canine":  return "M 20 80 Q 20 20 50 10 Q 80 20 80 80 L 20 80 Z"
    case "premolar":return "M 15 80 Q 15 20 35 25 Q 50 15 65 25 Q 85 20 85 80 Z"
    case "molar":   return "M 10 80 Q 10 20 30 25 Q 50 15 70 25 Q 90 20 90 80 Z"
  }
}

function getRootPath(type: ToothType): string {
  switch (type) {
    case "incisor": 
    case "canine": 
    case "premolar": 
      // Raiz única
      return "M 25 20 Q 50 -80 75 20 Z"
    case "molar":
      // Raízes múltiplas
      return "M 15 20 Q 30 -80 45 10 Q 50 0 55 10 Q 70 -80 85 20 Z"
  }
}

// ── Componente de Dente Individual (Visão Geral) ──────────────────────────────

function ChartTooth({ dente, isUpper }: { dente: DenteData, isUpper: boolean }) {
  const setSelectedTooth = useOdontogramaStore(s => s.setSelectedTooth)
  const selectedTooth = useOdontogramaStore(s => s.selectedTooth)
  const isSelected = selectedTooth === dente.numero
  
  const type = getToothType(dente.numero)
  const crownPath = getCrownPath(type)
  const rootPath = getRootPath(type)
  
  const isMissing = dente.ausente || dente.extracao
  
  // Cores de status básico
  const hasRestoration = dente.faces.some(f => f.status === "restaurado")
  const hasDecay = dente.faces.some(f => f.status === "cariado")
  const hasEndo = dente.faces.some(f => f.status === "canal")
  
  let crownFill = "#F1F5F9" // Saudável (marfim claro)
  if (hasRestoration) crownFill = "#7DD3FC" // Azul claro
  if (hasDecay) crownFill = "#FCA5A5" // Vermelho claro
  if (dente.coroa || dente.faces.some(f => f.status === "proteses")) crownFill = "#FDE047" // Amarelo

  let rootFill = "#F8FAFC" // Cinza super claro
  if (hasEndo) { crownFill = "#C4B5FD"; rootFill = "#C4B5FD" } // Roxo — canal cobre coroa + raiz

  if (isMissing) {
    crownFill = "transparent"
    rootFill = "transparent"
  }

  return (
    <div 
      className={cn(
        "relative flex flex-col items-center justify-center cursor-pointer group transition-all",
        isSelected ? "scale-110 z-10" : "hover:scale-105"
      )}
      onClick={() => setSelectedTooth(dente.numero)}
    >
      <div className={cn(
        "w-12 h-32 relative", // Container do SVG do dente
        isUpper ? "" : "scale-y-[-1]" // Inverte para inferior
      )}>
        <svg viewBox="0 -80 100 160" className="w-full h-full overflow-visible drop-shadow-sm">
          {/* Fundo Branco/Sombra para não misturar */}
          <path d={crownPath} fill="#fff" opacity={0.5} />
          
          {/* Raiz */}
          {!dente.implante ? (
            <path 
              d={rootPath} 
              fill={rootFill} 
              stroke={isMissing ? "#CBD5E1" : "#94A3B8"} 
              strokeWidth={isMissing ? 2 : 1}
              strokeDasharray={isMissing ? "4 4" : "0"}
            />
          ) : (
            // Implante (Parafuso Prata)
            <g>
              <rect x="35" y="-60" width="30" height="80" fill="#CBD5E1" stroke="#64748B" rx="5" />
              <line x1="30" y1="-50" x2="70" y2="-50" stroke="#94A3B8" strokeWidth="3" />
              <line x1="30" y1="-30" x2="70" y2="-30" stroke="#94A3B8" strokeWidth="3" />
              <line x1="30" y1="-10" x2="70" y2="-10" stroke="#94A3B8" strokeWidth="3" />
            </g>
          )}

          {/* Coroa */}
          <path 
            d={crownPath} 
            fill={crownFill} 
            stroke={isMissing ? "#CBD5E1" : "#475569"} 
            strokeWidth={isMissing ? 2 : 1.5}
            strokeDasharray={isMissing ? "4 4" : "0"}
          />
        </svg>
      </div>

      {/* Número do Dente (Sempre na parte "inferior" da caixa, relativo ao layout real) */}
      <div className={cn(
        "absolute text-xs font-bold text-slate-400 group-hover:text-teal-400 transition-colors",
        isUpper ? "bottom-[-20px]" : "top-[-20px]"
      )}>
        {dente.numero}
      </div>

      {/* Indicador de Seleção */}
      {isSelected && (
        <motion.div 
          layoutId="chart-selection"
          className={cn(
            "absolute w-full h-1 bg-teal-500 rounded-full",
            isUpper ? "bottom-[-30px]" : "top-[-30px]"
          )}
        />
      )}
    </div>
  )
}

// ── Gráfico Principal (Arcadas Completas) ────────────────────────────────────

function GumLine() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
      <path d="M 0 42 Q 100 48 200 42 T 400 42 T 600 42 T 800 42" fill="none" stroke="rgba(59, 130, 246, 0.55)" strokeWidth="2.5" />
      <path d="M 0 48 Q 100 54 200 48 T 400 48 T 600 48 T 800 48" fill="none" stroke="rgba(239, 68, 68, 0.55)" strokeWidth="2.5" strokeDasharray="3 3" />
    </svg>
  )
}

export function DerecFullChart() {
  const arcadaSup = useOdontogramaStore(s => s.arcadaSup)
  const arcadaInf = useOdontogramaStore(s => s.arcadaInf)

  return (
    <div className="flex flex-col items-center justify-center gap-16 w-full max-w-6xl mx-auto py-8">

      {/* ── ARCADA SUPERIOR ── */}
      <div className="relative flex items-center justify-center gap-1">
        <GumLine />
        <div className="flex gap-1 border-r-2 border-slate-700/50 pr-4">
          {arcadaSup.filter(d => d.numero <= 18 && d.numero >= 11).reverse().map(d => (
            <ChartTooth key={d.numero} dente={d} isUpper={true} />
          ))}
        </div>
        <div className="flex gap-1 pl-4">
          {arcadaSup.filter(d => d.numero >= 21 && d.numero <= 28).map(d => (
            <ChartTooth key={d.numero} dente={d} isUpper={true} />
          ))}
        </div>
      </div>

      {/* Números dos dentes */}
      <div className="flex items-center justify-center gap-1 -mt-12 text-[10px] font-bold text-slate-500">
        {[...arcadaSup.filter(d => d.numero <= 18 && d.numero >= 11).reverse(), ...arcadaSup.filter(d => d.numero >= 21 && d.numero <= 28)].map(d => (
          <span key={d.numero} className="w-12 text-center">{d.numero}</span>
        ))}
      </div>

      {/* ── ARCADA INFERIOR ── */}
      <div className="relative flex items-center justify-center gap-1">
        <GumLine />
        <div className="flex gap-1 border-r-2 border-slate-700/50 pr-4">
          {arcadaInf.filter(d => d.numero <= 48 && d.numero >= 41).reverse().map(d => (
            <ChartTooth key={d.numero} dente={d} isUpper={false} />
          ))}
        </div>
        <div className="flex gap-1 pl-4">
          {arcadaInf.filter(d => d.numero >= 31 && d.numero <= 38).map(d => (
            <ChartTooth key={d.numero} dente={d} isUpper={false} />
          ))}
        </div>
      </div>

    </div>
  )
}
