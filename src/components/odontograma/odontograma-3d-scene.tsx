"use client"

import { useRef, useState, useMemo, useCallback } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei"
import * as THREE from "three"
import { motion, AnimatePresence } from "framer-motion"

// ── Tipos de dentes ───────────────────────────────────────────────────────────
type TipoDente = "incisor" | "canine" | "premolar" | "molar"

// Dimensões (W, H, D) por tipo de dente
const DIMS: Record<TipoDente, [number, number, number]> = {
  incisor:  [0.20, 0.42, 0.15],
  canine:   [0.18, 0.48, 0.17],
  premolar: [0.24, 0.36, 0.24],
  molar:    [0.30, 0.30, 0.30],
}

// Sequência dos 16 dentes (direita → esquerda: 18→11, 21→28)
const SEQUENCIA: TipoDente[] = [
  "molar","molar","premolar","premolar",
  "canine","incisor","incisor","incisor",
  "incisor","incisor","incisor","canine",
  "premolar","premolar","molar","molar",
]

// ── Posições do arco dental (semi-elipse) ─────────────────────────────────────
interface PosicaoDente {
  x: number; z: number; rotY: number
  w: number; h: number; d: number
  tipo: TipoDente
}

function calcularArco(): PosicaoDente[] {
  const n = 16
  const a = 1.35   // semi-eixo X (largura)
  const b = 1.52   // semi-eixo Z (profundidade → frente)

  return SEQUENCIA.map((tipo, i) => {
    const t    = (i / (n - 1)) * Math.PI   // 0 → π
    const x    = a * Math.cos(t)            // +1.35 → 0 → -1.35
    const z    = b * Math.sin(t)            // 0 → 1.52 → 0  (incisivos mais próximos)
    const rotY = Math.atan2(Math.cos(t), Math.sin(t))
    const [w, h, d] = DIMS[tipo]
    return { x, z, rotY, w, h, d, tipo }
  })
}

const ARCO = calcularArco()

// ── Curva CatmullRom para o tubo de gengiva ───────────────────────────────────
function criarCurvaGengiva() {
  const pts = Array.from({ length: 34 }, (_, i) => {
    const t = (i / 33) * Math.PI
    return new THREE.Vector3(1.50 * Math.cos(t), 0, 1.68 * Math.sin(t))
  })
  return new THREE.CatmullRomCurve3(pts)
}

// ── Gengiva ───────────────────────────────────────────────────────────────────
function Gengiva({ isUpper }: { isUpper: boolean }) {
  const curva = useMemo(criarCurvaGengiva, [])

  return (
    <group>
      {/* Tubo da gengiva ao longo do arco */}
      <mesh castShadow receiveShadow>
        <tubeGeometry args={[curva, 56, 0.28, 12, false]} />
        <meshStandardMaterial
          color="#E8889A"
          roughness={0.48}
          metalness={0.0}
        />
      </mesh>

      {/* Palato superior / Piso da boca inferior */}
      <mesh
        position={[0, isUpper ? 0.22 : -0.22, 0.72]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[2.6, 1.4]} />
        <meshStandardMaterial
          color="#C86A7A"
          roughness={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Processo alveolar — crista óssea */}
      <mesh position={[0, isUpper ? -0.05 : 0.05, 0.55]}>
        <torusGeometry args={[1.1, 0.13, 8, 40, Math.PI]} />
        <meshStandardMaterial color="#D4909A" roughness={0.6} />
      </mesh>
    </group>
  )
}

// ── Dente individual ──────────────────────────────────────────────────────────
function Dente({ x, z, rotY, w, h, d, isUpper }: PosicaoDente & { isUpper: boolean }) {
  // Incisivos superiores pendem para baixo; inferiores apontam para cima
  const yCoroa   = isUpper ? -h * 0.50 : h * 0.50
  const yCervical = isUpper ?  h * 0.25 : -h * 0.25

  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* Coroa — esmalte dentário */}
      <mesh position={[0, yCoroa, 0]} castShadow>
        <boxGeometry args={[w, h * 0.80, d]} />
        <meshStandardMaterial
          color="#F0EBE3"
          roughness={0.08}
          metalness={0.0}
          envMapIntensity={1.4}
        />
      </mesh>

      {/* Colo cervical — onde a gengiva encontra o dente */}
      <mesh position={[0, yCervical, 0]} castShadow>
        <boxGeometry args={[w * 0.90, h * 0.16, d * 0.90]} />
        <meshStandardMaterial
          color="#E8DDD3"
          roughness={0.22}
        />
      </mesh>
    </group>
  )
}

// ── Arcada Superior (Maxilar — fixa) ─────────────────────────────────────────
function ArcadaSuperior() {
  return (
    <group position={[0, 0.26, 0]}>
      <Gengiva isUpper />
      {ARCO.map((pos, i) => (
        <Dente key={i} {...pos} isUpper />
      ))}
    </group>
  )
}

