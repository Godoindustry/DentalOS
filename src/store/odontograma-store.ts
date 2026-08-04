import { create } from "zustand"
import type {
  DenteData, FaceId, FaceStatus, DenticaoMode, AnotacaoClinical,
  ViewMode, PerioToothData, PerioPoint, EndoToothData, EndoTestKey, EndoResult,
  LogTipo,
} from "@/components/odontograma/types"
import {
  criarDente, SUPERIORES, INFERIORES, DECIDUOS_SUP, DECIDUOS_INF,
  MISTA_SUP, MISTA_INF, dentesParaDB,
} from "@/components/odontograma/types"
import { salvarOdontograma } from "@/app/(dashboard)/actions"
import type { Odontograma } from "@/types/database"

type DentesDB = Odontograma["dentes"]

// ─── Tipos do Store ───────────────────────────────────────────────────────────

interface SeletorFace {
  numero: number
  face: FaceId
}

interface OdontogramaSnapshot {
  arcadaSup: DenteData[]
  arcadaInf: DenteData[]
}

interface OdontogramaStore {
  // Estado das arcadas
  arcadaSup: DenteData[]
  arcadaInf: DenteData[]

  // Seleção ativa
  selectedFace: SeletorFace | null
  selectedTooth: number | null
  activeProcedure: FaceStatus | null

  // Modo de visualização principal (Dental, Perio, Endo)
  viewMode: ViewMode

  // Modo de dentição
  denticaoMode: DenticaoMode

  // Histórico (undo/redo)
  historico: OdontogramaSnapshot[]
  historicoFuturo: OdontogramaSnapshot[]
  
  // Snapshots de Data para o Timeline/Rollback
  timelineSnapshots: any[]

  // Anotações clínicas por dente
  anotacoes: Record<number, AnotacaoClinical[]>

  // Dados Periodontais
  perioData: Record<number, PerioToothData>

  // Dados Endodônticos (testes de vitalidade)
  endoData: Record<number, EndoToothData>

  // Status de salvamento
  saving: boolean
  loaded: boolean
  pacienteIdAtual: string | null

