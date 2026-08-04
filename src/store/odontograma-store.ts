import { create } from "zustand"
import type { DenteData, FaceId, FaceStatus, DenticaoMode, AnotacaoClinical } from "@/components/odontograma/types"
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

  // Modo de dentição
  denticaoMode: DenticaoMode

  // Histórico (undo/redo)
  historico: OdontogramaSnapshot[]
  historicoFuturo: OdontogramaSnapshot[]

  // Anotações clínicas por dente
  anotacoes: Record<number, AnotacaoClinical[]>

  // Status de salvamento
  saving: boolean
  loaded: boolean
  pacienteIdAtual: string | null

  // ── Actions ──────────────────────────────────────────────────────────────────
  initFromDb: (db: DentesDB) => void
  setPacienteIdAtual: (id: string) => void
  setSelectedFace: (sel: SeletorFace | null) => void
  setSelectedTooth: (numero: number | null) => void
  setActiveProcedure: (p: FaceStatus | null) => void
  setDenticaoMode: (mode: DenticaoMode) => void
  applyProcedure: (numero: number, face: FaceId, procedimento: FaceStatus) => void
  toggleImplante: (numero: number) => void
  toggleExtracao: (numero: number) => void
  undo: () => void
  redo: () => void
  addAnotacao: (numero: number, texto: string) => void
  removeAnotacao: (numero: number, id: string) => void
  setSaving: (v: boolean) => void
  getDente: (numero: number) => DenteData | undefined
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
  arcadaSup: SUPERIORES.map(criarDente),
  arcadaInf: INFERIORES.map(criarDente),
  selectedFace: null,
  selectedTooth: null,
  activeProcedure: null,
  denticaoMode: "adulto",
  historico: [],
  historicoFuturo: [],
  anotacoes: {},
  saving: false,
  loaded: false,
  pacienteIdAtual: null,

  // ── Inicialização ──────────────────────────────────────────────────────────

  setPacienteIdAtual: (id) => set({ pacienteIdAtual: id }),

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

  addAnotacao: (numero, texto) => {
    if (!texto.trim()) return
    const nova: AnotacaoClinical = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      toothNumber: numero,
      texto: texto.trim(),
      criadoEm: new Date().toISOString(),
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

  schedulePersist: (pacienteId) => {
    if (persistTimer) clearTimeout(persistTimer)
    persistTimer = setTimeout(() => {
      persistTimer = null
      doPersist(pacienteId, set, get)
    }, 400)
  },
}))
