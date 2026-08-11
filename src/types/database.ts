import type { FaceId, FaceStatus } from "@/components/odontograma/types"

export interface Clinica {
  id: string
  nome_fantasia: string
  razao_social: string | null
  cnpj: string | null
  plano_assinatura: "basic" | "pro" | "premium"
  created_at: string
}

export interface Profissional {
  id: string
  clinica_id: string
  user_id: string | null
  nome: string
  cro: string
  uf_cro: string
  especialidade_principal: string | null
  porcentagem_comissao: number
  role: "titular" | "sublocatario"
  google_calendar_id: string | null
  ativo: boolean
  created_at: string
}

export interface Paciente {
  id: string
  clinica_id: string
  nome: string
  cpf: string | null
  data_nascimento: string
  sexo: string | null
  telefone_whatsapp: string
  email: string | null
  cep: string | null
  logradouro: string | null
  numero: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
  responsavel_legal: string | null
  observacoes_criticas: string | null
  created_at: string
}

export interface Procedimento {
  id: string
  clinica_id: string
  nome_servico: string
  categoria: string
  codigo_tuss: string | null
  preco_venda: number
  custo_insumos_direto: number
  custo_laboratorio: number
  tempo_estimado_minutos: number
  created_at: string
}

export interface Agendamento {
  id: string
  clinica_id: string
  paciente_id: string
  profissional_id: string
  data_hora_inicio: string
  data_hora_fim: string
  status: "agendado" | "confirmado_wpp" | "cancelado" | "em_atendimento" | "finalizado"
  canal_origem: "painel" | "bot_whatsapp" | "bot_telegram" | "link_externo"
  chat_id: string | null
  created_at: string
}

export interface Anamnese {
  id: string
  paciente_id: string
  profissional_id: string
  questionario_respondido: Record<string, unknown>
  assinatura_digital_hash: string
  finalizado_em: string
}

export interface Faturamento {
  id: string
  clinica_id: string
  paciente_id: string
  procedimento_id: string
  profissional_executor_id: string
  agendamento_id: string | null
  valor_bruto_pago: number
  desconto_aplicado: number
  comissao_retida_dentista: number
  lucro_liquido_clinica: number
  data_competencia: string
  forma_pagamento: "dinheiro" | "pix" | "credito_a_vista" | "parcelado" | "debito"
  status_pagamento: "pago" | "pendente" | "estornado"
  created_at: string
}

export interface Odontograma {
  id: string
  clinica_id: string
  paciente_id: string
  dentes: Record<string, {
    ausente: boolean
    implante: boolean
    coroa: boolean
    extracao?: boolean
    faces: Partial<Record<FaceId, FaceStatus>>
  }>
  created_at: string
  updated_at: string
}

export interface PacientePotencial {
  id: string
  clinica_id: string
  chat_id: string | null
  canal: string | null
  sender_id: string | null
  nome: string | null
  data_nascimento: string | null
  telefone: string | null
  idade: number | null
  anamnese: Record<string, unknown>
  status: PacientePotencialStatus
  etapa_atual: string | null
  urgencia: string | null
  queixa_principal: string | null
  regiao_dente: string | null
  contexto_json: Record<string, unknown>
  total_conversas: number
  ultima_mensagem: string | null
  ultima_interacao: string | null
  created_at: string
}

export type PacientePotencialStatus =
  | "novo_lead"
  | "lead_em_conversa"
  | "lead_agendamento"
  | "atendimento_humano"
  | "em_triagem"
  | "agendou"
  | "convertido"
  | "desistiu"
  | "inativo"

export interface BotSession {
  id: string
  clinica_id: string
  channel_session_id: string
  platform: string
  chat_id: string
  stage: string
  patient_id: string | null
  data: Record<string, unknown>
  last_user_message: string | null
  last_bot_message: string | null
  created_at: string
  updated_at: string
}

export interface ConfiguracaoBot {
  id: string
  clinica_id: string
  nome_clinica: string
  endereco: string | null
  cidade: string | null
  horario_funcionamento: string | null
  telefone: string | null
  whatsapp: string | null
  google_calendar_id: string | null
  google_refresh_token: string | null
  google_access_token: string | null
  mensagem_boas_vindas: string | null
  mensagem_urgencia: string | null
  transferencia_humano: string | null
  ia_model: string | null
  ia_temperature: number
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface BotMensagemProcessada {
  id: string
  idempotency_key: string
  canal: string | null
  sender_id: string | null
  message_id: string | null
  clinic_id: string | null
  created_at: string
}

export interface ConversaBot {
  id: string
  clinic_id: string
  paciente_potencial_id: string | null
  canal: string
  sender_id: string
  mensagem_usuario: string
  resposta_bot: string | null
  intencao: string | null
  urgencia: string | null
  etapa: string | null
  raw_json: Record<string, unknown>
  created_at: string
}

export type AgendamentoStatus = Agendamento["status"]
export type FormaPagamento = Faturamento["forma_pagamento"]
export type PlanoAssinatura = Clinica["plano_assinatura"]
