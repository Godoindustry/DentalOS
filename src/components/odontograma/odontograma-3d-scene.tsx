"use client"

import { useMemo, useState } from "react"
import { Canvas, type ThreeEvent } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows, Html } from "@react-three/drei"
import { AnimatePresence, motion } from "framer-motion"
import * as THREE from "three"
import { useOdontogramaStore } from "@/store/odontograma-store"
import {
  SUPERIORES, INFERIORES, FACE_CONFIG, PROCEDIMENTOS, getToothType,
} from "./types"
import type { DenteData, FaceStatus } from "./types"

interface Posicao3D {
  numero: number
  x: number
  y: number
  z: number
  rotY: number
  scale: number
}

// ── Geração procedural da curva de arco dentário ─────────────────────────────
// Sem asset GLB anatômico disponível: cada dente é uma geometria primitiva
// (raiz + coroa) posicionada ao longo de uma curva em ferradura.
function gerarArco(numeros: number[], isUpper: boolean): Posicao3D[] {
  const n = numeros.length
  const raioX = 3.4
  const raioZ = 2.3
  const anguloMax = (Math.PI * 0.78) / 2 // abertura do arco

  return numeros.map((numero, i) => {
    const t = n > 1 ? i / (n - 1) : 0.5 // 0..1
    const angulo = -anguloMax + t * (2 * anguloMax)
    const tipo = getToothType(numero)
    const escala = tipo === "molar" ? 1.15 : tipo === "premolar" ? 1.0 : 0.85

    const x = Math.sin(angulo) * raioX
    const z = -Math.cos(angulo) * raioZ + raioZ
    const y = isUpper ? 0.55 : -0.55

    return {
      numero,
      x,
      y,
      z,
      rotY: -angulo,
      scale: escala,
    }
  })
}

const COR_ESMALTE = "#F8F8F0"
const COR_HOVER = "#FF6600"
const COR_SELECIONADO = "#A855F7"

function corDoDente(dente: DenteData): string {
  if (dente.ausente) return FACE_CONFIG.ausente.cor
  const prioridade: FaceStatus[] = [
    "cariado", "fratura", "canal", "proteses", "restaurado", "faceta", "planejado", "profilaxia", "observacao",
  ]
  for (const status of prioridade) {
    if (dente.faces.some((f) => f.status === status)) return FACE_CONFIG[status].cor
  }
  return COR_ESMALTE
}

// ── Malha de um dente (raiz + coroa, geometria procedural, material PBR) ─────

function Tooth3D({
  dente,
  pos,
  isSelected,
  onSelect,
}: {
  dente: DenteData
  pos: Posicao3D
  isSelected: boolean
  onSelect: (numero: number, event: ThreeEvent<MouseEvent>) => void
}) {
  const [hovered, setHovered] = useState(false)
  const corBase = corDoDente(dente)
  const opacidadeAusente = dente.ausente ? 0.25 : 1

  const corDestaque = isSelected ? COR_SELECIONADO : hovered ? COR_HOVER : undefined

  return (
    <group
      position={[pos.x, pos.y, pos.z]}
      rotation={[0, pos.rotY, 0]}
      scale={pos.scale * (hovered || isSelected ? 1.1 : 1)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false) }}
      onClick={(e) => { e.stopPropagation(); onSelect(dente.numero, e) }}
    >
      {/* Coroa — esmalte dental PBR (clearcoat simula o brilho do verniz) */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.24, 0.22, 6, 12]} />
        <meshPhysicalMaterial
          color={corBase}
          roughness={0.18}
          metalness={0.02}
          clearcoat={0.8}
          clearcoatRoughness={0.15}
          transparent={dente.ausente}
          opacity={opacidadeAusente}
          emissive={corDestaque ? new THREE.Color(corDestaque) : undefined}
          emissiveIntensity={corDestaque ? (isSelected ? 0.4 : 0.3) : 0}
        />
      </mesh>
      {/* Raiz */}
      <mesh position={[0, -0.28, 0]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial
          color="#E4D9BF"
          roughness={0.6}
          transparent
          opacity={dente.ausente ? 0.08 : 0.4}
        />
      </mesh>

      {/* Badge flutuante com o número do dente (HTML, sempre de frente pra câmera).
          pointerEvents="none": puramente decorativo, não pode bloquear o
          clique no dente (raycasting do R3F) por trás dele. */}
      <Html
        position={[0, pos.y > 0 ? 0.68 : -0.68, 0]}
        center
        distanceFactor={9}
        sprite
        pointerEvents="none"
      >
        <div
          className="whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium backdrop-blur-md transition-colors"
          style={{
            background: "rgba(15,23,42,0.8)",
            borderColor: corDestaque ?? "rgba(100,116,139,0.5)",
            color: corDestaque ?? "#cbd5e1",
          }}
        >
          {dente.numero}
        </div>
      </Html>
    </group>
  )
}

// ── Gengiva contínua (tubo anatômico ao longo da curva do arco) ─────────────

