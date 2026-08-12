-- =============================================
-- MIGRATION 010: Assinaturas recorrentes (Mercado Pago)
-- Rode no SQL Editor do Supabase depois das migrations anteriores.
-- =============================================

CREATE TABLE IF NOT EXISTS assinaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE NOT NULL,
  plano TEXT NOT NULL CHECK (plano IN ('individual', 'clinica', 'clinica_plus')),
  mp_preapproval_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'authorized', 'paused', 'cancelled')),
  valor NUMERIC(10,2) NOT NULL,
  payer_email TEXT,
  proxima_cobranca TIMESTAMPTZ,
  criada_em TIMESTAMPTZ DEFAULT NOW(),
  atualizada_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assinaturas_clinica ON assinaturas(clinica_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_preapproval ON assinaturas(mp_preapproval_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON assinaturas(status);

COMMENT ON TABLE assinaturas IS 'Assinaturas recorrentes pagas via Mercado Pago (Preapproval API)';
COMMENT ON COLUMN assinaturas.mp_preapproval_id IS 'ID da assinatura no Mercado Pago (preapproval_id)';
COMMENT ON COLUMN assinaturas.status IS 'pending=aguardando 1a cobranca, authorized=ativa e cobrando, paused/cancelled=sem acesso';
