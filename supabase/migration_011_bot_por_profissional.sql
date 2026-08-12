-- =============================================
-- MIGRATION 011: Bot por profissional (1 WhatsApp/Z-API por dentista)
-- Rode no SQL Editor do Supabase depois das migrations 002-010.
--
-- Hoje o bot é 1 por clínica (configuracoes_bot, UNIQUE clinica_id).
-- Os planos "Clínica" (4 perfis+bots) e "Clínica Plus" (8 perfis+bots)
-- prometem um bot/WhatsApp próprio por dentista. Esta migration adiciona
-- essa camada sem quebrar o bot único da clínica (usado no plano Individual):
-- o webhook do n8n primeiro tenta achar o slug em `profissionais`, e só
-- cai para `configuracoes_bot` se não achar (compatibilidade).
-- =============================================

ALTER TABLE profissionais
  ADD COLUMN IF NOT EXISTS bot_ativo BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS bot_webhook_slug VARCHAR(50),
  ADD COLUMN IF NOT EXISTS bot_whatsapp VARCHAR(20) DEFAULT '',
  ADD COLUMN IF NOT EXISTS bot_zapi_instance_id VARCHAR(50) DEFAULT '',
  ADD COLUMN IF NOT EXISTS bot_zapi_token VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS bot_zapi_client_token VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS bot_groq_key_slot SMALLINT DEFAULT 1 CHECK (bot_groq_key_slot BETWEEN 1 AND 3),
  ADD COLUMN IF NOT EXISTS bot_mensagem_boas_vindas TEXT DEFAULT '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_profissionais_bot_webhook_slug
  ON profissionais(bot_webhook_slug) WHERE bot_webhook_slug IS NOT NULL AND bot_webhook_slug != '';

-- Cada lead/conversa passa a poder ser atribuído a um dentista específico
-- (essencial em Clínica/Clínica Plus, onde cada sublocatário só deve ver
-- os próprios leads — mesma lógica de isolamento já usada para pacientes).
ALTER TABLE pacientes_potenciais
  ADD COLUMN IF NOT EXISTS profissional_id UUID REFERENCES profissionais(id) ON DELETE SET NULL;

ALTER TABLE conversas_bot
  ADD COLUMN IF NOT EXISTS profissional_id UUID REFERENCES profissionais(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pacientes_potenciais_profissional ON pacientes_potenciais(profissional_id);
CREATE INDEX IF NOT EXISTS idx_conversas_bot_profissional ON conversas_bot(profissional_id);

-- =============================================
-- RLS: isolamento de leads/conversas por sublocatário
-- Reaproveita a função sublocatario_paciente_ids()-style já usada em
-- migration_003, mas aqui comparando profissional_id diretamente.
-- =============================================

ALTER TABLE pacientes_potenciais ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversas_bot ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pacientes_potenciais_sublocatario_isolation ON pacientes_potenciais;
CREATE POLICY pacientes_potenciais_sublocatario_isolation ON pacientes_potenciais
  FOR ALL
  USING (
    current_profissional_role() IS DISTINCT FROM 'sublocatario'
    OR profissional_id = current_profissional_id()
    OR profissional_id IS NULL
  );

DROP POLICY IF EXISTS conversas_bot_sublocatario_isolation ON conversas_bot;
CREATE POLICY conversas_bot_sublocatario_isolation ON conversas_bot
  FOR ALL
  USING (
    current_profissional_role() IS DISTINCT FROM 'sublocatario'
    OR profissional_id = current_profissional_id()
    OR profissional_id IS NULL
  );

COMMENT ON COLUMN profissionais.bot_webhook_slug IS 'Slug único usado em /api/bot/n8n/{slug} para o bot pessoal deste profissional (planos Clínica/Clínica Plus)';
COMMENT ON COLUMN profissionais.bot_groq_key_slot IS 'Qual das chaves Groq cadastradas no n8n (Groq Key 1/2/3) este bot usa — evita todos os dentistas de uma clínica baterem no mesmo rate limit';
