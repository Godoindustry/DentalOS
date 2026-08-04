-- =============================================
-- SEED: Usuário Master (Admin de Testes) + Clínica Master
-- Idempotente: pode ser reexecutado sem duplicar dados
-- Requer: extensão pgcrypto (já criada em schema_clean.sql)
--
-- IMPORTANTE — leia antes de rodar:
-- Este schema (schema_clean.sql) não possui tabela `profiles` nem
-- coluna `role`. A RLS de todas as tabelas é feita comparando
-- `clinica_id` com `(auth.jwt() -> 'user_metadata' ->> 'clinica_id')`.
-- Não existe hoje um mecanismo de "acesso global a todas as clínicas".
--
-- Este script portanto:
--   1. Cria a clínica "Clínica Master (Ambiente de Testes)" (plano PRO)
--   2. Cria o usuário em auth.users + auth.identities, com senha em
--      bcrypt e email já confirmado (login imediato)
--   3. Grava `role: "ADMIN"` em raw_app_meta_data — disponível para a
--      aplicação usar em checagens de UI/lógica de negócio, mas NÃO é
--      um bypass de RLS (RLS continua restrita à clinica_id do master)
--   4. Cria um registro em `profissionais` vinculado a esse usuário e
--      à clínica master, para satisfazer os fluxos normais da app
--
-- Se você quiser que este usuário efetivamente enxergue TODAS as
-- clínicas via RLS, isso exige alterar as policies (bloco comentado
-- ao final) — não fiz isso automaticamente por ser uma mudança de
-- modelo de segurança que merece decisão explícita.
-- =============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
DECLARE
    v_clinica_id   UUID;
    v_user_id      UUID;
    v_email        TEXT := 'grnd.contato@gmail.com';
    v_password     TEXT := '#ToBeaHeroX2o26@@';
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

-- =============================================
-- OPCIONAL — bypass de RLS por role ADMIN (cross-clínica)
-- Descomente e adapte SOMENTE se você realmente quer que este usuário
-- veja/edite dados de TODAS as clínicas. Isso altera o modelo de
-- segurança do app para todas as tabelas isoladas por clinica_id.
-- =============================================
-- CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
--   SELECT COALESCE((auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN', FALSE);
-- $$ LANGUAGE sql STABLE SECURITY DEFINER;
--
-- Exemplo para a tabela pacientes (repetir por tabela, ajustando o nome da policy):
-- DROP POLICY IF EXISTS "pacientes_isolation" ON pacientes;
-- CREATE POLICY "pacientes_isolation" ON pacientes
--     FOR ALL
--     USING (
--         is_admin()
--         OR clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID)
--     );
