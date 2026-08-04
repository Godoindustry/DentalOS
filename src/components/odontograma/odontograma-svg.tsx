"use client"

import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Syringe, X, Check, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { useOdontogramaStore } from "@/store/odontograma-store"
import { ToothCell, TOOTH_W, TOOTH_H } from "./tooth-svg"
import { FACE_LABELS } from "./types"
import type { DenteData, FaceId, FaceStatus } from "./types"

// ── Layout SVG ────────────────────────────────────────────────────────────────
const SLOT_W   = 38                           // largura de cada slot
const TX       = (SLOT_W - TOOTH_W) / 2      // x do dente dentro do slot (= 5)
const LEFT     = 26                           // margem esquerda
const ROOT_H   = 12                           // altura do indicador de raiz
const ROOT_GAP = 2                            // gap entre raiz e coroa
const NUM_H    = 14                           // altura dos números

// Coordenadas Y (cima para baixo)
const Y_NUM_SUP  = 0
const Y_ROOT_SUP = Y_NUM_SUP  + NUM_H + 4
const Y_CRW_SUP  = Y_ROOT_SUP + ROOT_H + ROOT_GAP
const Y_CRW_INF  = Y_CRW_SUP  + TOOTH_H + 10   // gap entre arcadas = 10
const Y_ROOT_INF = Y_CRW_INF  + TOOTH_H + ROOT_GAP
const Y_NUM_INF  = Y_ROOT_INF + ROOT_H + 4
const SVG_H      = Y_NUM_INF  + NUM_H

// Linha média entre as arcadas (centro do gap de 10px)
const MIDLINE_Y = Y_CRW_SUP + TOOTH_H + 5

function slotX(i: number) { return LEFT + i * SLOT_W }
function toothX(i: number) { return slotX(i) + TX }
function centerX(i: number) { return slotX(i) + SLOT_W / 2 }

// ── Props ─────────────────────────────────────────────────────────────────────
interface OdontogramaSVGProps {
  pacienteId: string
  searchTerm?: string
}

// ── Indicador de raiz ─────────────────────────────────────────────────────────
function RootLines({
  cx, yBase, isUpper, isMissing,
}: {
  cx: number; yBase: number; isUpper: boolean; isMissing: boolean
}) {
  if (isMissing) return null
  const tip  = isUpper ? yBase - ROOT_H : yBase + ROOT_H
  const base = yBase
  return (
    <g pointerEvents="none">
      <line x1={cx - 3} y1={base} x2={cx}     y2={tip}
        stroke="#CBD5E1" strokeWidth={1} strokeLinecap="round" />
      <line x1={cx + 3} y1={base} x2={cx}     y2={tip}
        stroke="#CBD5E1" strokeWidth={1} strokeLinecap="round" />
    </g>
  )
}

