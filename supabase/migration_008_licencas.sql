-- Migration: Criar tabela de licencas
-- Data: 2025-01-15

CREATE TABLE IF NOT EXISTS licencas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  plano TEXT DEFAULT 'premium',
  periodo_dias INTEGER DEFAULT 14,
  usada BOOLEAN DEFAULT FALSE,
  usada_em TIMESTAMPTZ,
  usada_por UUID REFERENCES auth.users(id),
  clinica_id UUID REFERENCES clinicas(id),
  criada_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_licencas_codigo ON licencas(codigo);
CREATE INDEX IF NOT EXISTS idx_licencas_usada ON licencas(usada);
CREATE INDEX IF NOT EXISTS idx_licencas_clinica ON licencas(clinica_id);

COMMENT ON TABLE licencas IS 'Chaves de licenca para ativacao de planos';
COMMENT ON COLUMN licencas.codigo IS 'Codigo unico da licenca';
COMMENT ON COLUMN licencas.plano IS 'Plano associado a licenca';
COMMENT ON COLUMN licencas.periodo_dias IS 'Periodo de validade em dias';
COMMENT ON COLUMN licencas.usada IS 'Indica se a licenca ja foi ativada';
COMMENT ON COLUMN licencas.usada_em IS 'Data e hora da ativacao';
COMMENT ON COLUMN licencas.usada_por IS 'Usuario que ativou a licenca';
COMMENT ON COLUMN licencas.clinica_id IS 'Clinica associada a licenca';
COMMENT ON COLUMN licencas.criada_em IS 'Data de criacao da licenca';
