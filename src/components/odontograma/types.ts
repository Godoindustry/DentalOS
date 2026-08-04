// ─── Faces ────────────────────────────────────────────────────────────────────

export type FaceId =
  | "oclusal"
  | "mesial"
  | "distal"
  | "vestibular"
  | "lingual"
  | "palatina"

// ─── Status de face ──────────────────────────────────────────────────────────

export type FaceStatus =
  | "saudavel"
  | "cariado"
  | "restaurado"
  | "planejado"
  | "ausente"
  | "proteses"
  | "canal"
  | "faceta"
  | "fratura"
  | "profilaxia"
  | "observacao"

// ─── Tipo anatômico ───────────────────────────────────────────────────────────

export type ToothType = "incisor" | "canine" | "premolar" | "molar"

// ─── Modo de dentição ──────────────────────────────────────────────────────────

export type DenticaoMode = "adulto" | "infantil" | "mista"

// ─── Anotação Clínica ─────────────────────────────────────────────────────────

export interface AnotacaoClinical {
  id: string
  toothNumber: number
  texto: string
  criadoEm: string // ISO date string
}

// ─── Estrutura de dados do dente ─────────────────────────────────────────────

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
  deciduo: boolean           // true = dente de leite
  faces: FaceDente[]
}

// ─── Mapeamento de tipo por número FDI ───────────────────────────────────────

export function getToothType(numero: number): ToothType {
  const d = numero % 10
  if (d === 1 || d === 2) return "incisor"
  if (d === 3) return "canine"
  if (d === 4 || d === 5) return "premolar"
  return "molar"
}

// ─── Configuração visual de status ───────────────────────────────────────────

export const FACE_CONFIG: Record<
  string,
  { label: string; cor: string; brilho: string; border: string }
> = {
  saudavel:   { label: "Saudável",    cor: "rgba(255,255,255,0.88)", brilho: "rgba(255,255,255,0.4)",   border: "rgba(255,255,255,0.15)" },
  cariado:    { label: "Cárie",       cor: "#EF4444",                 brilho: "rgba(239,68,68,0.35)",   border: "#EF4444" },
  restaurado: { label: "Restauração", cor: "#10B981",                 brilho: "rgba(16,185,129,0.35)",  border: "#10B981" },
  planejado:  { label: "Planejado",   cor: "#F59E0B",                 brilho: "rgba(245,158,11,0.35)",  border: "#F59E0B" },
  ausente:    { label: "Ausente",     cor: "rgba(255,255,255,0.08)",  brilho: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.05)" },
  proteses:   { label: "Prótese",     cor: "#F59E0B",                 brilho: "rgba(245,158,11,0.35)",  border: "#F59E0B" },
  canal:      { label: "Canal",       cor: "#8B5CF6",                 brilho: "rgba(139,92,246,0.35)",  border: "#8B5CF6" },
  faceta:     { label: "Faceta",      cor: "#EC4899",                 brilho: "rgba(236,72,153,0.35)",  border: "#EC4899" },
  fratura:    { label: "Fratura",     cor: "#F97316",                 brilho: "rgba(249,115,22,0.35)",  border: "#F97316" },
  profilaxia: { label: "Profilaxia",  cor: "#3B82F6",                 brilho: "rgba(59,130,246,0.35)",  border: "#3B82F6" },
  observacao: { label: "Observação",  cor: "#6B7280",                 brilho: "rgba(107,114,128,0.35)", border: "#6B7280" },
}

// ─── Legenda ─────────────────────────────────────────────────────────────────

export const LEGEND_ITENS: {
  chave: string
  label: string
  cor: string
  opacidade?: number
}[] = [
  { chave: "saudavel",   label: "Saudável",    cor: "rgba(255,255,255,0.88)" },
  { chave: "cariado",    label: "Cárie",       cor: "#EF4444" },
  { chave: "restaurado", label: "Restauração", cor: "#10B981" },
  { chave: "ausente",    label: "Ausente",     cor: "rgba(255,255,255,0.08)", opacidade: 0.2 },
  { chave: "planejado",  label: "Planejado",   cor: "#F59E0B" },
  { chave: "proteses",   label: "Prótese",     cor: "#F59E0B" },
  { chave: "canal",      label: "Canal",       cor: "#8B5CF6" },
  { chave: "faceta",     label: "Faceta",      cor: "#EC4899" },
  { chave: "fratura",    label: "Fratura",     cor: "#F97316" },
  { chave: "profilaxia", label: "Profilaxia",  cor: "#3B82F6" },
  { chave: "observacao", label: "Observação",  cor: "#6B7280" },
  { chave: "implante",   label: "Implante",    cor: "#06B6D4" },
  { chave: "extracao",   label: "Extração",    cor: "#8B5CF6" },
]

