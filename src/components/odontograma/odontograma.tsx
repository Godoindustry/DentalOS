"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { getToothType } from "./types"

type DenteState = "saudavel" | "caries" | "tratado" | "extraido" | "coroa" | "implante"

interface DenteInfo {
  numero: number
  nome: string
  estado: DenteState
}

const dentesSuperiores: DenteInfo[] = [
  { numero: 18, nome: "18", estado: "saudavel" }, { numero: 17, nome: "17", estado: "saudavel" },
  { numero: 16, nome: "16", estado: "saudavel" }, { numero: 15, nome: "15", estado: "saudavel" },
  { numero: 14, nome: "14", estado: "saudavel" }, { numero: 13, nome: "13", estado: "saudavel" },
  { numero: 12, nome: "12", estado: "saudavel" }, { numero: 11, nome: "11", estado: "saudavel" },
  { numero: 21, nome: "21", estado: "saudavel" }, { numero: 22, nome: "22", estado: "saudavel" },
  { numero: 23, nome: "23", estado: "saudavel" }, { numero: 24, nome: "24", estado: "saudavel" },
  { numero: 25, nome: "25", estado: "saudavel" }, { numero: 26, nome: "26", estado: "saudavel" },
  { numero: 27, nome: "27", estado: "saudavel" }, { numero: 28, nome: "28", estado: "saudavel" },
]

const dentesInferiores: DenteInfo[] = [
  { numero: 48, nome: "48", estado: "saudavel" }, { numero: 47, nome: "47", estado: "saudavel" },
  { numero: 46, nome: "46", estado: "saudavel" }, { numero: 45, nome: "45", estado: "saudavel" },
  { numero: 44, nome: "44", estado: "saudavel" }, { numero: 43, nome: "43", estado: "saudavel" },
  { numero: 42, nome: "42", estado: "saudavel" }, { numero: 41, nome: "41", estado: "saudavel" },
  { numero: 31, nome: "31", estado: "saudavel" }, { numero: 32, nome: "32", estado: "saudavel" },
  { numero: 33, nome: "33", estado: "saudavel" }, { numero: 34, nome: "34", estado: "saudavel" },
  { numero: 35, nome: "35", estado: "saudavel" }, { numero: 36, nome: "36", estado: "saudavel" },
  { numero: 37, nome: "37", estado: "saudavel" }, { numero: 38, nome: "38", estado: "saudavel" },
]

// SVG filters with soft shading (no specular lighting)
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
);

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
);

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
);

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
    <path d="M 35 50 C 46 46, 54 54, 65 50" stroke="rgba(50,25,10,0.45)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
  </g>
);

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
    <circle cx="50" cy="50" r="9" fill="rgba(70,40,15,0.35)" />
    <path d="M 28 50 C 38 46, 44 54, 50 50 C 56 46, 62 54, 72 50" stroke="rgba(60,35,15,0.3)" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M 50 28 C 46 38, 54 44, 50 50 C 46 56, 54 62, 50 72" stroke="rgba(60,35,15,0.3)" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M 34 50 C 40 47, 46 53, 50 50 C 54 47, 60 53, 66 50" stroke="rgba(50,25,10,0.45)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    <path d="M 50 34 C 47 40, 53 46, 50 50 C 47 54, 53 60, 50 66" stroke="rgba(50,25,10,0.45)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
  </g>
);

const estadoConfig: Record<DenteState, { label: string; cor: string; brilho: string }> = {
  saudavel: { label: "Saudável", cor: "rgba(250, 248, 242, 1)", brilho: "rgba(255, 255, 255, 1)" },
  caries: { label: "Cárie", cor: "#EF4444", brilho: "rgba(255, 150, 150, 1)" },
  tratado: { label: "Tratado", cor: "#3B82F6", brilho: "rgba(150, 200, 255, 1)" },
  extraido: { label: "Extraído", cor: "rgba(255, 255, 255, 0.1)", brilho: "transparent" },
  coroa: { label: "Coroa", cor: "#F59E0B", brilho: "rgba(255, 220, 150, 1)" },
  implante: { label: "Implante", cor: "#10B981", brilho: "rgba(150, 255, 200, 1)" },
}

