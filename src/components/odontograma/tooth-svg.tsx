"use client"

import type { FaceId, DenteData, ToothType } from "./types"
import { FACE_CONFIG, getToothType } from "./types"

// ── Dimensões base do espaço local de cada dente ─────────────────────────────
export const TOOTH_W = 34
export const TOOTH_H = 44
const INS = 9          // recuo das faces trapezoidais

const CX = TOOTH_W / 2  // 17 – centro horizontal
const CY = TOOTH_H / 2  // 22 – centro vertical

// ── 1. Silhuetas anatômicas oclúsais por tipo de dente ───────────────────────
// Coordenadas locais (0,0) → (TOOTH_W, TOOTH_H)
// Usadas como clipPath para dar forma anatômica ao dente

const SILHUETAS: Record<ToothType, string> = {
  // Molar: largo, quase quadrado, com cantos bem curvados
  molar: [
    `M 2,7 Q 0,0 9,0`,
    `L 25,0 Q 34,0 32,7`,
    `L 32,37 Q 34,44 25,44`,
    `L 9,44 Q 0,44 2,37 Z`,
  ].join(" "),

  // Pré-molar: oval simétrico com leve estreitamento
  premolar: [
    `M 3,7 Q 2,0 10,0`,
    `L 24,0 Q 32,0 31,7`,
    `L 31,37 Q 32,44 24,44`,
    `L 10,44 Q 2,44 3,37 Z`,
  ].join(" "),

  // Canino: forma oval alongada, levemente cônico no topo
  canine: [
    `M 5,4 Q 5,0 ${CX},0 Q 29,0 29,4`,
    `C 32,14 32,32 28,41`,
    `Q ${CX},44 6,41`,
    `C 2,32 2,14 5,4 Z`,
  ].join(" "),

  // Incisivo: mais estreito, trapezoidal com cantos suaves
  incisor: [
    `M 7,3 Q 7,0 ${CX},0 Q 27,0 27,3`,
    `C 30,13 30,33 27,42`,
    `Q ${CX},44 7,42`,
    `C 4,33 4,13 7,3 Z`,
  ].join(" "),
}

// ── 2. Região oclusal central (oval) ─────────────────────────────────────────
// Substitui o retângulo central por uma forma oval por tipo

const OCLUSAL_OVAL: Record<ToothType, { rx: number; ry: number }> = {
  molar:    { rx: 10, ry: 13 },
  premolar: { rx: 9,  ry: 12 },
  canine:   { rx: 8,  ry: 11 },
  incisor:  { rx: 7,  ry: 10 },
}

// ── 3. Paths das faces em coordenadas locais ──────────────────────────────────
// Superior: vestibular no topo / palatina-lingual na base
// Inferior: vestibular na base / lingual no topo

function buildFaceStrips(isUpper: boolean): Record<string, string> {
  const W = TOOTH_W
  const H = TOOTH_H
  const I = INS
  const { rx, ry } = OCLUSAL_OVAL.molar   // uso os maiores para não deixar buracos

  // Oclusal: elipse aproximada usando path cubic (cobre o centro)
  const oclusalPath = [
    `M ${CX},${CY - ry}`,
    `C ${CX + rx},${CY - ry} ${CX + rx},${CY + ry} ${CX},${CY + ry}`,
    `C ${CX - rx},${CY + ry} ${CX - rx},${CY - ry} ${CX},${CY - ry} Z`,
  ].join(" ")

  if (isUpper) {
    return {
      vestibular: `M 0,0 L ${W},0 L ${W - I},${I} L ${I},${I} Z`,
      palatina:   `M ${I},${H - I} L ${W - I},${H - I} L ${W},${H} L 0,${H} Z`,
      lingual:    `M ${I},${H - I} L ${W - I},${H - I} L ${W},${H} L 0,${H} Z`,
      mesial:     `M 0,0 L ${I},${I} L ${I},${H - I} L 0,${H} Z`,
      distal:     `M ${W - I},${I} L ${W},0 L ${W},${H} L ${W - I},${H - I} Z`,
      oclusal:    oclusalPath,
    }
  } else {
    return {
      vestibular: `M ${I},${H - I} L ${W - I},${H - I} L ${W},${H} L 0,${H} Z`,
      lingual:    `M 0,0 L ${W},0 L ${W - I},${I} L ${I},${I} Z`,
      palatina:   `M 0,0 L ${W},0 L ${W - I},${I} L ${I},${I} Z`,
      mesial:     `M 0,0 L ${I},${I} L ${I},${H - I} L 0,${H} Z`,
      distal:     `M ${W - I},${I} L ${W},0 L ${W},${H} L ${W - I},${H - I} Z`,
      oclusal:    oclusalPath,
    }
  }
}

