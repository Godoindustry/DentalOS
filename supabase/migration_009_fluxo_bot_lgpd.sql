-- Migration: Melhorias do fluxo do bot, urgência, LGPD e exportação
-- Data: 2025-01-16

-- 1. Adicionar coluna de telefone de urgência no profissional
ALTER TABLE profissionais
  ADD COLUMN IF NOT EXISTS telefone_urgencia VARCHAR(20) DEFAULT '';

-- 2. Adicionar coluna de LGPD em pacientes_potenciais
ALTER TABLE pacientes_potenciais
  ADD COLUMN IF NOT EXISTS lgpd_consentimento BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS lgpd_consentimento_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lgpd_termos_hash TEXT;

-- 3. Adicionar coluna de origem em pacientes
ALTER TABLE pacientes
  ADD COLUMN IF NOT EXISTS origem VARCHAR(50) DEFAULT 'painel' CHECK (origem IN ('painel','bot_whatsapp','bot_telegram','link_externo','manual'));

-- 4. Tabela de consentimentos LGPD
CREATE TABLE IF NOT EXISTS lgpd_consentimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE NOT NULL,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    paciente_potencial_id UUID REFERENCES pacientes_potenciais(id) ON DELETE SET NULL,
    tipo_consentimento VARCHAR(50) NOT NULL,
    versao_termo TEXT NOT NULL,
    consentido BOOLEAN NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    data_consentimento TIMESTAMPTZ DEFAULT NOW(),
    data_retirada TIMESTAMPTZ
);

-- 5. Tabela de solicitações de exclusão LGPD (direito ao esquecimento)
CREATE TABLE IF NOT EXISTS lgpd_solicitacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE NOT NULL,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('exclusao','exportacao','atualizacao')),
    motivo TEXT,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente','processando','concluido','rejeitado')),
    processado_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de log de acesso a dados (auditoria LGPD)
CREATE TABLE IF NOT EXISTS lgpd_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE NOT NULL,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acao VARCHAR(100) NOT NULL,
    tabela_afetada VARCHAR(100),
    registro_id UUID,
    dados_antigos JSONB,
    dados_novos JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_profissionais_urgencia ON profissionais(clinica_id, telefone_urgencia) WHERE telefone_urgencia != '';
CREATE INDEX IF NOT EXISTS idx_lgpd_consentimentos_clinica ON lgpd_consentimentos(clinica_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_consentimentos_paciente ON lgpd_consentimentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_solicitacoes_clinica ON lgpd_solicitacoes(clinica_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_auditoria_clinica ON lgpd_auditoria(clinica_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_auditoria_usuario ON lgpd_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_auditoria_data ON lgpd_auditoria(created_at DESC);

-- Comentários
COMMENT ON COLUMN profissionais.telefone_urgencia IS 'Telefone para contato de urgência do profissional';
COMMENT ON TABLE lgpd_consentimentos IS 'Registro de consentimentos LGPD dos pacientes';
COMMENT ON TABLE lgpd_solicitacoes IS 'Solicitações de exclusão/exportação de dados (direito ao esquecimento)';
COMMENT ON TABLE lgpd_auditoria IS 'Log de auditoria de acesso a dados sensíveis (LGPD)';
