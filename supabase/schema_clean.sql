-- =============================================
-- DENTALOS - SCHEMA LIMPO
-- Remove todas as tabelas e recria do zero
-- ATENÇÃO: Isso apaga TODOS os dados existentes!
-- =============================================

-- =============================================
-- 0. LIMPEZA TOTAL
-- Tabelas são dropadas primeiro (CASCADE remove
-- triggers e policies automaticamente).
-- Funções são standalone, drop depois.
-- =============================================

DROP TABLE IF EXISTS conversas_bot CASCADE;
DROP TABLE IF EXISTS bot_mensagens_processadas CASCADE;
DROP TABLE IF EXISTS configuracoes_bot CASCADE;
DROP TABLE IF EXISTS bot_sessions CASCADE;
DROP TABLE IF EXISTS odontograma CASCADE;
DROP TABLE IF EXISTS faturamento CASCADE;
DROP TABLE IF EXISTS anamneses CASCADE;
DROP TABLE IF EXISTS agendamentos CASCADE;
DROP TABLE IF EXISTS pacientes_potenciais CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS procedimentos CASCADE;
DROP TABLE IF EXISTS pacientes CASCADE;
DROP TABLE IF EXISTS profissionais CASCADE;
DROP TABLE IF EXISTS clinicas CASCADE;

DROP FUNCTION IF EXISTS calcular_faturamento CASCADE;
DROP FUNCTION IF EXISTS checar_conflito_agendamento CASCADE;
DROP FUNCTION IF EXISTS update_updated_at CASCADE;
DROP FUNCTION IF EXISTS criar_usuario_demo CASCADE;

-- =============================================
-- 1. EXTENSÕES
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 2. TABELAS
-- =============================================

-- 2.1 CLÍNICAS
CREATE TABLE clinicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_fantasia VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255),
    cnpj VARCHAR(18) UNIQUE,
    plano_assinatura VARCHAR(50) DEFAULT 'basic' CHECK (plano_assinatura IN ('basic', 'pro', 'premium')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 PROFISSIONAIS
CREATE TABLE profissionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    nome VARCHAR(255) NOT NULL,
    cro VARCHAR(20) NOT NULL,
    uf_cro VARCHAR(2) NOT NULL,
    especialidade_principal VARCHAR(100),
    porcentagem_comissao NUMERIC(5,2) DEFAULT 0.00 CHECK (porcentagem_comissao >= 0 AND porcentagem_comissao <= 100),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 PACIENTES
CREATE TABLE pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14),
    data_nascimento DATE NOT NULL,
    sexo VARCHAR(1) CHECK (sexo IN ('M', 'F')),
    telefone_whatsapp VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    cep VARCHAR(9),
    logradouro VARCHAR(255),
    numero VARCHAR(10),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf VARCHAR(2),
    responsavel_legal VARCHAR(255),
    observacoes_criticas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 PROCEDIMENTOS
CREATE TABLE procedimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE NOT NULL,
    nome_servico VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    codigo_tuss VARCHAR(20),
    preco_venda NUMERIC(10,2) NOT NULL CHECK (preco_venda >= 0),
    custo_insumos_direto NUMERIC(10,2) DEFAULT 0.00 CHECK (custo_insumos_direto >= 0),
    custo_laboratorio NUMERIC(10,2) DEFAULT 0.00 CHECK (custo_laboratorio >= 0),
    tempo_estimado_minutos INT DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 AGENDAMENTOS
CREATE TABLE agendamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE NOT NULL,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE RESTRICT NOT NULL,
    profissional_id UUID REFERENCES profissionais(id) ON DELETE RESTRICT NOT NULL,
    data_hora_inicio TIMESTAMPTZ NOT NULL,
    data_hora_fim TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'agendado' CHECK (status IN ('agendado','confirmado_wpp','cancelado','em_atendimento','finalizado')),
    canal_origem VARCHAR(50) DEFAULT 'painel' CHECK (canal_origem IN ('painel','bot_whatsapp','bot_telegram','link_externo')),
    chat_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 ANAMNESES
CREATE TABLE anamneses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE NOT NULL,
    profissional_id UUID REFERENCES profissionais(id) NOT NULL,
    questionario_respondido JSONB NOT NULL,
    assinatura_digital_hash TEXT NOT NULL,
    finalizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 FATURAMENTO