// ── 4. Detalhes anatômicos decorativos (sulcos e cúspides) ─────────────────────

function AnatDetalhes({ type }: { type: ToothType }) {
  if (type === "molar") {
    return (
      <g pointerEvents="none" opacity={0.25}>
        {/* Sulco em H do molar */}
        <path
          d={`M ${CX},${CY - 8} L ${CX},${CY + 8}`}
          stroke="rgba(80,40,10,0.6)" strokeWidth={1.5} fill="none" strokeLinecap="round"
        />
        <path
          d={`M ${CX - 5},${CY} L ${CX + 5},${CY}`}
          stroke="rgba(80,40,10,0.6)" strokeWidth={1.5} fill="none" strokeLinecap="round"
        />
        {/* Cúspides */}
        <ellipse cx={CX - 5} cy={CY - 7} rx={4} ry={3} fill="rgba(255,255,255,0.2)" />
        <ellipse cx={CX + 5} cy={CY - 7} rx={4} ry={3} fill="rgba(255,255,255,0.2)" />
        <ellipse cx={CX - 5} cy={CY + 7} rx={4} ry={3} fill="rgba(255,255,255,0.15)" />
        <ellipse cx={CX + 5} cy={CY + 7} rx={4} ry={3} fill="rgba(255,255,255,0.15)" />
      </g>
    )
  }
  if (type === "premolar") {
    return (
      <g pointerEvents="none" opacity={0.25}>
        {/* Sulco central do pré-molar */}
        <path
          d={`M ${CX},${CY - 7} L ${CX},${CY + 7}`}
          stroke="rgba(80,40,10,0.55)" strokeWidth={1.5} fill="none" strokeLinecap="round"
        />
        <ellipse cx={CX} cy={CY - 5} rx={5} ry={3.5} fill="rgba(255,255,255,0.2)" />
        <ellipse cx={CX} cy={CY + 5} rx={5} ry={3.5} fill="rgba(255,255,255,0.15)" />
      </g>
    )
  }
  if (type === "canine") {
    return (
      <g pointerEvents="none" opacity={0.2}>
        {/* Crista labial do canino */}
        <path
          d={`M ${CX},${CY - 8} Q ${CX + 2},${CY} ${CX},${CY + 8}`}
          stroke="rgba(80,40,10,0.4)" strokeWidth={1.2} fill="none" strokeLinecap="round"
        />
        <ellipse cx={CX} cy={CY - 4} rx={4} ry={5} fill="rgba(255,255,255,0.25)" />
      </g>
    )
  }
  // Incisivo
  return (
    <g pointerEvents="none" opacity={0.18}>
      <ellipse cx={CX} cy={CY} rx={4} ry={7} fill="rgba(255,255,255,0.2)" />
    </g>
  )
}

// ── 5. Resolução de cor/estilo por estado da face ─────────────────────────────

function resolveFaceStyle(
  dente: DenteData,
  faceId: FaceId,
  isSelected: boolean,
  isHovered: boolean
): { fill: string; fillOpacity: number; stroke: string; strokeWidth: number } {
  if (dente.ausente) {
    return {
      fill: "rgba(255,255,255,0.04)", fillOpacity: 1,
      stroke: "rgba(255,255,255,0.04)", strokeWidth: 0.5,
    }
  }

  const fd = dente.faces.find((f) => f.id === faceId)
  const status = fd?.status ?? "saudavel"
  const cfg = FACE_CONFIG[status]

  if (status === "ausente") {
    return {
      fill: "rgba(255,255,255,0.06)", fillOpacity: 1,
      stroke: "rgba(255,255,255,0.04)", strokeWidth: 0.5,
    }
  }

  if (isSelected) {
    return {
      fill: cfg?.cor ?? "#ffffff", fillOpacity: 0.95,
      stroke: "#A855F7", strokeWidth: 1.5,
    }
  }

  if (isHovered) {
    if (status === "saudavel") {
      return {
        fill: "rgba(255,255,255,0.95)", fillOpacity: 1,
        stroke: "rgba(255,255,255,0.4)", strokeWidth: 0.8,
      }
    }
    return {
      fill: cfg?.brilho ?? "#ffffff", fillOpacity: 0.9,
      stroke: "rgba(255,255,255,0.22)", strokeWidth: 0.8,
    }
  }

  if (status === "saudavel") {
    return {
      fill: "rgba(255,255,255,0.84)", fillOpacity: 1,
      stroke: "rgba(255,255,255,0.1)", strokeWidth: 0.5,
    }
  }

  return {
    fill: cfg?.cor ?? "#ffffff", fillOpacity: 0.88,
    stroke: "rgba(255,255,255,0.08)", strokeWidth: 0.5,
  }
}

