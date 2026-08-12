"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { getToothType } from "./types"
import type { DenteData, FaceStatus, FaceId } from "./types"
import { useOdontogramaStore } from "@/store/odontograma-store"
import { ToothCell } from "./tooth-svg" // Fallback if needed, but we'll use realistic

// ── SVGs Realistas Antigos ───────────────────────────────────────────────────

const createToothFilter = (id: number) => (
  <filter id={`tooth-shadow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodOpacity="0.2" floodColor="#3a2a1a" />
    <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
    <feOffset dx="0" dy="0" in="blur" result="offsetBlur" />
    <feComposite operator="out" in="SourceAlpha" in2="offsetBlur" result="inverse" />
    <feFlood floodColor="black" floodOpacity="0.12" result="color" />
    <feComposite operator="in" in="color" in2="inverse" result="innerShadow" />
    <feMerge>
      <feMergeNode in="SourceGraphic" />
      <feMergeNode in="innerShadow" />
    </feMerge>
  </filter>
)

const RealisticIncisor = ({ id, color, highlight }: { id: number, color: string, highlight: string }) => (
  <g filter={`url(#tooth-shadow-${id})`}>
    <defs>
      {createToothFilter(id)}
      <linearGradient id={`inc-grad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="30%" stopColor={color} />
        <stop offset="100%" stopColor="rgba(220, 205, 185, 0.95)" />
      </linearGradient>
    </defs>
    <path d="M 14 32 C 14 8, 86 8, 86 32 C 90 70, 76 88, 50 88 C 24 88, 10 70, 14 32 Z" fill={`url(#inc-grad-${id})`} />
    <path d="M 22 30 C 22 18, 78 18, 78 30 C 80 55, 66 72, 50 72 C 34 72, 20 55, 22 30 Z" fill="rgba(255,255,255,0.2)" />
    <path d="M 20 24 C 50 14, 80 24, 82 26" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round" fill="none" />
  </g>
)

const RealisticCanine = ({ id, color, highlight }: { id: number, color: string, highlight: string }) => (
  <g filter={`url(#tooth-shadow-${id})`}>
    <defs>
      {createToothFilter(id)}
      <radialGradient id={`can-grad-${id}`} cx="50%" cy="38%" r="56%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="35%" stopColor={color} />
        <stop offset="100%" stopColor="rgba(215, 195, 170, 0.95)" />
      </radialGradient>
    </defs>
    <path d="M 24 20 C 50 2, 76 20, 84 50 C 88 76, 72 94, 50 94 C 28 94, 12 76, 16 50 Z" fill={`url(#can-grad-${id})`} />
    <ellipse cx="50" cy="32" rx="14" ry="10" fill="rgba(255,255,255,0.4)" />
    <path d="M 50 20 L 50 78" stroke="rgba(0,0,0,0.04)" strokeWidth="3" fill="none" />
  </g>
)

const RealisticPremolar = ({ id, color, highlight }: { id: number, color: string, highlight: string }) => (
  <g filter={`url(#tooth-shadow-${id})`}>
    <defs>
      {createToothFilter(id)}
      <radialGradient id={`pre-cusp1-${id}`} cx="50%" cy="30%" r="42%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor={color} />
        <stop offset="100%" stopColor="rgba(225, 210, 190, 0.95)" />
      </radialGradient>
      <radialGradient id={`pre-cusp2-${id}`} cx="50%" cy="70%" r="42%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor={color} />
        <stop offset="100%" stopColor="rgba(220, 205, 185, 0.95)" />
      </radialGradient>
    </defs>
    <path d="M 20 28 C 32 6, 68 6, 80 28 C 90 48, 90 68, 80 88 C 68 94, 32 94, 20 88 C 10 68, 10 48, 20 28 Z" fill={color} />
    <ellipse cx="50" cy="30" rx="24" ry="20" fill={`url(#pre-cusp1-${id})`} opacity="0.95" />
    <ellipse cx="50" cy="70" rx="24" ry="20" fill={`url(#pre-cusp2-${id})`} opacity="0.95" />
    <path d="M 28 50 C 42 44, 58 56, 72 50" stroke="rgba(60,35,15,0.3)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
  </g>
)

const RealisticMolar = ({ id, color, highlight }: { id: number, color: string, highlight: string }) => (
  <g filter={`url(#tooth-shadow-${id})`}>
    <defs>
      {createToothFilter(id)}
      <radialGradient id={`mol-c1-${id}`} cx="35%" cy="35%" r="46%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor={color} />
        <stop offset="100%" stopColor="rgba(220, 205, 185, 0.95)" />
      </radialGradient>
      <radialGradient id={`mol-c2-${id}`} cx="65%" cy="35%" r="46%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor={color} />
        <stop offset="100%" stopColor="rgba(220, 205, 185, 0.95)" />
      </radialGradient>
      <radialGradient id={`mol-c3-${id}`} cx="35%" cy="65%" r="46%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor={color} />
        <stop offset="100%" stopColor="rgba(215, 200, 180, 0.95)" />
      </radialGradient>
      <radialGradient id={`mol-c4-${id}`} cx="65%" cy="65%" r="46%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor={color} />
        <stop offset="100%" stopColor="rgba(215, 200, 180, 0.95)" />
      </radialGradient>
    </defs>
    <path d="M 18 18 C 34 6, 66 6, 82 18 C 96 34, 96 66, 82 82 C 66 96, 34 96, 18 82 C 4 66, 4 34, 18 18 Z" fill={color} />
    <circle cx="34" cy="34" r="26" fill={`url(#mol-c1-${id})`} opacity="0.95" />
    <circle cx="66" cy="34" r="26" fill={`url(#mol-c2-${id})`} opacity="0.95" />
    <circle cx="34" cy="66" r="26" fill={`url(#mol-c3-${id})`} opacity="0.95" />
    <circle cx="66" cy="66" r="26" fill={`url(#mol-c4-${id})`} opacity="0.95" />
    <path d="M 28 50 C 38 46, 44 54, 50 50 C 56 46, 62 54, 72 50" stroke="rgba(60,35,15,0.3)" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M 50 28 C 46 38, 54 44, 50 50 C 46 56, 54 62, 50 72" stroke="rgba(60,35,15,0.3)" strokeWidth="4" strokeLinecap="round" fill="none" />
  </g>
)

const estadoConfig: Record<string, { label: string; cor: string; brilho: string }> = {
  saudavel: { label: "Saudável", cor: "rgba(250, 248, 242, 1)", brilho: "rgba(255, 255, 255, 1)" },
  cariado: { label: "Cárie", cor: "#EF4444", brilho: "rgba(255, 150, 150, 1)" },
  restaurado: { label: "Restaurado", cor: "#3B82F6", brilho: "rgba(150, 200, 255, 1)" },
  canal: { label: "Canal", cor: "#A78BFA", brilho: "rgba(200, 180, 255, 1)" },
  extraido: { label: "Extraído", cor: "rgba(255, 255, 255, 0.1)", brilho: "transparent" },
  proteses: { label: "Prótese/Coroa", cor: "#F59E0B", brilho: "rgba(255, 220, 150, 1)" },
  implante: { label: "Implante", cor: "#10B981", brilho: "rgba(150, 255, 200, 1)" },
}

function getToothWidth(type: string): string {
  if (type === "molar") return "10%"
  if (type === "premolar") return "8%"
  if (type === "canine") return "7.5%"
  return "7%" 
}

function useArchPositions(isUpper: boolean) {
  return useMemo(() => {
    const positions: Record<number, { x: number; y: number; rot: number }> = {}
    // Posições num arco perfeito
    const map = isUpper 
      ? [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
      : [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

    map.forEach((n, i) => {
      const t = (i - 7.5) / 7.5;
      const angleDeg = t * 80;
      const angleRad = (angleDeg * Math.PI) / 180;
      const rx = 36;
      const ry = 22;
      const x = 50 + Math.sin(angleRad) * rx;
      const y = isUpper 
        ? 80 - Math.cos(angleRad) * ry // Para superior, curva pra cima
        : 20 + Math.cos(angleRad) * ry // Para inferior, curva pra baixo
      positions[n] = { x, y, rot: isUpper ? 180 + angleDeg : -angleDeg };
    })
    return positions
  }, [isUpper])
}

function DenteRealista({
  dente, aoClique, isSelected
}: {
  dente: DenteData
  aoClique: (numero: number) => void
  isSelected: boolean
}) {
  const type = getToothType(dente.numero)
  // Determina o status geral do dente para colorir (simplificado)
  let status = "saudavel"
  if (dente.ausente || dente.extracao) status = "extraido"
  else if (dente.implante) status = "implante"
  else if (dente.faces.some(f => f.status === "cariado")) status = "cariado"
  else if (dente.faces.some(f => f.status === "restaurado")) status = "restaurado"
  else if (dente.faces.some(f => f.status === "canal")) status = "canal"
  else if (dente.faces.some(f => f.status === "proteses")) status = "proteses"

  const config = estadoConfig[status] || estadoConfig.saudavel

  const renderTooth = () => {
    switch (type) {
      case "molar": return <RealisticMolar id={dente.numero} color={config.cor} highlight={config.brilho} />;
      case "premolar": return <RealisticPremolar id={dente.numero} color={config.cor} highlight={config.brilho} />;
      case "canine": return <RealisticCanine id={dente.numero} color={config.cor} highlight={config.brilho} />;
      default: return <RealisticIncisor id={dente.numero} color={config.cor} highlight={config.brilho} />;
    }
  }

  return (
    <motion.button
      onClick={() => aoClique(dente.numero)}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "relative flex flex-col items-center gap-0.5 transition-all w-full",
        isSelected && "z-20"
      )}
    >
      <svg viewBox="0 0 100 100" className="w-full h-auto overflow-visible" style={{ opacity: status === "extraido" ? 0.2 : 1 }}>
        {renderTooth()}
        {/* Número do dente overlay */}
        <text
          x="50" y="55"
          textAnchor="middle" fontSize="24"
          fill="rgba(0,0,0,0.5)" fontWeight="800" fontFamily="system-ui"
          className="pointer-events-none drop-shadow-md"
        >
          {dente.numero}
        </text>
        <text
          x="50" y="54"
          textAnchor="middle" fontSize="24"
          fill="rgba(255,255,255,0.9)" fontWeight="800" fontFamily="system-ui"
          className="pointer-events-none"
        >
          {dente.numero}
        </text>
      </svg>
      {isSelected && (
        <motion.div
          layoutId="sel-realista"
          className="absolute -bottom-2 left-1/2 h-1.5 w-8 -translate-x-1/2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"
        />
      )}
    </motion.button>
  )
}

function Arcada({
  dentes, isUpper, denteSelecionado, aoClique
}: {
  dentes: DenteData[]
  isUpper: boolean
  denteSelecionado: number | null
  aoClique: (numero: number) => void
}) {
  const positions = useArchPositions(isUpper)

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Desenho da Gengiva */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gum-grad-${isUpper}`} x1="50%" y1="0%" x2="50%" y2="100%">
            {isUpper ? (
              <>
                <stop offset="0%" stopColor="#dca0a0" />
                <stop offset="60%" stopColor="#c87878" />
                <stop offset="100%" stopColor="#b06060" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#b06060" />
                <stop offset="40%" stopColor="#c87878" />
                <stop offset="100%" stopColor="#dca0a0" />
              </>
            )}
          </linearGradient>
        </defs>
        {isUpper ? (
          <path d="M 5 80 C 15 20, 85 20, 95 80 C 90 60, 50 45, 50 45 C 50 45, 10 60, 5 80 Z" fill={`url(#gum-grad-${isUpper})`} opacity="0.9" />
        ) : (
          <path d="M 5 20 C 15 80, 85 80, 95 20 C 90 40, 50 55, 50 55 C 50 55, 10 40, 5 20 Z" fill={`url(#gum-grad-${isUpper})`} opacity="0.9" />
        )}
      </svg>

      {/* Dentes */}
      {dentes.map((dente) => {
        const pos = positions[dente.numero]
        if (!pos) return null
        return (
          <div
            key={dente.numero}
            className="absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: getToothWidth(getToothType(dente.numero)),
              transform: `translate(-50%, -50%) rotate(${pos.rot}deg)`,
            }}
          >
            <DenteRealista
              dente={dente}
              aoClique={aoClique}
              isSelected={denteSelecionado === dente.numero}
            />
          </div>
        )
      })}
    </div>
  )
}