function FaixaGengival({ pontos, isUpper }: { pontos: Posicao3D[]; isUpper: boolean }) {
  const geometry = useMemo(() => {
    const offsetY = isUpper ? 0.16 : -0.16
    const vetores = pontos.map((p) => new THREE.Vector3(p.x, p.y + offsetY, p.z))
    const curva = new THREE.CatmullRomCurve3(vetores, false, "catmullrom", 0.4)
    return new THREE.TubeGeometry(curva, 64, 0.42, 10, false)
  }, [pontos, isUpper])

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color="#D46A72" roughness={0.42} metalness={0} />
    </mesh>
  )
}

// ── Menu radial de ações rápidas (overlay HTML sobre o canvas) ───────────────

interface RadialMenuState {
  numero: number
  x: number
  y: number
}

function RadialMenu({
  state,
  onClose,
}: {
  state: RadialMenuState
  onClose: () => void
}) {
  const applyProcedure = useOdontogramaStore((s) => s.applyProcedure)
  const toggleImplante = useOdontogramaStore((s) => s.toggleImplante)
  const toggleExtracao = useOdontogramaStore((s) => s.toggleExtracao)
  const schedulePersist = useOdontogramaStore((s) => s.schedulePersist)
  const pacienteId = useOdontogramaStore((s) => s.pacienteIdAtual)

  const itens = PROCEDIMENTOS
  const raio = 92

  const handlePick = (chave: FaceStatus | "implante" | "extracao") => {
    if (chave === "implante") toggleImplante(state.numero)
    else if (chave === "extracao") toggleExtracao(state.numero)
    else applyProcedure(state.numero, "vestibular", chave)
    if (pacienteId) schedulePersist(pacienteId)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <motion.div
        className="absolute flex items-center justify-center"
        style={{ left: state.x, top: state.y, width: 0, height: 0 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg whitespace-nowrap">
          Dente {state.numero}
        </div>
        {itens.map((item, i) => {
          const angulo = (i / itens.length) * Math.PI * 2 - Math.PI / 2
          const x = Math.cos(angulo) * raio
          const y = Math.sin(angulo) * raio
          return (
            <motion.button
              key={item.chave}
              onClick={(e) => { e.stopPropagation(); handlePick(item.chave) }}
              className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-[9px] font-medium text-white shadow-lg backdrop-blur-md"
              style={{ backgroundColor: `${item.cor}CC` }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
              animate={{ x, y, opacity: 1, scale: 1 }}
              exit={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.02 }}
              whileHover={{ scale: 1.15 }}
              title={item.label}
            >
              {item.label.slice(0, 4)}
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}

// ── Cena principal ────────────────────────────────────────────────────────────

interface Odontograma3DSceneProps {
  pacienteId: string
}

export function Odontograma3DScene({ pacienteId }: Odontograma3DSceneProps) {
  const arcadaSup = useOdontogramaStore((s) => s.arcadaSup)
  const arcadaInf = useOdontogramaStore((s) => s.arcadaInf)
  const setPacienteIdAtual = useOdontogramaStore((s) => s.setPacienteIdAtual)
  const [menu, setMenu] = useState<RadialMenuState | null>(null)

  useMemo(() => setPacienteIdAtual(pacienteId), [pacienteId, setPacienteIdAtual])

  const posSup = useMemo(() => gerarArco(SUPERIORES, true), [])
  const posInf = useMemo(() => gerarArco(INFERIORES, false), [])

  const handleSelect = (numero: number, event: ThreeEvent<MouseEvent>) => {
    setMenu({
      numero,
      x: event.nativeEvent.clientX,
      y: event.nativeEvent.clientY,
    })
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl border border-border"
      style={{ background: "radial-gradient(ellipse at 50% 20%, #111827 0%, #090D16 70%)" }}
    >
      <Canvas shadows camera={{ position: [0, 3.1, 5.4], fov: 38 }}>
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[2.5, 6, 3]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <Environment preset="studio" />

        <FaixaGengival pontos={posSup} isUpper />
        <FaixaGengival pontos={posInf} isUpper={false} />

        {posSup.map((pos) => {
          const dente = arcadaSup.find((d) => d.numero === pos.numero)
          if (!dente) return null
          return (
            <Tooth3D
              key={pos.numero}
              dente={dente}
              pos={pos}
              isSelected={menu?.numero === pos.numero}
              onSelect={handleSelect}
            />
          )
        })}
        {posInf.map((pos) => {
          const dente = arcadaInf.find((d) => d.numero === pos.numero)
          if (!dente) return null
          return (
            <Tooth3D
              key={pos.numero}
              dente={dente}
              pos={pos}
              isSelected={menu?.numero === pos.numero}
              onSelect={handleSelect}
            />
          )
        })}

        <ContactShadows position={[0, -1.4, 0]} opacity={0.45} scale={10} blur={1.6} far={4.5} />

        <OrbitControls
          enablePan
          minDistance={3.5}
          maxDistance={9}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-black/40 px-2.5 py-1 text-[10px] text-slate-300 backdrop-blur-sm">
        Arraste para girar · Scroll para zoom · Clique num dente para lançar um procedimento
      </div>

      <AnimatePresence>
        {menu && <RadialMenu state={menu} onClose={() => setMenu(null)} />}
      </AnimatePresence>
    </div>
  )
}
