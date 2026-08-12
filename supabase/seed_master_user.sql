-- =============================================
-- SEED: Usuário Master (Admin de Testes) + Clínica Master
-- Idempotente: pode ser reexecutado sem duplicar dados
-- Requer: extensão pgcrypto (já criada em schema_clean.sql)
--
-- Este script:
--   1. Cria a clínica "Clínica Master (Ambiente de Testes)"
--   2. Cria/atualiza o usuário auth com senha Intep#2o26@
--   3. Marca role ADMIN em metadata
--   4. Cria vínculo em profissionais
-- =============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
DECLARE
    v_clinica_id   UUID;
    v_user_id      UUID;
    v_email        TEXT := 'grnd.contato@gmail.com';
    v_password     TEXT := 'Intep#2o26@';
    v_nome         TEXT := 'Usuário Master (Admin)';
    v_encrypted    TEXT;
BEGIN
    -- 1. Clínica Master (idempotente por nome_fantasia)
    SELECT id INTO v_clinica_id
    FROM clinicas
    WHERE nome_fantasia = 'Clínica Master (Ambiente de Testes)';

    IF v_clinica_id IS NULL THEN
        INSERT INTO clinicas (nome_fantasia, plano_assinatura)
        VALUES ('Clínica Master (Ambiente de Testes)', 'pro')
        RETURNING id INTO v_clinica_id;
    ELSE
        UPDATE clinicas
        SET plano_assinatura = 'pro'
        WHERE id = v_clinica_id;
    END IF;

    -- 2. Usuário em auth.users (idempotente por email)
    v_encrypted := crypt(v_password, gen_salt('bf'));

    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_email;

    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();

        INSERT INTO auth.users (
            id, instance_id, aud, role,
            email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at,
            confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
            v_user_id, '00000000-0000-0000-0000-000000000000',
            'authenticated', 'authenticated',
            v_email, v_encrypted, NOW(),
            jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'role', 'ADMIN'),
            jsonb_build_object('nome', v_nome, 'clinica_id', v_clinica_id, 'role', 'ADMIN'),
            NOW(), NOW(), '', '', '', ''
        );

        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
        ) VALUES (
            v_user_id, v_user_id,
            jsonb_build_object('sub', v_user_id::text, 'email', v_email),
            'email', NOW(), NOW(), NOW()
        );
    ELSE
        UPDATE auth.users
        SET encrypted_password = v_encrypted,
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'role', 'ADMIN'),
            raw_user_meta_data = jsonb_build_object('nome', v_nome, 'clinica_id', v_clinica_id, 'role', 'ADMIN'),
            updated_at = NOW()
        WHERE id = v_user_id;
    END IF;

    -- 3. Vínculo em profissionais (idempotente por user_id)
    IF NOT EXISTS (SELECT 1 FROM profissionais WHERE user_id = v_user_id) THEN
        INSERT INTO profissionais (
            clinica_id, user_id, nome, cro, uf_cro, especialidade_principal, ativo
        ) VALUES (
            v_clinica_id, v_user_id, v_nome, 'MASTER-00000', 'SP', 'Administração', TRUE
        );
    ELSE
        UPDATE profissionais
        SET clinica_id = v_clinica_id, nome = v_nome, ativo = TRUE
        WHERE user_id = v_user_id;
    END IF;

    RAISE NOTICE 'Usuário master pronto: % (id=%, clinica_id=%)', v_email, v_user_id, v_clinica_id;
END $$;
