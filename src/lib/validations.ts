import { z } from "zod"

export const UFS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const

export const pacienteSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres"),
  cpf: z.string().trim().optional().nullable(),
  data_nascimento: z.string().trim().min(1, "Data de nascimento é obrigatória"),
  sexo: z.string().trim().optional().nullable(),
  telefone: z.string().trim().min(8, "Telefone/WhatsApp inválido"),
  email: z.string().trim().email("E-mail inválido").optional().nullable().or(z.literal("")),
  cep: z.string().trim().optional().nullable(),
  logradouro: z.string().trim().optional().nullable(),
  numero: z.string().trim().optional().nullable(),
  bairro: z.string().trim().optional().nullable(),
  cidade: z.string().trim().optional().nullable(),
  uf: z.string().trim().optional().nullable(),
  responsavel: z.string().trim().optional().nullable(),
  observacoes: z.string().trim().optional().nullable(),
})

export const profissionalSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres"),
  cro: z.string().trim().regex(/^\d{3,6}$/, "CRO deve conter de 3 a 6 dígitos numéricos"),
  uf_cro: z.enum(UFS_BRASIL, { message: "UF do CRO inválida" }),
  especialidade: z.string().trim().optional().nullable(),
  comissao: z.coerce.number().min(0, "Comissão não pode ser negativa").max(100, "Comissão não pode passar de 100%"),
  role: z.enum(["titular", "sublocatario"]).default("sublocatario"),
  email: z.string().trim().email("E-mail inválido").optional().nullable().or(z.literal("")),
  senha: z.string().trim().min(6, "Senha deve ter ao menos 6 caracteres").optional().nullable().or(z.literal("")),
}).refine(
  (data) => data.role !== "sublocatario" || !data.email || (data.email && data.senha),
  { message: "Informe uma senha para criar o login do sublocatário", path: ["senha"] }
)

export const procedimentoSchema = z.object({
  nome_servico: z.string().trim().min(2, "Nome do serviço deve ter ao menos 2 caracteres"),
  categoria: z.string().trim().min(1, "Categoria é obrigatória"),
  codigo_tuss: z.string().trim().optional().nullable(),
  preco_venda: z.coerce.number().min(0, "Preço de venda não pode ser negativo"),
  custo_insumos: z.coerce.number().min(0, "Custo de insumos não pode ser negativo"),
  custo_laboratorio: z.coerce.number().min(0, "Custo de laboratório não pode ser negativo"),
  tempo_estimado: z.coerce.number().int().min(1, "Tempo estimado deve ser de ao menos 1 minuto"),
})

/** Extrai o primeiro erro de validação de um resultado safeParse do Zod. */
export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos"
}