// ── 6. Props do componente ────────────────────────────────────────────────────

export interface ToothCellProps {
  dente: DenteData
  x: number
  y: number
  isUpper: boolean
  selectedFace: { numero: number; face: FaceId } | null
  hoveredCell: { numero: number; face: FaceId } | null
  onFaceClick: (numero: number, face: FaceId) => void
  onFaceHover: (info: { numero: number; face: FaceId } | null) => void
}

// ── 7. Componente principal ───────────────────────────────────────────────────

export function ToothCell({
  dente, x, y, isUpper,
  selectedFace, hoveredCell, onFaceClick, onFaceHover,
}: ToothCellProps) {
  const type = getToothType(dente.numero)
  const silhueta = SILHUETAS[type]
  const strips = buildFaceStrips(isUpper)
  const oclualOval = OCLUSAL_OVAL[type]

  const faceIds: FaceId[] = isUpper
    ? ["vestibular", "palatina", "mesial", "distal", "oclusal"]
    : ["vestibular", "lingual", "mesial", "distal", "oclusal"]

  const isToothSelected = selectedFace?.numero === dente.numero
  const isToothHovered = hoveredCell?.numero === dente.numero

  // IDs únicos por dente (evita conflitos quando há múltiplos SVGs na página)
  const uid = dente.numero
  const clipId     = `clip-${uid}`
  const gradId     = `enamel-${uid}`
  const glossId    = `gloss-${uid}`
  const shadowId   = `shadow-${uid}`

  return (
    <g transform={`translate(${x}, ${y})`} data-tooth={uid}>
      <defs>
        {/* ClipPath com a silhueta anatômica */}
        <clipPath id={clipId}>
          <path d={silhueta} />
        </clipPath>

        {/* Gradiente radial de esmalte (ivory → creme → sombra) */}
        <radialGradient id={gradId} cx="35%" cy="28%" r="72%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity={0.98} />
          <stop offset="28%"  stopColor="#f5f0e8" stopOpacity={0.95} />
          <stop offset="65%"  stopColor="#e8e0d0" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#c8bca8" stopOpacity={0.85} />
        </radialGradient>

        {/* Gradiente de brilho (gloss highlight) */}
        <radialGradient id={glossId} cx="30%" cy="20%" r="55%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>

        {/* Sombra de queda (drop shadow) */}
        <filter id={shadowId} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="rgba(0,0,0,0.35)" />
        </filter>
      </defs>

      {/* ── Sombra projetada ── */}
      <path
        d={silhueta}
        fill="rgba(0,0,0,0.25)"
        filter={`url(#${shadowId})`}
        transform="translate(0,1.5)"
        pointerEvents="none"
        opacity={dente.ausente ? 0.06 : 0.6}
      />

      {/* ── Fundo de esmalte com gradiente (dentro do clipPath) ── */}
      <g clipPath={`url(#${clipId})`}>
        <path
          d={silhueta}
          fill={dente.ausente ? "rgba(255,255,255,0.06)" : `url(#${gradId})`}
        />

        {/* ── Faces clicáveis (tiras trapezoidais) ── */}
        {!dente.ausente && faceIds.map((faceId) => {
          const pathD = strips[faceId]
          if (!pathD) return null

          const isFaceSelected = isToothSelected && selectedFace?.face === faceId
          const isFaceHovered  = isToothHovered  && hoveredCell?.face  === faceId
          const style = resolveFaceStyle(dente, faceId, isFaceSelected, isFaceHovered)

          // Faces saudáveis ficam transparentes (mostra gradiente de esmalte)
          const fd = dente.faces.find((f) => f.id === faceId)
          const isSaudavel = !fd || fd.status === "saudavel"

          if (isSaudavel && !isFaceSelected && !isFaceHovered) {
            // Face saudável: só borda suave, sem fill colorido
            return (
              <path
                key={faceId}
                d={pathD}
                fill="transparent"
                stroke="rgba(150,120,90,0.12)"
                strokeWidth={0.6}
                style={{ cursor: "pointer" }}
                onClick={() => onFaceClick(dente.numero, faceId)}
                onMouseEnter={() => onFaceHover({ numero: dente.numero, face: faceId })}
                onMouseLeave={() => onFaceHover(null)}
                onTouchStart={(e) => { e.preventDefault(); onFaceClick(dente.numero, faceId) }}
              />
            )
          }

          return (
            <path
              key={faceId}
              d={pathD}
              fill={style.fill}
              fillOpacity={style.fillOpacity}
              stroke={style.stroke}
              strokeWidth={style.strokeWidth}
              style={{
                cursor: "pointer",
                transition: "fill 0.13s ease, fill-opacity 0.13s ease",
              }}
              onClick={() => onFaceClick(dente.numero, faceId)}
              onMouseEnter={() => onFaceHover({ numero: dente.numero, face: faceId })}
              onMouseLeave={() => onFaceHover(null)}
              onTouchStart={(e) => { e.preventDefault(); onFaceClick(dente.numero, faceId) }}
            />
          )
        })}

        {/* ── Detalhes anatômicos (sulcos, cúspides) ── */}
        {!dente.ausente && <AnatDetalhes type={type} />}

        {/* ── Gloss highlight (brilho do esmalte) ── */}
        {!dente.ausente && (
          <path
            d={silhueta}
            fill={`url(#${glossId})`}
            pointerEvents="none"
          />
        )}

        {/* ── X do dente ausente ── */}
        {dente.ausente && (
          <g pointerEvents="none" opacity={0.2}>
            <line x1={6}  y1={6}  x2={TOOTH_W - 6} y2={TOOTH_H - 6}
              stroke="rgba(255,255,255,0.8)" strokeWidth={1.5} strokeLinecap="round" />
            <line x1={TOOTH_W - 6} y1={6} x2={6} y2={TOOTH_H - 6}
              stroke="rgba(255,255,255,0.8)" strokeWidth={1.5} strokeLinecap="round" />
          </g>
        )}
      </g>

      {/* ── Borda externa seguindo a silhueta ── */}
      <path
        d={silhueta}
        fill="none"
        stroke={
          isToothSelected
            ? "rgba(168,85,247,0.65)"
            : isToothHovered
            ? "rgba(255,255,255,0.30)"
            : "rgba(180,150,110,0.22)"
        }
        strokeWidth={isToothSelected ? 1.8 : isToothHovered ? 1.2 : 0.8}
        pointerEvents="none"
        style={{ transition: "stroke 0.13s ease, stroke-width 0.13s ease" }}
      />

      {/* ── Área de clique invisível (para dentes ausentes) ── */}
      {dente.ausente && faceIds.map((faceId) => {
        const pathD = strips[faceId]
        if (!pathD) return null
        return (
          <path
            key={faceId}
            d={pathD}
            fill="transparent"
            style={{ cursor: "pointer" }}
            clipPath={`url(#${clipId})`}
            onClick={() => onFaceClick(dente.numero, faceId)}
            onMouseEnter={() => onFaceHover({ numero: dente.numero, face: faceId })}
            onMouseLeave={() => onFaceHover(null)}
          />
        )
      })}

      {/* ── Indicador de implante ── */}
      {dente.implante && !dente.ausente && (
        <circle
          cx={CX} cy={CY} r={4.5}
          fill="none" stroke="#06B6D4" strokeWidth={1.5} strokeDasharray="2.5,1.5"
          pointerEvents="none"
        />
      )}

      {/* ── Indicador de extração ── */}
      {dente.extracao && (
        <g pointerEvents="none">
          <line
            x1={CX - 7} y1={TOOTH_H - 3}
            x2={CX + 7} y2={TOOTH_H - 3}
            stroke="#8B5CF6" strokeWidth={2.5} strokeLinecap="round" opacity={0.8}
          />
        </g>
      )}

      {/* ── Contorno de coroa (prótese) ── */}
      {(dente.coroa || dente.faces.some((f) => f.status === "proteses")) && !dente.ausente && (
        <path
          d={silhueta}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={2}
          strokeDasharray="4,2.5"
          pointerEvents="none"
          opacity={0.6}
        />
      )}
    </g>
  )
}
