-- Adicionando campos para salvar tokens OAuth do Google Calendar
ALTER TABLE configuracoes_bot 
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS google_access_token TEXT;