CREATE TABLE faturamento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE NOT NULL,
    paciente_id UUID REFERENCES pacientes(id) NOT NULL,
    procedimento_id UUID REFERENCES procedimentos(id) NOT NULL,
    profissional_executor_id UUID REFERENCES profissionais(id) NOT NULL,
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
    valor_bruto_pago NUMERIC(10,2) NOT NULL CHECK (valor_bruto_pago >= 0),
    desconto_aplicado NUMERIC(10,2) DEFAULT 0.00 CHECK (desconto_aplicado >= 0),
    comissao_retida_dentista NUMERIC(10,2) NOT NULL,
    lucro_liquido_clinica NUMERIC(10,2) NOT NULL,
    data_competencia DATE NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL CHECK (forma_pagamento IN ('dinheiro','pix','credito_a_vista','parcelado','debito')),
    status_pagamento VARCHAR(30) DEFAULT 'pago' CHECK (status_pagamento IN ('pago','pendente','estornado')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 LEADS (LANDING PAGE)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    cadeiras INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.9 PACIENTES POTENCIAIS (BOT TELEGRAM / WHATSAPP)
CREATE TABLE pacientes_potenciais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE NOT NULL,
    chat_id VARCHAR(50) UNIQUE,
    canal VARCHAR(20) DEFAULT 'telegram',
    sender_id TEXT,
    nome VARCHAR(255),
    data_nascimento DATE,
    telefone VARCHAR(20),
    idade INT,
    anamnese JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'novo_lead' CHECK (status IN ('novo_lead','lead_em_conversa','lead_agendamento','atendimento_humano','em_triagem','agendou','convertido','desistiu','inativo')),
    etapa_atual VARCHAR(50) DEFAULT 'novo_contato',
    urgencia VARCHAR(20) DEFAULT 'nao_aplicavel',
    queixa_principal TEXT,
    regiao_dente VARCHAR(100),
    contexto_json JSONB DEFAULT '{}',
    total_conversas INT DEFAULT 0,
    ultima_mensagem TEXT,
    ultima_interacao TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.10 ODONTOGRAMA
CREATE TABLE odontograma (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE NOT NULL,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE NOT NULL UNIQUE,
    dentes JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.11 SESSÕES DO BOT
CREATE TABLE bot_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE NOT NULL,
    channel_session_id VARCHAR(100) UNIQUE NOT NULL,
    platform VARCHAR(50) NOT NULL,
    chat_id VARCHAR(50) NOT NULL,
    stage VARCHAR(50) DEFAULT 'start',
    patient_id UUID REFERENCES pacientes_potenciais(id) ON DELETE SET NULL,
    data JSONB DEFAULT '{}',
    last_user_message TEXT,
    last_bot_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.12 CONFIGURAÇÕES DO BOT POR CLÍNICA
CREATE TABLE configuracoes_bot (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE NOT NULL UNIQUE,
    nome_clinica VARCHAR(255) NOT NULL DEFAULT '',
    endereco TEXT DEFAULT '',
    cidade VARCHAR(100) DEFAULT '',
    horario_funcionamento TEXT DEFAULT 'seg a sex 08:00-18:00',
    telefone VARCHAR(20) DEFAULT '',
    whatsapp VARCHAR(20) DEFAULT '',
    google_calendar_id VARCHAR(255) DEFAULT '',
    mensagem_boas_vindas TEXT DEFAULT 'Olá! Sou o assistente virtual da clínica. Como posso ajudar?',
    mensagem_urgencia TEXT DEFAULT 'Entendi a urgência. Vou encaminhar para a equipe da clínica.',
    transferencia_humano TEXT DEFAULT 'Vou transferir seu atendimento para a nossa equipe.',
    ia_model VARCHAR(50) DEFAULT 'llama-3.1-8b-instant',
    ia_temperature NUMERIC(3,2) DEFAULT 0.2,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.13 MENSAGENS PROCESSADAS (IDEMPOTÊNCIA DO BOT)
-- NOTA: clinic_id é TEXT porque o n8n pode enviar IDs não-UUID
CREATE TABLE bot_mensagens_processadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key TEXT UNIQUE NOT NULL,
    canal TEXT,
    sender_id TEXT,
    message_id TEXT,
    clinic_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.14 CONVERSAS DO BOT
-- NOTA: clinic_id é TEXT porque o n8n pode enviar IDs não-UUID
CREATE TABLE conversas_bot (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id TEXT NOT NULL,
    paciente_potencial_id UUID REFERENCES pacientes_potenciais(id) ON DELETE CASCADE,
    canal TEXT NOT NULL DEFAULT 'telegram',
    sender_id TEXT NOT NULL,
    mensagem_usuario TEXT NOT NULL DEFAULT '',
    resposta_bot TEXT DEFAULT '',
    intencao TEXT DEFAULT 'desconhecido',
    urgencia TEXT DEFAULT 'nao_aplicavel',
    etapa TEXT DEFAULT '',
    raw_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. ÍNDICES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_clinicas_cnpj ON clinicas(cnpj);
CREATE INDEX IF NOT EXISTS idx_profissionais_clinica ON profissionais(clinica_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_clinica_busca ON pacientes(clinica_id, nome, cpf);
CREATE INDEX IF NOT EXISTS idx_procedimentos_clinica ON procedimentos(clinica_id, categoria);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(clinica_id, data_hora_inicio);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(clinica_id, status);
CREATE INDEX IF NOT EXISTS idx_anamneses_paciente ON anamneses(paciente_id);
CREATE INDEX IF NOT EXISTS idx_faturamento_performance ON faturamento(clinica_id, data_competencia, procedimento_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_potenciais_clinica ON pacientes_potenciais(clinica_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_potenciais_status ON pacientes_potenciais(clinica_id, status);
CREATE INDEX IF NOT EXISTS idx_pacientes_potenciais_canal ON pacientes_potenciais(clinica_id, canal, sender_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_potenciais_etapa ON pacientes_potenciais(clinica_id, etapa_atual);
CREATE INDEX IF NOT EXISTS idx_odontograma_paciente ON odontograma(paciente_id);
CREATE INDEX IF NOT EXISTS idx_bot_sessions_channel ON bot_sessions(clinica_id, channel_session_id);
CREATE INDEX IF NOT EXISTS idx_bot_sessions_chat ON bot_sessions(chat_id);
CREATE INDEX IF NOT EXISTS idx_bot_mensagens_idempotency ON bot_mensagens_processadas(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_bot_mensagens_clinic ON bot_mensagens_processadas(clinic_id);
CREATE INDEX IF NOT EXISTS idx_conversas_bot_lead ON conversas_bot(paciente_potencial_id);
CREATE INDEX IF NOT EXISTS idx_conversas_bot_clinic ON conversas_bot(clinic_id);
CREATE INDEX IF NOT EXISTS idx_conversas_bot_created ON conversas_bot(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversas_bot_sender ON conversas_bot(sender_id);

-- =============================================
-- 4. FUNÇÕES
-- =============================================

-- 4.1 Atualizar updated_at (genérica)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.2 Calcular valores do faturamento
CREATE OR REPLACE FUNCTION calcular_faturamento()
RETURNS TRIGGER AS $$
DECLARE
    v_comissao_percent NUMERIC(5,2);
    v_custo_insumos NUMERIC(10,2);
    v_custo_lab NUMERIC(10,2);
BEGIN
    SELECT porcentagem_comissao INTO v_comissao_percent
    FROM profissionais WHERE id = NEW.profissional_executor_id;
    SELECT custo_insumos_direto, custo_laboratorio
    INTO v_custo_insumos, v_custo_lab
    FROM procedimentos WHERE id = NEW.procedimento_id;
    NEW.comissao_retida_dentista := ROUND(
        (NEW.valor_bruto_pago - COALESCE(NEW.desconto_aplicado, 0)) * (COALESCE(v_comissao_percent, 0) / 100), 2);
    NEW.lucro_liquido_clinica := NEW.valor_bruto_pago
        - COALESCE(NEW.desconto_aplicado, 0)
        - COALESCE(v_custo_insumos, 0)
        - COALESCE(v_custo_lab, 0)
        - NEW.comissao_retida_dentista;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.3 Checar conflito de horário em agendamentos
CREATE OR REPLACE FUNCTION checar_conflito_agendamento()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM agendamentos
        WHERE profissional_id = NEW.profissional_id
        AND status NOT IN ('cancelado', 'finalizado')
        AND tstzrange(NEW.data_hora_inicio, NEW.data_hora_fim) && tstzrange(data_hora_inicio, data_hora_fim)
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
    ) THEN
        RAISE EXCEPTION 'Conflito de horário: profissional já possui agendamento neste período';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.4 RPC: Criar usuário demo diretamente no auth schema
CREATE OR REPLACE FUNCTION public.criar_usuario_demo(
    p_email TEXT,
    p_password TEXT,
    p_nome TEXT,
    p_clinica_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_encrypted_password TEXT;
BEGIN
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
        RETURN jsonb_build_object('error', 'Email já cadastrado');
    END IF;

    v_user_id := gen_random_uuid();
    v_encrypted_password := crypt(p_password, gen_salt('bf'));

    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
        v_user_id, '00000000-0000-0000-0000-000000000000',
        p_email, v_encrypted_password, NOW(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('nome', p_nome, 'clinica_id', p_clinica_id),
        NOW(), NOW(), '', '', '', ''
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
        v_user_id, v_user_id,
        jsonb_build_object('sub', v_user_id::text, 'email', p_email),
        'email', NOW(), NOW(), NOW()
    );

    RETURN jsonb_build_object('user_id', v_user_id::text, 'email', p_email);
END;
$$;

-- =============================================
-- 5. TRIGGERS
-- =============================================

CREATE TRIGGER trigger_calcular_faturamento
    BEFORE INSERT ON faturamento
    FOR EACH ROW
    EXECUTE FUNCTION calcular_faturamento();

CREATE TRIGGER trigger_checar_conflito_agendamento
    BEFORE INSERT OR UPDATE ON agendamentos
    FOR EACH ROW
    WHEN (NEW.status NOT IN ('cancelado', 'finalizado'))
    EXECUTE FUNCTION checar_conflito_agendamento();

CREATE TRIGGER trigger_odontograma_updated_at
    BEFORE UPDATE ON odontograma
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_bot_sessions_updated_at
    BEFORE UPDATE ON bot_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_configuracoes_bot_updated_at
    BEFORE UPDATE ON configuracoes_bot
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamneses ENABLE ROW LEVEL SECURITY;
ALTER TABLE faturamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes_potenciais ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontograma ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_bot ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversas_bot ENABLE ROW LEVEL SECURITY;
-- bot_mensagens_processadas: acesso via service role apenas (sem RLS)

-- 6.1 Políticas de isolação por clínica (SELECT/UPDATE/DELETE)
CREATE POLICY "clinicas_self" ON clinicas
    FOR ALL
    USING (id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID));

CREATE POLICY "profissionais_isolation" ON profissionais
    FOR ALL
    USING (clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID));

CREATE POLICY "pacientes_isolation" ON pacientes
    FOR ALL
    USING (clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID));

CREATE POLICY "procedimentos_isolation" ON procedimentos
    FOR ALL
    USING (clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID));

CREATE POLICY "agendamentos_isolation" ON agendamentos
    FOR ALL
    USING (clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID));

CREATE POLICY "faturamento_isolation" ON faturamento
    FOR ALL
    USING (clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID));

CREATE POLICY "odontograma_isolation" ON odontograma
    FOR ALL
    USING (clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID));

CREATE POLICY "pacientes_potenciais_isolation" ON pacientes_potenciais
    FOR ALL
    USING (clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID));

CREATE POLICY "anamneses_isolation" ON anamneses
    FOR ALL
    USING (paciente_id IN (
        SELECT id FROM pacientes WHERE clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID)
    ));

CREATE POLICY "configuracoes_bot_isolation" ON configuracoes_bot
    FOR ALL
    USING (clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID));

CREATE POLICY "conversas_bot_isolation" ON conversas_bot
    FOR ALL
    USING (paciente_potencial_id IN (
        SELECT id FROM pacientes_potenciais WHERE clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID)
    ));

-- 6.2 Políticas de INSERT (WITH CHECK)
CREATE POLICY "pacientes_insert" ON pacientes
    FOR INSERT
    WITH CHECK (clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID));

CREATE POLICY "profissionais_insert" ON profissionais
    FOR INSERT
    WITH CHECK (clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID));

CREATE POLICY "procedimentos_insert" ON procedimentos
    FOR INSERT
    WITH CHECK (clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID));

CREATE POLICY "agendamentos_insert" ON agendamentos
    FOR INSERT
    WITH CHECK (clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID));

CREATE POLICY "faturamento_insert" ON faturamento
    FOR INSERT
    WITH CHECK (clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID));

CREATE POLICY "odontograma_insert" ON odontograma
    FOR INSERT
    WITH CHECK (clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID));

CREATE POLICY "pacientes_potenciais_insert" ON pacientes_potenciais
    FOR INSERT
    WITH CHECK (clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID));