// ─── Labels de face ───────────────────────────────────────────────────────────

export const FACE_LABELS: Record<FaceId, string> = {
  oclusal:    "Oclusal",
  mesial:     "Mésial",
  distal:     "Distal",
  vestibular: "Vestibular",
  lingual:    "Lingual",
  palatina:   "Palatina",
}

// ─── Procedimentos (toolbar/painel) ──────────────────────────────────────────

export interface ProcedimentoItem {
  chave: FaceStatus | "implante" | "extracao"
  label: string
  cor: string
  icone: string
  categoria: "patologia" | "tratamento" | "protese" | "especial"
}

export const PROCEDIMENTOS: ProcedimentoItem[] = [
  // Patologia (vermelho)
  { chave: "cariado",    label: "Cárie",       cor: "#EF4444", icone: "triangle",  categoria: "patologia" },
  { chave: "fratura",    label: "Fratura",     cor: "#F97316", icone: "break",     categoria: "patologia" },
  { chave: "observacao", label: "Observação",  cor: "#6B7280", icone: "eye",       categoria: "patologia" },
  // Tratamento (azul/verde)
  { chave: "restaurado", label: "Restauração", cor: "#10B981", icone: "fill",      categoria: "tratamento" },
  { chave: "canal",      label: "Canal",       cor: "#8B5CF6", icone: "root",      categoria: "tratamento" },
  { chave: "profilaxia", label: "Profilaxia",  cor: "#3B82F6", icone: "sparkle",   categoria: "tratamento" },
  // Prótese (amarelo)
  { chave: "proteses",   label: "Coroa",       cor: "#F59E0B", icone: "crown",     categoria: "protese" },
  { chave: "faceta",     label: "Faceta",      cor: "#EC4899", icone: "layer",     categoria: "protese" },
  { chave: "planejado",  label: "Planejado",   cor: "#F59E0B", icone: "clock",     categoria: "protese" },
  // Especial (cinza/ciano)
  { chave: "implante",   label: "Implante",    cor: "#06B6D4", icone: "implant",   categoria: "especial" },
  { chave: "extracao",   label: "Extração",    cor: "#FF6B6B", icone: "extract",   categoria: "especial" },
]

export const STATUS_ORDER: FaceStatus[] = [
  "saudavel", "cariado", "restaurado", "canal", "faceta",
  "fratura", "profilaxia", "observacao", "proteses", "planejado", "ausente",
]

// ─── Normalizador legado ──────────────────────────────────────────────────────

const STATUS_LEGACY: Record<string, FaceStatus> = {
  carie: "cariado",
}

export function normalizarStatus(s: string): FaceStatus {
  const key = s as keyof typeof STATUS_LEGACY
  if (STATUS_LEGACY[key]) return STATUS_LEGACY[key]
  if ([
    "saudavel", "cariado", "restaurado", "planejado", "ausente",
    "proteses", "canal", "faceta", "fratura", "profilaxia", "observacao",
  ].includes(s))
    return s as FaceStatus
  return "saudavel"
}

// ─── Nomes dos dentes (FDI) ──────────────────────────────────────────────────