// ── Componente ────────────────────────────────────────────────────────────────
export function OdontogramaSVG({ pacienteId, searchTerm = "" }: OdontogramaSVGProps) {
  const arcadaSup       = useOdontogramaStore((s) => s.arcadaSup)
  const arcadaInf       = useOdontogramaStore((s) => s.arcadaInf)
  const selectedFace    = useOdontogramaStore((s) => s.selectedFace)
  const activeProcedure = useOdontogramaStore((s) => s.activeProcedure)
  const denticaoMode    = useOdontogramaStore((s) => s.denticaoMode)

  const setSelectedFace    = useOdontogramaStore((s) => s.setSelectedFace)
  const setActiveProcedure = useOdontogramaStore((s) => s.setActiveProcedure)
  const applyProcedure     = useOdontogramaStore((s) => s.applyProcedure)

  const [hoveredCell, setHoveredCell] = useState<{ numero: number; face: FaceId } | null>(null)

  const schedulePersist = useCallback(() => {
    useOdontogramaStore.getState().schedulePersist(pacienteId)
  }, [pacienteId])

  const handleFaceClick = useCallback(
    (numero: number, face: FaceId) => {
      if (activeProcedure) {
        applyProcedure(numero, face, activeProcedure)
        schedulePersist()
        return
      }
      if (selectedFace?.numero === numero && selectedFace?.face === face) {
        setSelectedFace(null)
      } else {
        setSelectedFace({ numero, face })
      }
    },
    [activeProcedure, applyProcedure, schedulePersist, selectedFace, setSelectedFace],
  )

  const changeFaceStatus = useCallback(
    (status: FaceStatus) => {
      if (!selectedFace) return
      applyProcedure(selectedFace.numero, selectedFace.face, status)
      setSelectedFace(null)
      schedulePersist()
    },
    [selectedFace, applyProcedure, setSelectedFace, schedulePersist],
  )

  const matchSearch = (d: DenteData) => {
    if (!searchTerm.trim()) return true
    const t = searchTerm.toLowerCase()
    return String(d.numero).includes(t) || d.nome.toLowerCase().includes(t)
  }

  const numTeeth = arcadaSup.length
  const SVG_W = LEFT + numTeeth * SLOT_W + LEFT
  const MIDLINE_X = LEFT + (numTeeth / 2) * SLOT_W

  // Dente/face selecionados
  const allDentes  = [...arcadaSup, ...arcadaInf]
  const currentDente = selectedFace ? allDentes.find((d) => d.numero === selectedFace.numero) : null
  const currentFace  = currentDente?.faces.find((f) => f.id === selectedFace?.face)

  const FACE_COLOR_BADGE: Record<string, string> = {
    saudavel:   "bg-white border-slate-300 text-slate-600",
    cariado:    "bg-red-50 border-red-400 text-red-700",
    restaurado: "bg-blue-50 border-blue-400 text-blue-700",
    canal:      "bg-violet-50 border-violet-400 text-violet-700",
    planejado:  "bg-amber-50 border-amber-400 text-amber-700",
    ausente:    "bg-slate-100 border-slate-300 text-slate-500",
    proteses:   "bg-yellow-50 border-yellow-500 text-yellow-700",
    faceta:     "bg-pink-50 border-pink-400 text-pink-700",
    fratura:    "bg-orange-50 border-orange-400 text-orange-700",
    profilaxia: "bg-green-50 border-green-400 text-green-700",
    observacao: "bg-gray-50 border-gray-400 text-gray-600",
  }

  const STATUS_LABELS: Record<string, string> = {
    saudavel: "Saudável", cariado: "Cárie", restaurado: "Restauração",
    canal: "Canal", faceta: "Faceta", fratura: "Fratura",
    profilaxia: "Profilaxia", observacao: "Observação",
    proteses: "Prótese", planejado: "Planejado", ausente: "Ausente",
  }

  return (
    <div id="odontograma-svg-container" className="space-y-3">

      {/* Badge de modo */}
      {denticaoMode !== "adulto" && (
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            {denticaoMode === "infantil" ? "🧒 Dentição Infantil — 51 a 85" : "🔀 Dentição Mista"}
          </span>
        </div>
      )}

      {/* Modo ativo */}
      {activeProcedure && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            Modo: <strong>{STATUS_LABELS[activeProcedure] ?? activeProcedure}</strong>
            — clique em uma face do dente
            <button
              onClick={() => setActiveProcedure(null)}
              className="ml-1 rounded-full p-0.5 hover:bg-blue-200 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* SVG do odontograma */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-auto select-none"
          style={{ display: "block", minWidth: 560 }}
          aria-label="Odontograma interativo"
        >
          <defs>
            {/* Gengiva superior */}
            <linearGradient id="gum-top" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FBCFE8" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#FBCFE8" stopOpacity={0} />
            </linearGradient>
            {/* Gengiva inferior */}
            <linearGradient id="gum-bot" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#FBCFE8" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#FBCFE8" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Fundo branco */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#F8FAFC" />

          {/* Área de gengiva superior */}
          <rect
            x={LEFT} y={Y_CRW_SUP - 4}
            width={numTeeth * SLOT_W} height={TOOTH_H + 8}
            fill="url(#gum-top)" rx={4}
          />

          {/* Área de gengiva inferior */}
          <rect
            x={LEFT} y={Y_CRW_INF - 4}
            width={numTeeth * SLOT_W} height={TOOTH_H + 8}
            fill="url(#gum-bot)" rx={4}
          />

          {/* Linha média horizontal */}
          <line
            x1={LEFT + 4} y1={MIDLINE_Y}
            x2={SVG_W - LEFT - 4} y2={MIDLINE_Y}
            stroke="#E2E8F0" strokeWidth={1} strokeDasharray="4,4"
          />

          {/* Linha média vertical */}
          <line
            x1={MIDLINE_X} y1={Y_NUM_SUP}
            x2={MIDLINE_X} y2={SVG_H}
            stroke="#E2E8F0" strokeWidth={0.75} strokeDasharray="3,3"
          />

          {/* Quadrant labels */}
          <text x={LEFT + 2} y={MIDLINE_Y - 3}
            fontSize={6.5} fontFamily="system-ui" fontWeight="600"
            fill="#94A3B8" letterSpacing="0.08em">DIR</text>
          <text x={SVG_W - LEFT - 2} y={MIDLINE_Y - 3}
            fontSize={6.5} fontFamily="system-ui" fontWeight="600"
            fill="#94A3B8" textAnchor="end" letterSpacing="0.08em">ESQ</text>

          {/* Rótulo SUPERIOR */}
          <text x={SVG_W / 2} y={Y_NUM_SUP + 9}
            textAnchor="middle" fontSize={7} fontFamily="system-ui" fontWeight="700"
            fill="#94A3B8" letterSpacing="0.15em">SUPERIOR</text>

          {/* Números superiores */}
          {arcadaSup.map((d, i) => {
            const isSelected  = selectedFace?.numero === d.numero
            const highlighted = matchSearch(d)
            return (
              <text key={d.numero}
                x={centerX(i)} y={Y_ROOT_SUP - 2}
                textAnchor="middle"
                fontSize={7} fontFamily="'Inter', system-ui" fontWeight={isSelected ? "700" : "500"}
                fill={
                  !highlighted ? "#D1D5DB"
                  : isSelected ? "#2563EB"
                  : d.deciduo ? "#D97706"
                  : "#64748B"
                }
                style={{ transition: "fill 0.12s ease" }}
                pointerEvents="none"
              >{d.numero}</text>
            )
          })}

          {/* Raízes superiores */}
          {arcadaSup.map((d, i) => (
            <RootLines
              key={d.numero}
              cx={centerX(i)}
              yBase={Y_CRW_SUP}
              isUpper={true}
              isMissing={d.ausente}
            />
          ))}

          {/* Dentes superiores */}
          {arcadaSup.map((d, i) => {
            const highlighted = matchSearch(d)
            return (
              <g key={d.numero} style={{ opacity: highlighted ? 1 : 0.2, transition: "opacity 0.18s" }}>
                <ToothCell
                  dente={d} x={toothX(i)} y={Y_CRW_SUP}
                  isUpper={true}
                  selectedFace={selectedFace}
                  hoveredCell={hoveredCell}
                  onFaceClick={handleFaceClick}
                  onFaceHover={setHoveredCell}
                />
              </g>
            )
          })}

          {/* Dentes inferiores */}
          {arcadaInf.map((d, i) => {
            const highlighted = matchSearch(d)
            return (
              <g key={d.numero} style={{ opacity: highlighted ? 1 : 0.2, transition: "opacity 0.18s" }}>
                <ToothCell
                  dente={d} x={toothX(i)} y={Y_CRW_INF}
                  isUpper={false}
                  selectedFace={selectedFace}
                  hoveredCell={hoveredCell}
                  onFaceClick={handleFaceClick}
                  onFaceHover={setHoveredCell}
                />
              </g>
            )
          })}

          {/* Raízes inferiores */}
          {arcadaInf.map((d, i) => (
            <RootLines
              key={d.numero}
              cx={centerX(i)}
              yBase={Y_CRW_INF + TOOTH_H}
              isUpper={false}
              isMissing={d.ausente}
            />
          ))}

          {/* Números inferiores */}
          {arcadaInf.map((d, i) => {
            const isSelected  = selectedFace?.numero === d.numero
            const highlighted = matchSearch(d)
            return (
              <text key={d.numero}
                x={centerX(i)} y={Y_NUM_INF + 8}
                textAnchor="middle"
                fontSize={7} fontFamily="'Inter', system-ui" fontWeight={isSelected ? "700" : "500"}
                fill={
                  !highlighted ? "#D1D5DB"
                  : isSelected ? "#2563EB"
                  : d.deciduo ? "#D97706"
                  : "#64748B"
                }
                style={{ transition: "fill 0.12s ease" }}
                pointerEvents="none"
              >{d.numero}</text>
            )
          })}

          {/* Rótulo INFERIOR */}
          <text x={SVG_W / 2} y={SVG_H - 1}
            textAnchor="middle" fontSize={7} fontFamily="system-ui" fontWeight="700"
            fill="#94A3B8" letterSpacing="0.15em">INFERIOR</text>
        </svg>
      </div>

      {/* ── Legenda compacta ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const cls = FACE_COLOR_BADGE[key] ?? "bg-white border-slate-300 text-slate-600"
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span className={cn("h-3 w-3 rounded border", cls.split(" ").find(c => c.startsWith("bg-")), cls.split(" ").find(c => c.startsWith("border-")))} />
              <span className="text-[10px] text-slate-500">{label}</span>
            </div>
          )
        })}
      </div>

      {/* ── Painel de seleção de face ───────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {selectedFace && currentDente && currentFace && !activeProcedure && (
          <motion.div
            key={`${selectedFace.numero}-${selectedFace.face}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4"
          >
            {/* Cabeçalho */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-800">
                    Dente {selectedFace.numero}
                  </span>
                  {currentDente.deciduo && (
                    <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      Decíduo
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{currentDente.nome}</p>
                <p className="text-xs text-slate-600 mt-1">
                  Face:{" "}
                  <span className="font-semibold text-slate-800">
                    {FACE_LABELS[selectedFace.face]}
                  </span>
                  {" · "}
                  Estado:{" "}
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                    FACE_COLOR_BADGE[currentFace.status] ?? "bg-white border-slate-300 text-slate-600",
                  )}>
                    {STATUS_LABELS[currentFace.status] ?? currentFace.status}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedFace(null)}
                className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Alterar estado */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Alterar estado da face
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(["saudavel","cariado","restaurado","canal","faceta","fratura",
                   "profilaxia","observacao","proteses","planejado","ausente"] as FaceStatus[]).map((status) => {
                  const isAtivo = currentFace.status === status
                  return (
                    <button
                      key={status}
                      onClick={() => changeFaceStatus(status)}
                      className={cn(
                        "rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all hover:shadow-sm",
                        isAtivo
                          ? "border-blue-400 bg-blue-50 text-blue-700 shadow-sm"
                          : FACE_COLOR_BADGE[status] ?? "bg-white border-slate-200 text-slate-600 hover:border-slate-300",
                      )}
                    >
                      {STATUS_LABELS[status] ?? status}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Implante e Extração */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  useOdontogramaStore.getState().toggleImplante(selectedFace.numero)
                  useOdontogramaStore.getState().schedulePersist(pacienteId)
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                  currentDente.implante
                    ? "border-cyan-400 bg-cyan-50 text-cyan-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                )}
              >
                <Syringe className="h-3.5 w-3.5" />
                Implante
                {currentDente.implante && <Check className="h-3 w-3" />}
              </button>

              <button
                onClick={() => {
                  useOdontogramaStore.getState().toggleExtracao(selectedFace.numero)
                  useOdontogramaStore.getState().schedulePersist(pacienteId)
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                  currentDente.extracao
                    ? "border-violet-400 bg-violet-50 text-violet-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                )}
              >
                <X className="h-3.5 w-3.5" />
                Extração
                {currentDente.extracao && <Check className="h-3 w-3" />}
              </button>

              <button
                onClick={() => setSelectedFace(null)}
                className="ml-auto text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