const estadosCiclo: DenteState[] = ["saudavel", "caries", "tratado", "coroa", "implante", "extraido"]

function getToothWidth(type: string): string {
  if (type === "molar") return "9%"
  if (type === "premolar") return "7.5%"
  if (type === "canine") return "6.8%"
  return "6.2%" // incisor
}

function useArchPositions() {
  return useMemo(() => {
    const upper: Record<number, { x: number; y: number; rot: number }> = {}
    const lower: Record<number, { x: number; y: number; rot: number }> = {}
    const mapUpper = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
    const mapLower = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

    mapUpper.forEach((n, i) => {
      const t = (i - 7.5) / 7.5;
      const angleDeg = t * 85;
      const angleRad = (angleDeg * Math.PI) / 180;
      const rx = 37;
      const ry = 28;
      const x = 50 + Math.sin(angleRad) * rx;
      const y = 44 - Math.cos(angleRad) * ry;
      upper[n] = { x, y, rot: 180 + angleDeg };
    })

    mapLower.forEach((n, i) => {
      const t = (i - 7.5) / 7.5;
      const angleDeg = t * 85;
      const angleRad = (angleDeg * Math.PI) / 180;
      const rx = 37;
      const ry = 28;
      const x = 50 + Math.sin(angleRad) * rx;
      const y = 56 + Math.cos(angleRad) * ry;
      lower[n] = { x, y, rot: -angleDeg };
    })

    return { upper, lower, mapUpper, mapLower }
  }, [])
}

function DenteSVG({
  dente,
  aoClique,
  isSelected,
}: {
  dente: DenteInfo
  aoClique: (numero: number) => void
  isSelected: boolean
}) {
  const config = estadoConfig[dente.estado]
  const type = getToothType(dente.numero)
  const isLower = dente.numero >= 31 && dente.numero <= 48;

  // Renderiza o componente 3D de acordo com o tipo
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
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative flex flex-col items-center gap-0.5 transition-all w-full",
        isSelected && "z-20",
      )}
    >
      {/* Exibe indicador de estado se não for saudável */}
      {dente.estado !== "saudavel" && dente.estado !== "extraido" && (
        <div className="absolute -top-1 -right-1 z-30 w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: config.cor }} />
      )}

      {/* Coroa ou Implante - Borda extra */}
      {(dente.estado === "coroa" || dente.estado === "implante") && (
        <div className="absolute inset-[-4px] rounded-full border-2 z-10" style={{ borderColor: config.cor, opacity: 0.5 }} />
      )}

      <svg viewBox="0 0 100 100" className="w-full h-auto overflow-visible" style={{ opacity: dente.estado === "extraido" ? 0.15 : 1 }}>
        {renderTooth()}
        <text
          x="50" y="55"
          textAnchor="middle"
          fontSize="22"
          fill="rgba(0,0,0,0.4)"
          fontWeight="700"
          fontFamily="system-ui"
          className="pointer-events-none drop-shadow-md"
          style={{ mixBlendMode: 'overlay' }}
        >
          {dente.numero}
        </text>
        <text
          x="50" y="54"
          textAnchor="middle"
          fontSize="22"
          fill="rgba(255,255,255,0.7)"
          fontWeight="700"
          fontFamily="system-ui"
          className="pointer-events-none"
          style={{ mixBlendMode: 'overlay' }}
        >
          {dente.numero}
        </text>
      </svg>
      {isSelected && (
        <motion.div
          layoutId="dente-selecionado"
          className="absolute -bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      )}
    </motion.button>
  )
}

function ArcadaDental({
  dentes,
  denteSelecionado,
  aoClique,
  positions,
  archKey,
}: {
  dentes: DenteInfo[]
  denteSelecionado: number | null
  aoClique: (numero: number) => void
  positions: Record<number, { x: number; y: number; rot: number }>
  archKey: string
}) {
  return (
    <>
      {dentes.map((dente) => {
        const pos = positions[dente.numero]
        if (!pos) return null
        return (
          <div
            key={`${archKey}-${dente.numero}`}
            className="absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: getToothWidth(getToothType(dente.numero)),
              transform: `translate(-50%, -50%) rotate(${pos.rot}deg)`,
            }}
          >
            <DenteSVG
              dente={dente}
              aoClique={aoClique}
              isSelected={denteSelecionado === dente.numero}
            />
          </div>
        )
      })}
    </>
  )
}

