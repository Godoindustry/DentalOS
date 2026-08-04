export type FaceId = "oclusal" | "mesial" | "distal" | "vestibular" | "lingual" | "palatina"

export type FaceStatus =
  | "saudavel" | "cariado" | "restaurado" | "planejado"
  | "ausente" | "proteses"
  | "canal" | "faceta" | "fratura" | "profilaxia" | "observacao"

export type ToothType = "incisor" | "canine" | "premolar" | "molar"

export interface FaceDente {
  id: FaceId
  status: FaceStatus
  observacoes?: string
}

export interface DenteData {
  numero: number
  nome: string
  ausente: boolean
  implante: boolean
  coroa: boolean
  extracao: boolean
  faces: FaceDente[]
}

export function getToothType(numero: number): ToothType {
  const d = numero % 10
  if (d === 1 || d === 2) return "incisor"
  if (d === 3) return "canine"
  if (d === 4 || d === 5) return "premolar"
  return "molar"
}

export const FACE_CONFIG: Record<string, { label: string; cor: string; brilho: string; border: string }> = {
  saudavel:  { label: "Saudável",   cor: "rgba(255,255,255,0.88)", brilho: "rgba(255,255,255,0.4)",  border: "rgba(255,255,255,0.15)" },
  cariado:   { label: "Cárie",      cor: "#EF4444",                brilho: "rgba(239,68,68,0.35)",  border: "#EF4444" },
  restaurado:{ label: "Restauração", cor: "#10B981",               brilho: "rgba(16,185,129,0.35)", border: "#10B981" },
  planejado: { label: "Planejado",  cor: "#F59E0B",                brilho: "rgba(245,158,11,0.35)", border: "#F59E0B" },
  ausente:   { label: "Ausente",    cor: "rgba(255,255,255,0.08)", brilho: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.05)" },
  proteses:  { label: "Prótese",    cor: "#F59E0B",                brilho: "rgba(245,158,11,0.35)", border: "#F59E0B" },
  canal:     { label: "Canal",      cor: "#8B5CF6",                brilho: "rgba(139,92,246,0.35)", border: "#8B5CF6" },
  faceta:    { label: "Faceta",     cor: "#EC4899",                brilho: "rgba(236,72,153,0.35)", border: "#EC4899" },
  fratura:   { label: "Fratura",    cor: "#F97316",                brilho: "rgba(249,115,22,0.35)", border: "#F97316" },
  profilaxia:{ label: "Profilaxia", cor: "#3B82F6",                brilho: "rgba(59,130,246,0.35)", border: "#3B82F6" },
  observacao:{ label: "Observação", cor: "#6B7280",                brilho: "rgba(107,114,128,0.35)",border: "#6B7280" },
}

export const LEGEND_ITENS: { chave: string; label: string; cor: string; opacidade?: number }[] = [
  { chave: "saudavel",  label: "Saudável",   cor: "rgba(255,255,255,0.88)" },
  { chave: "cariado",   label: "Cárie",      cor: "#EF4444" },
  { chave: "restaurado",label: "Restauração", cor: "#10B981" },
  { chave: "ausente",   label: "Ausente",    cor: "rgba(255,255,255,0.08)", opacidade: 0.2 },
  { chave: "planejado", label: "Planejado",  cor: "#F59E0B" },
  { chave: "proteses",  label: "Prótese",    cor: "#F59E0B" },
  { chave: "canal",     label: "Canal",      cor: "#8B5CF6" },
  { chave: "faceta",    label: "Faceta",     cor: "#EC4899" },
  { chave: "fratura",   label: "Fratura",    cor: "#F97316" },
  { chave: "profilaxia",label: "Profilaxia", cor: "#3B82F6" },
  { chave: "observacao",label: "Observação", cor: "#6B7280" },
  { chave: "implante",  label: "Implante",   cor: "#06B6D4" },
  { chave: "extracao",  label: "Extração",   cor: "#8B5CF6" },
]

export const FACE_LABELS: Record<FaceId, string> = {
  oclusal: "Oclusal",
  mesial: "Mésial",
  distal: "Distal",
  vestibular: "Vestibular",
  lingual: "Lingual",
  palatina: "Palatina",
}

const STATUS_LEGACY: Record<string, FaceStatus> = {
  carie: "cariado",
}

export function normalizarStatus(s: string): FaceStatus {
  const key = s as keyof typeof STATUS_LEGACY
  if (STATUS_LEGACY[key]) return STATUS_LEGACY[key]
  if (["saudavel", "cariado", "restaurado", "planejado", "ausente", "proteses", "canal", "faceta", "fratura", "profilaxia", "observacao"].includes(s)) return s as FaceStatus
  return "saudavel"
}

