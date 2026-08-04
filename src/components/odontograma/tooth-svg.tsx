"use client"

import type { DenteData, FaceId, FaceStatus } from "./types"

// ── Dimensões do dente ────────────────────────────────────────────────────────
export const TOOTH_W = 28   // largura da coroa
export const TOOTH_H = 28   // altura da coroa
const S = 7                 // espessura das faixas (faces)

// ── Paths trapezoidais das 5 faces ────────────────────────────────────────────
// Cobrem exatamente o quadrado 28×28 sem sobreposição nem gap
const W = TOOTH_W
const H = TOOTH_H

const PATH_TOP    = `M 0,0 L ${W},0 L ${W-S},${S} L ${S},${S} Z`
const PATH_BOTTOM = `M ${S},${H-S} L ${W-S},${H-S} L ${W},${H} L 0,${H} Z`
const PATH_LEFT   = `M 0,0 L ${S},${S} L ${S},${H-S} L 0,${H} Z`
const PATH_RIGHT  = `M ${W-S},${S} L ${W},0 L ${W},${H} L ${W-S},${H-S} Z`
const PATH_CENTER = `M ${S},${S} L ${W-S},${S} L ${W-S},${H-S} L ${S},${H-S} Z`

function getFacePath(faceId: FaceId, isUpper: boolean): string {
  switch (faceId) {
    case "vestibular": return isUpper ? PATH_BOTTOM : PATH_TOP
    case "palatina":   return PATH_TOP      // superior → palatina em cima
    case "lingual":    return PATH_BOTTOM   // inferior → lingual embaixo
    case "mesial":     return PATH_LEFT
    case "distal":     return PATH_RIGHT
    case "oclusal":    return PATH_CENTER
    default:           return PATH_CENTER
  }
}

// ── Sistema de cores (tema claro clínico) ────────────────────────────────────
interface FaceStyle { fill: string; stroke: string; sw: number }

const COLOR_MAP: Record<FaceStatus, FaceStyle> = {
  saudavel:   { fill: "#FFFFFF", stroke: "#E2E8F0", sw: 0.5 },
  cariado:    { fill: "#FEE2E2", stroke: "#F87171", sw: 1   },
  restaurado: { fill: "#DBEAFE", stroke: "#60A5FA", sw: 1   },
  canal:      { fill: "#EDE9FE", stroke: "#A78BFA", sw: 1   },
  planejado:  { fill: "#FEF3C7", stroke: "#FBBF24", sw: 1   },
  ausente:    { fill: "#F1F5F9", stroke: "#CBD5E1", sw: 0.5 },
  proteses:   { fill: "#FEF9C3", stroke: "#D97706", sw: 1   },
  faceta:     { fill: "#FCE7F3", stroke: "#F472B6", sw: 1   },
  fratura:    { fill: "#FFEDD5", stroke: "#FB923C", sw: 1   },
  profilaxia: { fill: "#F0FDF4", stroke: "#4ADE80", sw: 1   },
  observacao: { fill: "#F3F4F6", stroke: "#9CA3AF", sw: 0.8 },
}