const NOMES_DENTES: Record<number, string> = {
  // Adultos — quadrante 1 (superior direito)
  11: "Incisivo Central Superior Direito",   12: "Incisivo Lateral Superior Direito",
  13: "Canino Superior Direito",             14: "1º Pré-Molar Superior Direito",
  15: "2º Pré-Molar Superior Direito",       16: "1º Molar Superior Direito",
  17: "2º Molar Superior Direito",           18: "3º Molar Superior Direito",
  // Adultos — quadrante 2 (superior esquerdo)
  21: "Incisivo Central Superior Esquerdo",  22: "Incisivo Lateral Superior Esquerdo",
  23: "Canino Superior Esquerdo",            24: "1º Pré-Molar Superior Esquerdo",
  25: "2º Pré-Molar Superior Esquerdo",      26: "1º Molar Superior Esquerdo",
  27: "2º Molar Superior Esquerdo",          28: "3º Molar Superior Esquerdo",
  // Adultos — quadrante 3 (inferior esquerdo)
  31: "Incisivo Central Inferior Esquerdo",  32: "Incisivo Lateral Inferior Esquerdo",
  33: "Canino Inferior Esquerdo",            34: "1º Pré-Molar Inferior Esquerdo",
  35: "2º Pré-Molar Inferior Esquerdo",      36: "1º Molar Inferior Esquerdo",
  37: "2º Molar Inferior Esquerdo",          38: "3º Molar Inferior Esquerdo",
  // Adultos — quadrante 4 (inferior direito)
  41: "Incisivo Central Inferior Direito",   42: "Incisivo Lateral Inferior Direito",
  43: "Canino Inferior Direito",             44: "1º Pré-Molar Inferior Direito",
  45: "2º Pré-Molar Inferior Direito",       46: "1º Molar Inferior Direito",
  47: "2º Molar Inferior Direito",           48: "3º Molar Inferior Direito",
  // Decíduos — quadrante 5 (superior direito)
  51: "Incisivo Central Decíduo Superior Direito",  52: "Incisivo Lateral Decíduo Superior Direito",
  53: "Canino Decíduo Superior Direito",            54: "1º Molar Decíduo Superior Direito",
  55: "2º Molar Decíduo Superior Direito",
  // Decíduos — quadrante 6 (superior esquerdo)
  61: "Incisivo Central Decíduo Superior Esquerdo", 62: "Incisivo Lateral Decíduo Superior Esquerdo",
  63: "Canino Decíduo Superior Esquerdo",           64: "1º Molar Decíduo Superior Esquerdo",
  65: "2º Molar Decíduo Superior Esquerdo",
  // Decíduos — quadrante 7 (inferior esquerdo)
  71: "Incisivo Central Decíduo Inferior Esquerdo", 72: "Incisivo Lateral Decíduo Inferior Esquerdo",
  73: "Canino Decíduo Inferior Esquerdo",           74: "1º Molar Decíduo Inferior Esquerdo",
  75: "2º Molar Decíduo Inferior Esquerdo",
  // Decíduos — quadrante 8 (inferior direito)
  81: "Incisivo Central Decíduo Inferior Direito",  82: "Incisivo Lateral Decíduo Inferior Direito",
  83: "Canino Decíduo Inferior Direito",            84: "1º Molar Decíduo Inferior Direito",
  85: "2º Molar Decíduo Inferior Direito",
}

// ─── Sequências de dentes por arcada / modo ──────────────────────────────────

/** Adulto: 32 dentes, ordenados da esquerda para direita na view */
export const SUPERIORES = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
export const INFERIORES = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

/** Infantil: 20 dentes decíduos */
export const DECIDUOS_SUP = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65]
export const DECIDUOS_INF = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75]

/** Mista: molares permanentes + caninos e incisivos decíduos centrais + pré-molares */
export const MISTA_SUP = [18, 17, 16, 55, 54, 53, 52, 51, 61, 62, 63, 64, 65, 26, 27, 28]
export const MISTA_INF = [48, 47, 46, 85, 84, 83, 82, 81, 71, 72, 73, 74, 75, 36, 37, 38]

// ─── Factory de dente ─────────────────────────────────────────────────────────

export function criarDente(numero: number): DenteData {
  const deciduo = numero >= 51 && numero <= 85
  return {
    numero,
    nome: NOMES_DENTES[numero] || `Dente ${numero}`,
    ausente: false,
    implante: false,
    coroa: false,
    extracao: false,
    deciduo,
    faces: [
      { id: "oclusal",    status: "saudavel" },
      { id: "mesial",     status: "saudavel" },
      { id: "distal",     status: "saudavel" },
      { id: "vestibular", status: "saudavel" },
      { id: "lingual",    status: "saudavel" },
      { id: "palatina",   status: "saudavel" },
    ],
  }
}

// ─── Helpers de serialização (Supabase) ──────────────────────────────────────

type DentesDB = Record<
  string,
  {
    ausente: boolean
    implante: boolean
    coroa: boolean
    extracao?: boolean
    faces: Record<string, string>
  }
>

export function dentesParaDB(sup: DenteData[], inf: DenteData[]): DentesDB {
  const db: DentesDB = {}
  for (const d of [...sup, ...inf]) {
    db[String(d.numero)] = {
      ausente:  d.ausente,
      implante: d.implante,
      coroa:    d.coroa || d.faces.some((f) => f.status === "proteses"),
      extracao: d.extracao,
      faces:    Object.fromEntries(d.faces.map((f) => [f.id, f.status])),
    }
  }
  return db
}

export function dbParaDentes(db: DentesDB): { sup: DenteData[]; inf: DenteData[] } {
  const parseDente = (n: number) => {
    const saved = db[String(n)]
    const d = criarDente(n)
    if (saved) {
      d.ausente  = saved.ausente
      d.implante = saved.implante
      d.coroa    = saved.coroa
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