export function criarDente(numero: number): DenteData {
  const nomes: Record<number, string> = {
    11: "Incisivo Central Superior Direito", 12: "Incisivo Lateral Superior Direito",
    13: "Canino Superior Direito", 14: "1º Pré-Molar Superior Direito",
    15: "2º Pré-Molar Superior Direito", 16: "1º Molar Superior Direito",
    17: "2º Molar Superior Direito", 18: "3º Molar Superior Direito",
    21: "Incisivo Central Superior Esquerdo", 22: "Incisivo Lateral Superior Esquerdo",
    23: "Canino Superior Esquerdo", 24: "1º Pré-Molar Superior Esquerdo",
    25: "2º Pré-Molar Superior Esquerdo", 26: "1º Molar Superior Esquerdo",
    27: "2º Molar Superior Esquerdo", 28: "3º Molar Superior Esquerdo",
    31: "Incisivo Central Inferior Esquerdo", 32: "Incisivo Lateral Inferior Esquerdo",
    33: "Canino Inferior Esquerdo", 34: "1º Pré-Molar Inferior Esquerdo",
    35: "2º Pré-Molar Inferior Esquerdo", 36: "1º Molar Inferior Esquerdo",
    37: "2º Molar Inferior Esquerdo", 38: "3º Molar Inferior Esquerdo",
    41: "Incisivo Central Inferior Direito", 42: "Incisivo Lateral Inferior Direito",
    43: "Canino Inferior Direito", 44: "1º Pré-Molar Inferior Direito",
    45: "2º Pré-Molar Inferior Direito", 46: "1º Molar Inferior Direito",
    47: "2º Molar Inferior Direito", 48: "3º Molar Inferior Direito",
  }

  return {
    numero,
    nome: nomes[numero] || `Dente ${numero}`,
    ausente: false,
    implante: false,
    coroa: false,
    extracao: false,
    faces: [
      { id: "oclusal", status: "saudavel" },
      { id: "mesial", status: "saudavel" },
      { id: "distal", status: "saudavel" },
      { id: "vestibular", status: "saudavel" },
      { id: "lingual", status: "saudavel" },
      { id: "palatina", status: "saudavel" },
    ],
  }
}

export const SUPERIORES = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
export const INFERIORES = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
export interface ProcedimentoItem {
  chave: FaceStatus | "implante" | "extracao"
  label: string
  cor: string
  icone: string
}

export const PROCEDIMENTOS: ProcedimentoItem[] = [
  { chave: "cariado",    label: "Cárie",       cor: "#EF4444", icone: "triangle" },
  { chave: "restaurado", label: "Restauração", cor: "#10B981", icone: "fill" },
  { chave: "canal",      label: "Canal",       cor: "#8B5CF6", icone: "root" },
  { chave: "proteses",   label: "Coroa",       cor: "#F59E0B", icone: "crown" },
  { chave: "implante",   label: "Implante",    cor: "#06B6D4", icone: "implant" },
  { chave: "extracao",   label: "Extração",    cor: "#FF6B6B", icone: "extract" },
  { chave: "faceta",     label: "Faceta",      cor: "#EC4899", icone: "layer" },
  { chave: "fratura",    label: "Fratura",     cor: "#F97316", icone: "break" },
  { chave: "profilaxia", label: "Profilaxia",  cor: "#3B82F6", icone: "sparkle" },
  { chave: "observacao", label: "Observação",  cor: "#6B7280", icone: "eye" },
]

export const STATUS_ORDER: FaceStatus[] = [
  "saudavel", "cariado", "restaurado", "canal", "faceta",
  "fratura", "profilaxia", "observacao", "proteses", "planejado", "ausente",
]

type DentesDB = Record<string, {
  ausente: boolean
  implante: boolean
  coroa: boolean
  extracao?: boolean
  faces: Record<string, string>
}>

export function dentesParaDB(sup: DenteData[], inf: DenteData[]): DentesDB {
  const db: DentesDB = {}
  for (const d of [...sup, ...inf]) {
    db[String(d.numero)] = {
      ausente: d.ausente,
      implante: d.implante,
      coroa: d.coroa || d.faces.some(f => f.status === "proteses"),
      extracao: d.extracao,
      faces: Object.fromEntries(d.faces.map(f => [f.id, f.status])),
    }
  }
  return db
}

export function dbParaDentes(db: DentesDB): { sup: DenteData[]; inf: DenteData[] } {
  const parseDente = (n: number) => {
    const saved = db[String(n)]
    const d = criarDente(n)
    if (saved) {
      d.ausente = saved.ausente
      d.implante = saved.implante
      d.coroa = saved.coroa
      d.extracao = saved.extracao ?? false
      for (const face of d.faces) {
        const savedStatus = saved.faces[face.id]
        if (savedStatus) face.status = normalizarStatus(savedStatus)
      }
    }
    return d
  }

  return {
    sup: SUPERIORES.map(parseDente),
    inf: INFERIORES.map(parseDente),
  }
}
