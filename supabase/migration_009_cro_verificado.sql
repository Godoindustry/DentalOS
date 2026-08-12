-- =============================================
-- MIGRATION 009: Verificação manual de CRO
-- Rode no SQL Editor do Supabase depois das migrations anteriores.
--
-- Não existe API pública gratuita do CFO para validar CRO em tempo
-- real (a consulta virou responsabilidade de cada conselho estadual,
-- sem API oficial disponível). Por isso, além da validação de formato
-- já feita no cadastro, adicionamos aqui um registro de conferência
-- manual: a recepção confere o CRO no site do CFO e marca como
-- verificado.
-- =============================================

ALTER TABLE profissionais
  ADD COLUMN IF NOT EXISTS cro_verificado BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cro_verificado_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cro_verificado_por UUID REFERENCES auth.users(id);
