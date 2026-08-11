-- =============================================
-- MIGRATION 006: Google Calendar por profissional/cadeira
-- Rode no SQL Editor do Supabase depois das migrations 002-005.
--
-- Cada profissional (ex: sublocatário) pode ter seu próprio calendário
-- Google. Se estiver vazio, o sistema usa o calendário padrão da clínica
-- (configuracoes_bot.google_calendar_id).
-- =============================================

ALTER TABLE profissionais
  ADD COLUMN IF NOT EXISTS google_calendar_id VARCHAR(255);