// ── Arcada Inferior (Mandíbula — animada) ─────────────────────────────────────
function ArcadaInferior({
  aberta,
  onToggle,
}: {
  aberta: boolean
  onToggle: () => void
}) {
  const ref = useRef<THREE.Group>(null)
  // ATM: pivô na parte POSTERIOR do arco (z ≈ 0, dentes anteriores a z+)
  // Rotação X positiva → dentes frontais descem → boca abre
  const alvo = aberta ? THREE.MathUtils.degToRad(28) : 0

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.x = THREE.MathUtils.lerp(
      ref.current.rotation.x,
      alvo,
      Math.min(delta * 8, 1),
    )
  })

  return (
    <group ref={ref} position={[0, -0.26, 0]}>
      <Gengiva isUpper={false} />
      {ARCO.map((pos, i) => (
        <Dente key={i} {...pos} isUpper={false} />
      ))}

      {/* Corpo da mandíbula (ramo vertical) — geometria simplificada */}
      <mesh position={[1.55, -0.35, -0.2]} rotation={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.22, 0.7, 0.35]} />
        <meshStandardMaterial color="#C47880" roughness={0.6} />
      </mesh>
      <mesh position={[-1.55, -0.35, -0.2]} rotation={[0, -0.45, 0]} castShadow>
        <boxGeometry args={[0.22, 0.7, 0.35]} />
        <meshStandardMaterial color="#C47880" roughness={0.6} />
      </mesh>

      {/* Área clicável invisível */}
      <mesh onClick={(e) => { e.stopPropagation(); onToggle() }} visible={false}>
        <boxGeometry args={[4.5, 1.4, 4.5]} />
      </mesh>
    </group>
  )
}

// ── Modelo dental completo ────────────────────────────────────────────────────
function ModeloDental({ aberta, onToggle }: { aberta: boolean; onToggle: () => void }) {
  return (
    <group position={[0, 0, -0.3]}>
      <ArcadaSuperior />
      <ArcadaInferior aberta={aberta} onToggle={onToggle} />
    </group>
  )
}

// ── Componente exportado: DentalJawViewer ─────────────────────────────────────
export function DentalJawViewer() {
  const [aberta, setAberta] = useState(false)
  const toggle = useCallback(() => setAberta((v) => !v), [])

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-2xl"
      style={{
        height: 460,
        background: "linear-gradient(140deg, #0f172a 0%, #1e293b 55%, #0f1f3a 100%)",
      }}
    >
      {/* ── Overlay de UI ──────────────────────────────────────────────── */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-3">
        <motion.button
          onClick={toggle}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-lg backdrop-blur-md transition-colors hover:bg-accent"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={aberta ? "fechar" : "abrir"}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
            >
              {aberta ? "🦷 Fechar Boca" : "😮 Abrir Boca"}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        <span className="hidden rounded-lg border border-border bg-black/20 px-3 py-2 text-[11px] text-foreground/35 backdrop-blur-sm sm:inline">
          Arraste · Scroll · Clique no modelo
        </span>
      </div>

      {/* ── Badge ATM ─────────────────────────────────────────────────── */}
      <div className="absolute bottom-4 right-4 z-10">
        <span className="rounded-full border border-border bg-card px-3 py-1 text-[10px] font-medium text-muted-foreground/70 backdrop-blur-sm">
          Manequim 3D · ATM Interativa · FDI
        </span>
      </div>

      {/* ── Indicador de abertura ──────────────────────────────────────── */}
      <AnimatePresence>
        {aberta && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="absolute right-4 top-4 z-10"
          >
            <div className="flex flex-col items-end gap-1 rounded-xl border border-border bg-card px-3 py-2.5 backdrop-blur-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">
                Abertura ativo
              </span>
              <span className="text-[11px] text-muted-foreground">ATM: ~28° rotação</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Canvas Three.js ────────────────────────────────────────────── */}
      <Canvas
        shadows
        camera={{ fov: 40, position: [0, 1.2, 7], near: 0.1, far: 60 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        {/* Iluminação clínica */}
        <ambientLight intensity={0.55} color="#eef4ff" />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.6}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={20}
          color="#fff5ee"
        />
        <directionalLight
          position={[-4, 3, -3]}
          intensity={0.5}
          color="#bbd4ff"
        />
        <pointLight
          position={[0, -2, 3.5]}
          intensity={0.7}
          color="#ffd0da"
          decay={2}
        />
        <hemisphereLight
          args={["#ddeeff", "#ffecf0", 0.4]}
        />

        {/* HDRI para reflexos no esmalte */}
        <Environment preset="studio" />

        {/* Modelo */}
        <ModeloDental aberta={aberta} onToggle={toggle} />

        {/* Sombra projetada no chão */}
        <ContactShadows
          position={[0, -2.0, 0]}
          opacity={0.55}
          scale={10}
          blur={3.5}
          far={5}
          color="#000025"
        />

        {/* Controles orbitais */}
        <OrbitControls
          enablePan={false}
          minDistance={3.5}
          maxDistance={13}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 1.75}
          autoRotate={!aberta}
          autoRotateSpeed={0.5}
          dampingFactor={0.07}
          enableDamping
        />
      </Canvas>
    </div>
  )
}

// ── Re-exportação compatível com ProfessionalLayout ───────────────────────────
export function Odontograma3DScene({ pacienteId }: { pacienteId?: string }) {
  return <DentalJawViewer />
}