export function Odontograma() {
  const [denteSelecionado, setDenteSelecionado] = useState<number | null>(null)
  const [sup, setSup] = useState<DenteInfo[]>(dentesSuperiores)
  const [inf, setInf] = useState<DenteInfo[]>(dentesInferiores)
  const archPos = useArchPositions()

  const handleDenteClick = (numero: number) => {
    setDenteSelecionado(numero === denteSelecionado ? null : numero)
  }

  const alterarEstado = (novoEstado: DenteState) => {
    if (denteSelecionado === null) return
    const updateDente = (d: DenteInfo) =>
      d.numero === denteSelecionado ? { ...d, estado: novoEstado } : d
    setSup(sup.map(updateDente))
    setInf(inf.map(updateDente))
  }

  const denteAtual = [...sup, ...inf].find((d) => d.numero === denteSelecionado)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-center">
        {estadosCiclo.map((estado) => {
          const config = estadoConfig[estado]
          return (
            <div key={estado} className="flex items-center gap-2 bg-card px-2 py-1 rounded-md">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: config.cor }} />
              <span className="text-xs font-medium text-foreground">{config.label}</span>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-border p-4 sm:p-8 overflow-hidden shadow-2xl" style={{ background: "linear-gradient(160deg, #8FA8B4 0%, #7D99A6 50%, #6F8D9A 100%)" }}>
        <div className="relative w-full mx-auto" style={{ maxWidth: 500, aspectRatio: "1 / 1" }}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gum-upper-grad" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#dca0a0" />
                <stop offset="60%" stopColor="#c87878" />
                <stop offset="100%" stopColor="#b06060" />
              </linearGradient>
              <linearGradient id="gum-lower-grad" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#b06060" />
                <stop offset="40%" stopColor="#c87878" />
                <stop offset="100%" stopColor="#dca0a0" />
              </linearGradient>
            </defs>
            <path d="M 5 45 C 8 15, 92 15, 95 45 C 92 30, 50 22, 50 22 C 50 22, 8 30, 5 45 Z" fill="url(#gum-upper-grad)" opacity="0.85" />
            <path d="M 5 55 C 8 85, 92 85, 95 55 C 92 70, 50 78, 50 78 C 50 78, 8 70, 5 55 Z" fill="url(#gum-lower-grad)" opacity="0.85" />
          </svg>

          <p className="absolute -top-4 left-1/2 -translate-x-1/2 text-[11px] font-bold text-muted-foreground tracking-widest uppercase z-10">
            Superior
          </p>
          <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-bold text-muted-foreground tracking-widest uppercase z-10">
            Inferior
          </p>

          <ArcadaDental
            dentes={sup}
            denteSelecionado={denteSelecionado}
            aoClique={handleDenteClick}
            positions={archPos.upper}
            archKey="sup"
          />
          <ArcadaDental
            dentes={inf}
            denteSelecionado={denteSelecionado}
            aoClique={handleDenteClick}
            positions={archPos.lower}
            archKey="inf"
          />
        </div>
      </div>

      <AnimatePresence>
        {denteSelecionado && denteAtual && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-border bg-card backdrop-blur-md p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-foreground">
                Dente {denteSelecionado}
                <span className="text-muted-foreground ml-2">
                  {estadoConfig[denteAtual.estado].label}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {estadosCiclo.map((estado) => {
                const config = estadoConfig[estado]
                const isActive = denteAtual.estado === estado
                return (
                  <motion.button
                    key={estado}
                    onClick={() => alterarEstado(estado)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-all border",
                      isActive
                        ? "border-primary/50 bg-primary/20 text-primary shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:bg-card hover:text-foreground",
                    )}
                  >
                    {config.label}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