function getFaceStyle(
  status: FaceStatus,
  isHovered: boolean,
  isSelected: boolean,
): FaceStyle {
  if (isSelected) return { fill: "#DBEAFE", stroke: "#2563EB", sw: 1.5 }
  if (isHovered && status === "saudavel") return { fill: "#F0F9FF", stroke: "#BAE6FD", sw: 1 }
  const c = COLOR_MAP[status] ?? COLOR_MAP.saudavel
  if (isHovered) return { ...c, sw: c.sw + 0.5 }
  return c
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface ToothCellProps {
  dente: DenteData
  x: number
  y: number
  isUpper: boolean
  selectedFace: { numero: number; face: FaceId } | null
  hoveredCell:  { numero: number; face: FaceId } | null
  onFaceClick:  (numero: number, face: FaceId) => void
  onFaceHover:  (info: { numero: number; face: FaceId } | null) => void
}

// ── Componente principal ──────────────────────────────────────────────────────
export function ToothCell({
  dente, x, y, isUpper,
  selectedFace, hoveredCell, onFaceClick, onFaceHover,
}: ToothCellProps) {
  const faceIds: FaceId[] = isUpper
    ? ["vestibular", "palatina", "mesial", "distal", "oclusal"]
    : ["vestibular", "lingual",  "mesial", "distal", "oclusal"]

  const isToothSelected = selectedFace?.numero === dente.numero
  const isToothHovered  = hoveredCell?.numero  === dente.numero
  const clipId = `c-${dente.numero}`

  return (
    <g transform={`translate(${x},${y})`} data-tooth={dente.numero}>
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={W} height={H} rx={3} />
        </clipPath>
      </defs>

      {/* Sombra suave */}
      <rect x={0.5} y={1} width={W} height={H} rx={3}
        fill="rgba(15,23,42,0.06)" pointerEvents="none" />

      {/* Fundo da coroa */}
      <rect x={0} y={0} width={W} height={H} rx={3}
        fill={dente.ausente ? "#F1F5F9" : "#FAFAFA"}
        stroke={isToothSelected ? "#2563EB" : isToothHovered ? "#93C5FD" : "#E2E8F0"}
        strokeWidth={isToothSelected ? 1.5 : 0.75}
        style={{ transition: "stroke 0.12s ease" }}
      />

      <g clipPath={`url(#${clipId})`}>
        {/* ── Faces clicáveis ── */}
        {!dente.ausente && faceIds.map((faceId) => {
          const fd     = dente.faces.find((f) => f.id === faceId)
          const status = fd?.status ?? "saudavel"
          const isFaceSelected = isToothSelected && selectedFace?.face === faceId
          const isFaceHovered  = isToothHovered  && hoveredCell?.face  === faceId
          const { fill, stroke, sw } = getFaceStyle(status, isFaceHovered, isFaceSelected)

          return (
            <path
              key={faceId}
              d={getFacePath(faceId, isUpper)}
              fill={fill}
              stroke={stroke}
              strokeWidth={sw}
              style={{ cursor: "pointer", transition: "fill 0.12s ease" }}
              onClick={() => onFaceClick(dente.numero, faceId)}
              onMouseEnter={() => onFaceHover({ numero: dente.numero, face: faceId })}
              onMouseLeave={() => onFaceHover(null)}
              onTouchStart={(e) => { e.preventDefault(); onFaceClick(dente.numero, faceId) }}
            />
          )
        })}

        {/* ── Dente ausente: X ── */}
        {dente.ausente && (
          <g pointerEvents="none">
            <line x1={5}   y1={5}   x2={W-5} y2={H-5}
              stroke="#94A3B8" strokeWidth={1.5} strokeLinecap="round" />
            <line x1={W-5} y1={5}   x2={5}   y2={H-5}
              stroke="#94A3B8" strokeWidth={1.5} strokeLinecap="round" />
          </g>
        )}
        {dente.ausente && faceIds.map((faceId) => (
          <path key={faceId}
            d={getFacePath(faceId, isUpper)} fill="transparent"
            style={{ cursor: "pointer" }}
            onClick={() => onFaceClick(dente.numero, faceId)}
            onMouseEnter={() => onFaceHover({ numero: dente.numero, face: faceId })}
            onMouseLeave={() => onFaceHover(null)}
          />
        ))}
      </g>

      {/* Borda externa */}
      <rect x={0} y={0} width={W} height={H} rx={3}
        fill="none"
        stroke={isToothSelected ? "#2563EB" : "#D1D5DB"}
        strokeWidth={isToothSelected ? 1.5 : 0.5}
        pointerEvents="none"
        style={{ transition: "stroke 0.12s ease" }}
      />

      {/* Coroa/prótese: borda dourada tracejada */}
      {(dente.coroa || dente.faces.some((f) => f.status === "proteses")) && !dente.ausente && (
        <rect x={0.5} y={0.5} width={W-1} height={H-1} rx={3}
          fill="none" stroke="#D97706" strokeWidth={1.5} strokeDasharray="3,2"
          pointerEvents="none" />
      )}

      {/* Implante: retângulo ciano tracejado no centro */}
      {dente.implante && !dente.ausente && (
        <rect x={W/2-5} y={H/2-5} width={10} height={10} rx={2}
          fill="none" stroke="#0EA5E9" strokeWidth={1.5} strokeDasharray="2,1.5"
          pointerEvents="none" />
      )}

      {/* Extração indicada: linha roxa abaixo */}
      {dente.extracao && (
        <g pointerEvents="none">
          <line x1={W/2-6} y1={H+4} x2={W/2+6} y2={H+4}
            stroke="#7C3AED" strokeWidth={2} strokeLinecap="round" />
        </g>
      )}
    </g>
  )
}
