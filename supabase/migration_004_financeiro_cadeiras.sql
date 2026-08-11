-- =============================================
-- MIGRATION 004: Sublocação de salas/cadeiras
-- Rode no SQL Editor do Supabase depois das migrations 002 e 003.
-- =============================================

CREATE TABLE IF NOT EXISTS financeiro_cadeiras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE NOT NULL,
    profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE NOT NULL,
    tipo_cobranca VARCHAR(20) NOT NULL DEFAULT 'fixo' CHECK (tipo_cobranca IN ('fixo', 'percentual')),
    valor_fixo_mensal NUMERIC(10,2),
    percentual_faturamento NUMERIC(5,2) CHECK (percentual_faturamento IS NULL OR (percentual_faturamento >= 0 AND percentual_faturamento <= 100)),
    competencia DATE NOT NULL,
    faturamento_base NUMERIC(10,2) DEFAULT 0.00,
    valor_calculado NUMERIC(10,2) NOT NULL CHECK (valor_calculado >= 0),
    status_pagamento VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status_pagamento IN ('pendente', 'pago', 'atrasado')),
    data_pagamento DATE,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (profissional_id, competencia)
);

CREATE INDEX IF NOT EXISTS idx_financeiro_cadeiras_clinica ON financeiro_cadeiras(clinica_id, competencia);
CREATE INDEX IF NOT EXISTS idx_financeiro_cadeiras_profissional ON financeiro_cadeiras(profissional_id);

ALTER TABLE financeiro_cadeiras ENABLE ROW LEVEL SECURITY;

-- Titular vê tudo da clínica; sublocatário só vê as próprias cobranças de aluguel.
CREATE POLICY "financeiro_cadeiras_isolation" ON financeiro_cadeiras
    FOR ALL
    USING (
      clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID)
      AND (
        current_profissional_role() IS DISTINCT FROM 'sublocatario'
        OR profissional_id = current_profissional_id()
      )
    );

CREATE POLICY "financeiro_cadeiras_insert" ON financeiro_cadeiras
    FOR INSERT
    WITH CHECK (clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID));
