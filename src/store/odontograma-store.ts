import { create } from "zustand"
import type { DenteData, FaceId, FaceStatus } from "@/components/odontograma/types"
import {
  criarDente, SUPERIORES, INFERIORES, dentesParaDB,
} from "@/components/odontograma/types"
import { salvarOdontograma } from "@/app/(dashboard)/actions"
import type { Odontograma } from "@/types/database"

type DentesDB = Odontograma["dentes"]

interface SeletorFace {
  numero: number
  face: FaceId
}

interface OdontogramaStore {
  arcadaSup: DenteData[]
  arcadaInf: DenteData[]
  selectedFace: SeletorFace | null
  activeProcedure: FaceStatus | null
  saving: boolean
  loaded: boolean
  /** paciente atualmente aberto — usado pela cena 3D para saber onde persistir */
  pacienteIdAtual: string | null

  initFromDb: (db: DentesDB) => void
  setPacienteIdAtual: (id: string) => void
  setSelectedFace: (sel: SeletorFace | null) => void
  setActiveProcedure: (p: FaceStatus | null) => void
  applyProcedure: (numero: number, face: FaceId, procedimento: FaceStatus) => void
  toggleImplante: (numero: number) => void
  toggleExtracao: (numero: number) => void
  setSaving: (v: boolean) => void
  getDente: (numero: number) => DenteData | undefined
  schedulePersist: (pacienteId: string) => void
}

// Debounce module-level: evita disparar um write no Supabase a cada clique —
// agrupa cliques rápidos em um único save após o usuário parar de interagir.
let persistTimer: ReturnType<typeof setTimeout> | null = null

async function doPersist(pacienteId: string, set: (partial: Partial<OdontogramaStore>) => void, get: () => OdontogramaStore) {
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

export const useOdontogramaStore = create<OdontogramaStore>((set, get) => ({
  arcadaSup: SUPERIORES.map(criarDente),
  arcadaInf: INFERIORES.map(criarDente),
  selectedFace: null,
  activeProcedure: null,
  saving: false,
  loaded: false,
  pacienteIdAtual: null,

  setPacienteIdAtual: (id) => set({ pacienteIdAtual: id }),

  initFromDb: (db: DentesDB) => {
    const parseDente = (n: number) => {
      const saved = db[String(n)]
      const d = criarDente(n)
      if (saved) {
        d.ausente = saved.ausente ?? false
        d.implante = saved.implante ?? false
        d.coroa = saved.coroa ?? false
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
      loaded: true,
    })
  },

  setSelectedFace: (sel) => set({ selectedFace: sel }),

  setActiveProcedure: (p) => set({ activeProcedure: p }),

  applyProcedure: (numero, face, procedimento) => {
    const sup = [...get().arcadaSup]
    const inf = [...get().arcadaInf]
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

    set({ arcadaSup: sup, arcadaInf: inf })
  },

  toggleImplante: (numero) => {
    const sup = [...get().arcadaSup]
    const inf = [...get().arcadaInf]
    const dente = [...sup, ...inf].find((d) => d.numero === numero)
    if (!dente) return
    dente.implante = !dente.implante
    set({ arcadaSup: sup, arcadaInf: inf })
  },

  toggleExtracao: (numero) => {
    const sup = [...get().arcadaSup]
    const inf = [...get().arcadaInf]
    const dente = [...sup, ...inf].find((d) => d.numero === numero)
    if (!dente) return
    dente.extracao = !dente.extracao
    set({ arcadaSup: sup, arcadaInf: inf })
  },

  setSaving: (v) => set({ saving: v }),

  getDente: (numero) => {
    return [...get().arcadaSup, ...get().arcadaInf].find((d) => d.numero === numero)
  },

  schedulePersist: (pacienteId) => {
    if (persistTimer) clearTimeout(persistTimer)
    persistTimer = setTimeout(() => {
      persistTimer = null
      doPersist(pacienteId, set, get)
    }, 400)
  },
}))
