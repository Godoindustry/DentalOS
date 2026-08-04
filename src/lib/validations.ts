import { z } from "zod"

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
  cro: z.string().trim().min(1, "CRO é obrigatório"),
  uf_cro: z.string().trim().length(2, "UF do CRO deve ter 2 letras"),
  especialidade: z.string().trim().optional().nullable(),
  comissao: z.coerce.number().min(0, "Comissão não pode ser negativa").max(100, "Comissão não pode passar de 100%"),
})

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
