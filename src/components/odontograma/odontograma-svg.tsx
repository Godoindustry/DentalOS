"use client"

import { useState, useCallback, useRef } from "react"
import { useOdontogramaStore } from "@/store/odontograma-store"
import { ToothCell, TOOTH_W, TOOTH_H } from "./tooth-svg"
import { FACE_CONFIG, LEGEND_ITENS, SUPERIORES, INFERIORES, DECIDUOS_SUP, DECIDUOS_INF, MISTA_SUP, MISTA_INF } from "./types"
import type { DenteData, FaceId, FaceStatus, DenticaoMode } from "./types"
import { AnimatePresence, motion } from "framer-motion"
import { Syringe, X, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FACE_LABELS } from "./types"

// ─── Layout SVG ──────────────────────────────────────────────────────────────

const SLOT_W = 40
const GAP    = 3
const LEFT   = 22
const SUP_Y  = 32
const INF_Y  = 122

function slotX(index: number) { return LEFT + index * SLOT_W }
function toothX(index: number) { return slotX(index) + GAP }
function toothCenterX(index: number) { return slotX(index) + SLOT_W / 2 }

function calcSvgDims(numTeeth: number) {
  const w = LEFT + numTeeth * SLOT_W + LEFT
  const h = INF_Y + TOOTH_H + 40
  const midlineX = LEFT + (numTeeth / 2) * SLOT_W
  return { w, h, midlineX }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface OdontogramaSVGProps {
  pacienteId: string
  searchTerm?: string
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function OdontogramaSVG({ pacienteId, searchTerm = "" }: OdontogramaSVGProps) {
  const arcadaSup       = useOdontogramaStore((s) => s.arcadaSup)
  const arcadaInf       = useOdontogramaStore((s) => s.arcadaInf)
  const selectedFace    = useOdontogramaStore((s) => s.selectedFace)
  const activeProcedure = useOdontogramaStore((s) => s.activeProcedure)
  const denticaoMode    = useOdontogramaStore((s) => s.denticaoMode)
  const saving          = useOdontogramaStore((s) => s.saving)

  const setSelectedFace    = useOdontogramaStore((s) => s.setSelectedFace)
  const setActiveProcedure = useOdontogramaStore((s) => s.setActiveProcedure)
  const applyProcedure     = useOdontogramaStore((s) => s.applyProcedure)

  const [hoveredCell, setHoveredCell] = useState<{ numero: number; face: FaceId } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const schedulePersist = useCallback(() => {
    useOdontogramaStore.getState().schedulePersist(pacienteId)
  }, [pacienteId])

  // ── Handlers ────────────────────────────────────────────────────────────────

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

  const toggleImplante = useCallback(() => {
    if (!selectedFace) return
    useOdontogramaStore.getState().toggleImplante(selectedFace.numero)
    schedulePersist()
  }, [selectedFace, schedulePersist])

  const toggleExtracao = useCallback(() => {
    if (!selectedFace) return
    useOdontogramaStore.getState().toggleExtracao(selectedFace.numero)
    schedulePersist()
  }, [selectedFace, schedulePersist])

  // ── Dados do dente/face selecionados ─────────────────────────────────────

  const allDentes = [...arcadaSup, ...arcadaInf]
  const currentDente = selectedFace ? allDentes.find((d) => d.numero === selectedFace.numero) : null
  const currentFace  = currentDente?.faces.find((f) => f.id === selectedFace?.face)

  // ── Filtragem por busca ──────────────────────────────────────────────────

  const matchSearch = (d: DenteData) => {
    if (!searchTerm.trim()) return true
    const t = searchTerm.toLowerCase()
    return (
      String(d.numero).includes(t) ||
      d.nome.toLowerCase().includes(t)
    )
  }

  // ── Dimensões SVG dinâmicas ───────────────────────────────────────────────

  const numTeeth = arcadaSup.length
  const { w: SVG_W, h: SVG_H, midlineX: MIDLINE_X } = calcSvgDims(numTeeth)

  // ── Renderização das fileiras ─────────────────────────────────────────────

  const renderRow = (dentes: DenteData[], isUpper: boolean, yPos: number) =>
    dentes.map((dente, i) => {
      const highlighted = matchSearch(dente)
      return (
        <g key={dente.numero} style={{ opacity: highlighted ? 1 : 0.25, transition: "opacity 0.2s" }}>
          <ToothCell
            dente={dente}
            x={toothX(i)}
            y={yPos}
            isUpper={isUpper}
            selectedFace={selectedFace}
            hoveredCell={hoveredCell}
            onFaceClick={handleFaceClick}
            onFaceHover={setHoveredCell}
          />
        </g>
      )
    })

  const renderNumbers = (dentes: DenteData[], yPos: number) =>
    dentes.map((dente, i) => {
      const isSelected  = selectedFace?.numero === dente.numero
      const highlighted = matchSearch(dente)
      return (
        <text
          key={dente.numero}
          x={toothCenterX(i)}
          y={yPos}
          textAnchor="middle"
          fontSize={7.5}
          fontWeight={isSelected ? "700" : "500"}
          fontFamily="system-ui, -apple-system, sans-serif"
          fill={
            !highlighted
              ? "rgba(255,255,255,0.1)"
              : isSelected
              ? "rgba(168,85,247,0.9)"
              : dente.deciduo
              ? "rgba(251,191,36,0.6)"
              : "rgba(255,255,255,0.28)"
          }
          style={{ transition: "fill 0.12s ease" }}
          pointerEvents="none"
        >
          {dente.numero}
        </text>
      )
    })

  return (
    <div id="odontograma-svg-container" className="space-y-4">

      {/* Legenda */}
      <div className="flex flex-wrap gap-2 justify-center px-1">
        {LEGEND_ITENS.map((item) => {
          let icone: React.ReactNode = null
          if (item.chave === "implante") icone = <Syringe className="h-2 w-2" />
          else if (item.chave === "extracao") icone = <X className="h-2 w-2" />
          return (
            <div key={item.chave} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-sm border flex items-center justify-center"
                style={{
                  backgroundColor: item.cor,
                  borderColor: item.cor,
                  opacity: item.opacidade ?? 0.9,
                }}
              >
                {icone}
              </div>
              <span className="text-[10px] text-white/45 leading-none">{item.label}</span>
            </div>
          )
        })}
      </div>

      {/* Badge dentição decídua */}
      {denticaoMode !== "adulto" && (
        <div className="flex justify-center">
          <div className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[10px] text-yellow-300/80">
            {denticaoMode === "infantil" ? "🧒 Dentição Infantil — Dentes 51–85" : "🔀 Dentição Mista"}
            <span className="ml-1.5 text-yellow-400/50">· Números em amarelo = decíduos</span>
          </div>
        </div>
      )}

      {/* Contêiner do SVG */}
      <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.015] overflow-hidden">

        {/* Banner modo ativo */}
        {activeProcedure && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
            <div className="rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-[10px] text-purple-300/85 backdrop-blur-sm whitespace-nowrap">
              Modo:{" "}
              <span className="font-semibold">{activeProcedure}</span>
              {" "}— clique em uma face do dente
              <button
                onClick={() => setActiveProcedure(null)}
                className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* SVG principal */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-auto select-none"
          style={{ display: "block" }}
          aria-label="Odontograma interativo"
        >
          <defs>
            <linearGradient id="gum-sup" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#c47878" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#c47878" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gum-inf" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%"   stopColor="#c47878" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#c47878" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Gengiva decorativa */}
          <rect x={LEFT} y={SUP_Y - 8}  width={numTeeth * SLOT_W} height={TOOTH_H + 16} fill="url(#gum-sup)" rx={6} />
          <rect x={LEFT} y={INF_Y - 8}  width={numTeeth * SLOT_W} height={TOOTH_H + 16} fill="url(#gum-inf)" rx={6} />

          {/* Linha horizontal entre arcadas */}
          <line
            x1={LEFT + 6} y1={(SUP_Y + TOOTH_H + INF_Y) / 2}
            x2={SVG_W - LEFT - 6} y2={(SUP_Y + TOOTH_H + INF_Y) / 2}
            stroke="rgba(255,255,255,0.05)" strokeWidth={0.75} strokeDasharray="4,4"
          />

          {/* Linha média vertical */}
          <line
            x1={MIDLINE_X} y1={SUP_Y - 6}
            x2={MIDLINE_X} y2={INF_Y + TOOTH_H + 6}
            stroke="rgba(255,255,255,0.07)" strokeWidth={0.75} strokeDasharray="3,3"
          />

          {/* Rótulos DIR / ESQ */}
          <text x={LEFT + 2}          y={(SUP_Y + TOOTH_H + INF_Y) / 2 + 1}
            fontSize={7} fontFamily="system-ui" fontWeight="600"
            fill="rgba(255,255,255,0.12)" textAnchor="start" letterSpacing="0.08em"
          >DIR</text>
          <text x={SVG_W - LEFT - 2}  y={(SUP_Y + TOOTH_H + INF_Y) / 2 + 1}
            fontSize={7} fontFamily="system-ui" fontWeight="600"
            fill="rgba(255,255,255,0.12)" textAnchor="end" letterSpacing="0.08em"
          >ESQ</text>

          {/* Rótulo SUPERIOR */}
          <text x={SVG_W / 2} y={16}
            textAnchor="middle" fontSize={7.5} fontFamily="system-ui" fontWeight="600"
            fill="rgba(255,255,255,0.18)" letterSpacing="0.18em"
          >SUPERIOR</text>

          {/* Números superiores */}
          {renderNumbers(arcadaSup, SUP_Y - 5)}

          {/* Dentes superiores */}
          {renderRow(arcadaSup, true, SUP_Y)}

          {/* Dentes inferiores */}
          {renderRow(arcadaInf, false, INF_Y)}

          {/* Números inferiores */}
          {renderNumbers(arcadaInf, INF_Y + TOOTH_H + 10)}

          {/* Rótulo INFERIOR */}
          <text x={SVG_W / 2} y={SVG_H - 4}
            textAnchor="middle" fontSize={7.5} fontFamily="system-ui" fontWeight="600"
            fill="rgba(255,255,255,0.18)" letterSpacing="0.18em"
          >INFERIOR</text>
        </svg>
      </div>

      {/* Status de salvamento */}
      <AnimatePresence>
        {saving && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center justify-center gap-2 text-xs text-white/30"
          >
            <Loader2 className="h-3 w-3 animate-spin" />
            Salvando...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Painel de ação da face selecionada */}
      <AnimatePresence mode="wait">
        {selectedFace && currentDente && currentFace && !activeProcedure && (
          <motion.div
            key={`${selectedFace.numero}-${selectedFace.face}`}
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="rounded-2xl border border-white/[0.10] bg-white/[0.03] backdrop-blur-xl p-5 space-y-4"
          >
            {/* Cabeçalho */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-sm font-semibold text-white">
                    Dente {selectedFace.numero}
                  </span>
                  {currentDente.deciduo && (
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-normal bg-yellow-500/15 text-yellow-300 border-yellow-500/30">
                      Decíduo
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-normal">
                    {currentDente.nome}
                  </Badge>
                </div>
                <p className="text-xs text-white/45 mt-1.5">
                  Face:{" "}
                  <span className="text-white/70 font-medium">
                    {FACE_LABELS[selectedFace.face]}
                  </span>
                  <span className="mx-1.5">·</span>
                  Estado:{" "}
                  <span
                    className="font-medium inline-flex items-center gap-1"
                    style={{ color: FACE_CONFIG[currentFace.status]?.cor ?? "white" }}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-sm"
                      style={{
                        backgroundColor: FACE_CONFIG[currentFace.status]?.cor ?? "white",
                        opacity: currentFace.status === "ausente" ? 0.3 : 0.9,
                      }}
                    />
                    {FACE_CONFIG[currentFace.status]?.label ?? currentFace.status}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedFace(null)}
                className="shrink-0 h-6 w-6 flex items-center justify-center rounded-md text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all text-sm leading-none"
              >
                ✕
              </button>
            </div>

            {/* Status da face */}
            <div>
              <p className="text-[11px] font-medium text-white/35 uppercase tracking-wider mb-3">
                Alterar estado da face
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(["saudavel","cariado","restaurado","canal","faceta","fratura","profilaxia","observacao","proteses","planejado","ausente"] as FaceStatus[]).map((status) => {
                  const cfg = FACE_CONFIG[status]
                  const isAtivo = currentFace.status === status || (status === "ausente" && currentDente.ausente)
                  return (
                    <motion.button
                      key={status}
                      onClick={() => changeFaceStatus(status)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className={cn(
                        "rounded-lg px-2.5 py-1.5 text-[11px] font-medium border transition-all flex items-center gap-1.5",
                        isAtivo
                          ? "border-purple-500/40 bg-purple-500/15 text-purple-300"
                          : "border-white/[0.08] bg-white/[0.04] text-white/55 hover:bg-white/[0.08] hover:text-white/80",
                      )}
                    >
                      <div
                        className="h-2 w-2 rounded-sm shrink-0"
                        style={{ backgroundColor: cfg?.cor ?? "white", opacity: status === "ausente" ? 0.3 : 0.88 }}
                      />
                      {cfg?.label ?? status}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Implante e Extração */}
            <div className="flex gap-2">
              <motion.button
                onClick={toggleImplante}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium border transition-all flex items-center gap-1.5",
                  currentDente.implante
                    ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-300"
                    : "border-white/[0.08] bg-white/[0.04] text-white/55 hover:bg-white/[0.08]",
                )}
              >
                <Syringe className="h-3 w-3" />
                Implante {currentDente.implante && <Check className="h-3 w-3 ml-0.5" />}
              </motion.button>

              <motion.button
                onClick={toggleExtracao}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium border transition-all flex items-center gap-1.5",
                  currentDente.extracao
                    ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                    : "border-white/[0.08] bg-white/[0.04] text-white/55 hover:bg-white/[0.08]",
                )}
              >
                <X className="h-3 w-3" />
                Extração {currentDente.extracao && <Check className="h-3 w-3 ml-0.5" />}
              </motion.button>
            </div>

            {/* Fechar */}
            <div className="pt-0.5">
              <Button variant="ghost" size="sm" onClick={() => setSelectedFace(null)} className="text-xs">
                Fechar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
