-- Migration: Adicionar suporte a webhook n8n no bot
-- Data: 2025-01-15

-- Adicionar colunas para webhook n8n
ALTER TABLE configuracoes_bot
  ADD COLUMN IF NOT EXISTS n8n_webhook_url VARCHAR(500) DEFAULT '',
  ADD COLUMN IF NOT EXISTS n8n_webhook_secret VARCHAR(255) DEFAULT '',
  ADD COLUMN IF NOT EXISTS webhook_slug VARCHAR(50) DEFAULT '';

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_configuracoes_bot_n8n ON configuracoes_bot(n8n_webhook_url) WHERE n8n_webhook_url != '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_configuracoes_bot_webhook_slug ON configuracoes_bot(webhook_slug) WHERE webhook_slug != '';

-- Comentário
COMMENT ON COLUMN configuracoes_bot.n8n_webhook_url IS 'URL do webhook n8n para receber mensagens do WhatsApp via Z-API';
COMMENT ON COLUMN configuracoes_bot.n8n_webhook_secret IS 'Segredo para validar webhooks n8n (HMAC-SHA256)';
COMMENT ON COLUMN configuracoes_bot.webhook_slug IS 'Identificador único na URL do webhook (ex: /api/bot/n8n/{slug})';