// ── Componente Principal com CSS 3D ──────────────────────────────────────────

export function OdontogramaInterativo() {
  const arcadaSup = useOdontogramaStore(s => s.arcadaSup)
  const arcadaInf = useOdontogramaStore(s => s.arcadaInf)
  const denteSelecionado = useOdontogramaStore(s => s.selectedTooth)
  const setDenteSelecionado = useOdontogramaStore(s => s.setSelectedTooth)
  const [aberta, setAberta] = useState(false)

  // Ao clicar num dente, seleciona ele e abre a boca
  const handleDenteClick = (numero: number) => {
    setDenteSelecionado(numero === denteSelecionado ? null : numero)
    if (!aberta) setAberta(true)
  }

  return (
    <div className="flex flex-col items-center space-y-6 w-full">
      {/* Controles de Abertura */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setAberta(!aberta)}
          className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-foreground shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all flex items-center gap-2"
        >
          {aberta ? "🦷 Fechar Boca" : "😮 Abrir Boca (3D)"}
        </button>
      </div>

      <p className="text-xs text-slate-500 max-w-sm text-center">
        Dica: Clique no botão acima para abrir a mandíbula em 3D, ou clique diretamente em um dente.
      </p>

      {/* Container de Perspectiva 3D */}
      <div 
        className="relative w-full max-w-[600px] mx-auto rounded-3xl"
        style={{ 
          aspectRatio: "1 / 1.1", 
          perspective: "1200px", 
          background: "radial-gradient(circle at center, #64748b 0%, #334155 100%)",
          boxShadow: "inset 0 0 100px rgba(0,0,0,0.5)"
        }}
      >
        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground tracking-[0.2em]">
          SUPERIOR
        </p>

        {/* Eixo central 3D */}
        <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          
          {/* Arcada Superior (Fixa) */}
          <div 
            className="absolute top-0 left-0 w-full h-[50%]"
            style={{ 
              transformOrigin: "bottom center",
              transform: "translateZ(20px)"
            }}
          >
            <Arcada 
              dentes={arcadaSup} 
              isUpper={true} 
              denteSelecionado={denteSelecionado} 
              aoClique={handleDenteClick} 
            />
          </div>

          {/* Arcada Inferior (Mandíbula Animada) */}
          {/* O pivô (transformOrigin) é no topo (parte de trás da boca), fazendo ela abrir para baixo */}
          <motion.div
            className="absolute bottom-0 left-0 w-full h-[50%]"
            initial={{ rotateX: 0 }}
            animate={{ rotateX: aberta ? -35 : 0 }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
            style={{ 
              transformOrigin: "top center",
              transformStyle: "preserve-3d"
            }}
          >
            <Arcada 
              dentes={arcadaInf} 
              isUpper={false} 
              denteSelecionado={denteSelecionado} 
              aoClique={handleDenteClick} 
            />
          </motion.div>

        </div>

        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground tracking-[0.2em] pointer-events-none">
          INFERIOR
        </p>
      </div>

      {/* Seção de Marcação Rápida */}
      <AnimatePresence>
        {denteSelecionado && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 w-full max-w-[600px]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                Ações para o Dente {denteSelecionado}
              </h3>
              <button 
                onClick={() => setDenteSelecionado(null)}
                className="text-sm text-slate-400 hover:text-slate-600"
              >
                Cancelar
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {Object.entries(estadoConfig).map(([status, config]) => (
                <button
                  key={status}
                  onClick={() => {
                    const dente = [...arcadaSup, ...arcadaInf].find(d => d.numero === denteSelecionado)
                    if (!dente) return
                    // Atualiza a face oclusal pra simular a cor do dente
                    useOdontogramaStore.getState().applyProcedure(dente.numero, "oclusal", status as FaceStatus)
                    setDenteSelecionado(null)
                  }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm transition-all"
                >
                  <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: config.cor }} />
                  {config.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