  // ── Actions ──────────────────────────────────────────────────────────────────
  initFromDb: (db: DentesDB) => void
  setPacienteIdAtual: (id: string) => void
  setViewMode: (mode: ViewMode) => void
  setSelectedFace: (sel: SeletorFace | null) => void
  setSelectedTooth: (numero: number | null) => void
  setActiveProcedure: (p: FaceStatus | null) => void
  setDenticaoMode: (mode: DenticaoMode) => void
  applyProcedure: (numero: number, face: FaceId, procedimento: FaceStatus) => void
  updatePerioPoint: (numero: number, position: keyof PerioToothData["points"], field: keyof PerioPoint, value: boolean) => void
  updateProbingDepth: (numero: number, isMargin: boolean, position: keyof PerioToothData["probing"], value: number | null) => void
  updateEndoTest: (numero: number, test: EndoTestKey, value: EndoResult) => void
  toggleImplante: (numero: number) => void
  toggleExtracao: (numero: number) => void
  resetDente: (numero: number) => void
  undo: () => void
  redo: () => void
  addAnotacao: (numero: number, texto: string, tipo?: LogTipo) => void
  removeAnotacao: (numero: number, id: string) => void
  setSaving: (v: boolean) => void
  getDente: (numero: number) => DenteData | undefined
  nextTooth: (numero: number) => number | null
  schedulePersist: (pacienteId: string) => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Gera arcadas a partir do modo de dentição */
function gerarArcadas(mode: DenticaoMode, refSup?: DenteData[], refInf?: DenteData[]) {
  const createOrReuse = (n: number, ref?: DenteData[]) =>
    ref?.find((d) => d.numero === n) ?? criarDente(n)

  let supNums: number[]
  let infNums: number[]

  if (mode === "adulto") {
    supNums = SUPERIORES
    infNums = INFERIORES
  } else if (mode === "infantil") {
    supNums = DECIDUOS_SUP
    infNums = DECIDUOS_INF
  } else {
    supNums = MISTA_SUP
    infNums = MISTA_INF
  }

  return {
    arcadaSup: supNums.map((n) => createOrReuse(n, refSup)),
    arcadaInf: infNums.map((n) => createOrReuse(n, refInf)),
  }
}

/** Clona profundamente as arcadas (para snapshot imutável) */
function clonarArcadas(sup: DenteData[], inf: DenteData[]): OdontogramaSnapshot {
  return {
    arcadaSup: sup.map((d) => ({ ...d, faces: d.faces.map((f) => ({ ...f })) })),
    arcadaInf: inf.map((d) => ({ ...d, faces: d.faces.map((f) => ({ ...f })) })),
  }
}

function createEmptyPerioPoint(): PerioPoint {
  return { plaque: false, bleeding: false, pus: false, calculus: false }
}

function createEmptyPerioData(numero: number): PerioToothData {
  return {
    numero,
    points: {
      db: createEmptyPerioPoint(), b: createEmptyPerioPoint(), mb: createEmptyPerioPoint(),
      dp: createEmptyPerioPoint(), p: createEmptyPerioPoint(), mp: createEmptyPerioPoint()
    },
    probing: { distoBuccal: null, buccal: null, mesioBuccal: null, distoPalatal: null, palatal: null, mesioPalatal: null },
    gingivalMargin: { distoBuccal: null, buccal: null, mesioBuccal: null, distoPalatal: null, palatal: null, mesioPalatal: null }
  }
}

// ─── Debounce para persist ────────────────────────────────────────────────────

let persistTimer: ReturnType<typeof setTimeout> | null = null

async function doPersist(
  pacienteId: string,
  set: (partial: Partial<OdontogramaStore>) => void,
  get: () => OdontogramaStore,
) {
  set({ saving: true })
  try {
    const state = get()
    await salvarOdontograma({
      paciente_id: pacienteId,
      dentes: dentesParaDB(state.arcadaSup, state.arcadaInf),
    })
  } catch (err) {
    console.error("Erro ao salvar odontograma:", err)
  } finally {
    set({ saving: false })
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

const MAX_HISTORICO = 50

export const useOdontogramaStore = create<OdontogramaStore>((set, get) => ({
  arcadaSup: gerarArcadas("adulto").arcadaSup,
  arcadaInf: gerarArcadas("adulto").arcadaInf,

  selectedFace: null,
  selectedTooth: null,
  activeProcedure: null,
  
  viewMode: "dental",
  denticaoMode: "adulto",

  historico: [],
  historicoFuturo: [],
  timelineSnapshots: [],
  anotacoes: {},
  perioData: {},
  endoData: {},

  saving: false,
  loaded: false,
  pacienteIdAtual: null,

  // ── Inicialização ──────────────────────────────────────────────────────────

  setPacienteIdAtual: (id) => set({ pacienteIdAtual: id }),
  setViewMode: (mode) => set({ viewMode: mode, selectedTooth: null, selectedFace: null }),

  initFromDb: (db: DentesDB) => {
    const parseDente = (n: number) => {
      const saved = db[String(n)]
      const d = criarDente(n)
      if (saved) {
        d.ausente  = saved.ausente ?? false
        d.implante = saved.implante ?? false
        d.coroa    = saved.coroa ?? false
        d.extracao = saved.extracao ?? false
        if (saved.faces) {
          for (const face of d.faces) {
            const savedStatus = saved.faces[face.id]
            if (savedStatus) face.status = savedStatus
          }
        }
      }
      return d
    }
    set({
      arcadaSup: SUPERIORES.map(parseDente),
      arcadaInf: INFERIORES.map(parseDente),
      historico: [],
      historicoFuturo: [],
      loaded: true,
    })
  },

  // ── Seleção ────────────────────────────────────────────────────────────────

  setSelectedFace: (sel) => set({ selectedFace: sel, selectedTooth: sel?.numero ?? null }),

  setSelectedTooth: (numero) => set({ selectedTooth: numero, selectedFace: null }),

  setActiveProcedure: (p) => set({ activeProcedure: p }),

  // ── Modo de dentição ────────────────────────────────────────────────────────

  setDenticaoMode: (mode) => {
    const { arcadaSup, arcadaInf } = get()
    const novas = gerarArcadas(mode, arcadaSup, arcadaInf)
    set({
      ...novas,
      denticaoMode: mode,
      selectedFace: null,
      selectedTooth: null,
      historico: [],
      historicoFuturo: [],
    })
  },

  // ── Aplicar procedimento ────────────────────────────────────────────────────

  applyProcedure: (numero, face, procedimento) => {
    const { arcadaSup, arcadaInf } = get()
    // Guarda snapshot ANTES da mutação
    const snapshot = clonarArcadas(arcadaSup, arcadaInf)

    const sup = arcadaSup.map((d) => ({ ...d, faces: d.faces.map((f) => ({ ...f })) }))
    const inf = arcadaInf.map((d) => ({ ...d, faces: d.faces.map((f) => ({ ...f })) }))

    const dente = [...sup, ...inf].find((d) => d.numero === numero)
    if (!dente) return

    if (procedimento === "ausente") {
      dente.ausente = !dente.ausente
    } else {
      const f = dente.faces.find((x) => x.id === face)
      if (f) {
        f.status = f.status === procedimento ? "saudavel" : procedimento
      }
    }

    set((s) => ({
      arcadaSup: sup,
      arcadaInf: inf,
      historico: [...s.historico.slice(-MAX_HISTORICO + 1), snapshot],
      historicoFuturo: [],
    }))
  },

  // ── Periodontia ─────────────────────────────────────────────────────────────

  updatePerioPoint: (numero, position, field, value) => {
    set((state) => {
      const pData = state.perioData[numero] || createEmptyPerioData(numero)
      const novoPData = { 
        ...pData, 
        points: { 
          ...pData.points, 
          [position]: { ...pData.points[position], [field]: value } 
        } 
      }
      return { perioData: { ...state.perioData, [numero]: novoPData } }
    })
  },

  updateProbingDepth: (numero, isMargin, position, value) => {
    set((state) => {
      const pData = state.perioData[numero] || createEmptyPerioData(numero)
      const target = isMargin ? "gingivalMargin" : "probing"
      const novoPData = {
        ...pData,
        [target]: { ...pData[target], [position]: value }
      }
      return { perioData: { ...state.perioData, [numero]: novoPData } }
    })
  },

  // ── Endodontia ─────────────────────────────────────────────────────────────

  updateEndoTest: (numero, test, value) => {
    set((state) => {
      const empty: EndoToothData = { cold: null, percussion: null, palpation: null, heat: null, electricity: null }
      const eData = state.endoData[numero] || empty
      return { endoData: { ...state.endoData, [numero]: { ...eData, [test]: value } } }
    })
  },

  // ── Implante / Extração ─────────────────────────────────────────────────────

  toggleImplante: (numero) => {
    const { arcadaSup, arcadaInf } = get()
    const snapshot = clonarArcadas(arcadaSup, arcadaInf)
    const sup = arcadaSup.map((d) => ({ ...d, faces: d.faces.map((f) => ({ ...f })) }))
    const inf = arcadaInf.map((d) => ({ ...d, faces: d.faces.map((f) => ({ ...f })) }))
    const dente = [...sup, ...inf].find((d) => d.numero === numero)
    if (!dente) return
    dente.implante = !dente.implante
    set((s) => ({
      arcadaSup: sup,
      arcadaInf: inf,
      historico: [...s.historico.slice(-MAX_HISTORICO + 1), snapshot],
      historicoFuturo: [],
    }))
  },

  toggleExtracao: (numero) => {
    const { arcadaSup, arcadaInf } = get()
    const snapshot = clonarArcadas(arcadaSup, arcadaInf)
    const sup = arcadaSup.map((d) => ({ ...d, faces: d.faces.map((f) => ({ ...f })) }))
    const inf = arcadaInf.map((d) => ({ ...d, faces: d.faces.map((f) => ({ ...f })) }))
    const dente = [...sup, ...inf].find((d) => d.numero === numero)
    if (!dente) return
    dente.extracao = !dente.extracao
    set((s) => ({
      arcadaSup: sup,
      arcadaInf: inf,
      historico: [...s.historico.slice(-MAX_HISTORICO + 1), snapshot],
      historicoFuturo: [],
    }))
  },

  resetDente: (numero) => {
    const { arcadaSup, arcadaInf } = get()
    const snapshot = clonarArcadas(arcadaSup, arcadaInf)
    const sup = arcadaSup.map((d) => ({ ...d, faces: d.faces.map((f) => ({ ...f })) }))
    const inf = arcadaInf.map((d) => ({ ...d, faces: d.faces.map((f) => ({ ...f })) }))
    const dente = [...sup, ...inf].find((d) => d.numero === numero)
    if (!dente) return
    dente.ausente = false
    dente.implante = false
    dente.coroa = false
    dente.extracao = false
    dente.faces.forEach((f) => { f.status = "saudavel"; f.observacoes = undefined })
    set((s) => ({
      arcadaSup: sup,
      arcadaInf: inf,
      historico: [...s.historico.slice(-MAX_HISTORICO + 1), snapshot],
      historicoFuturo: [],
      anotacoes: { ...s.anotacoes, [numero]: [] },
    }))
  },

  // ── Undo / Redo ────────────────────────────────────────────────────────────

  undo: () => {
    const { historico, arcadaSup, arcadaInf } = get()
    if (historico.length === 0) return
    const anterior = historico[historico.length - 1]
    const futuroSnapshot = clonarArcadas(arcadaSup, arcadaInf)
    set((s) => ({
      arcadaSup: anterior.arcadaSup,
      arcadaInf: anterior.arcadaInf,
      historico: s.historico.slice(0, -1),
      historicoFuturo: [futuroSnapshot, ...s.historicoFuturo.slice(0, MAX_HISTORICO - 1)],
    }))
  },

  redo: () => {
    const { historicoFuturo, arcadaSup, arcadaInf } = get()
    if (historicoFuturo.length === 0) return
    const proximo = historicoFuturo[0]
    const snapshot = clonarArcadas(arcadaSup, arcadaInf)
    set((s) => ({
      arcadaSup: proximo.arcadaSup,
      arcadaInf: proximo.arcadaInf,
      historico: [...s.historico.slice(-MAX_HISTORICO + 1), snapshot],
      historicoFuturo: s.historicoFuturo.slice(1),
    }))
  },

  // ── Anotações Clínicas ─────────────────────────────────────────────────────

  addAnotacao: (numero, texto, tipo) => {
    if (!texto.trim()) return
    const nova: AnotacaoClinical = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      toothNumber: numero,
      texto: texto.trim(),
      criadoEm: new Date().toISOString(),
      tipo,
    }
    set((s) => ({
      anotacoes: {
        ...s.anotacoes,
        [numero]: [nova, ...(s.anotacoes[numero] ?? [])],
      },
    }))
  },

  removeAnotacao: (numero, id) => {
    set((s) => ({
      anotacoes: {
        ...s.anotacoes,
        [numero]: (s.anotacoes[numero] ?? []).filter((a) => a.id !== id),
      },
    }))
  },

  // ── Status ─────────────────────────────────────────────────────────────────

  setSaving: (v) => set({ saving: v }),

  getDente: (numero) =>
    [...get().arcadaSup, ...get().arcadaInf].find((d) => d.numero === numero),

  nextTooth: (numero) => {
    const { arcadaSup, arcadaInf } = get()
    const sequence = [...arcadaSup, ...arcadaInf].map((d) => d.numero)
    const idx = sequence.indexOf(numero)
    if (idx === -1 || idx === sequence.length - 1) return null
    return sequence[idx + 1]
  },

  schedulePersist: (pacienteId) => {
    if (persistTimer) clearTimeout(persistTimer)
    persistTimer = setTimeout(() => {
      persistTimer = null
      doPersist(pacienteId, set, get)
    }, 400)
  },
}))
