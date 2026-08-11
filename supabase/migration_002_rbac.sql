-- =============================================
-- MIGRATION 002: RBAC titular vs. sublocatário
-- Rode este script no SQL Editor do Supabase
-- (projeto kntnrcpxjdgpdrikgxao) DEPOIS do schema_clean.sql
-- =============================================

-- 1. Coluna de papel do profissional
ALTER TABLE profissionais
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'titular'
  CHECK (role IN ('titular', 'sublocatario'));

-- user_id passa a ser opcional: um profissional pode existir só como
-- registro de agenda, sem login próprio no sistema.
ALTER TABLE profissionais ALTER COLUMN user_id DROP NOT NULL;

-- 2. Funções auxiliares para as políticas de RLS
-- Retornam o papel/id do profissional vinculado ao usuário autenticado
-- na sessão atual (não confia em metadata do JWT, sempre consulta a tabela).
CREATE OR REPLACE FUNCTION current_profissional_role()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT role FROM profissionais WHERE user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION current_profissional_id()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
  SELECT id FROM profissionais WHERE user_id = auth.uid() LIMIT 1
$$;

-- 3. Políticas restritas por papel
-- Regra: titular (ou usuário sem registro em profissionais, ex. contas
-- antigas) continua vendo tudo da clínica. Sublocatário só vê o que está
-- vinculado ao seu próprio profissional_id.

-- 3.1 Agendamentos
DROP POLICY IF EXISTS "agendamentos_isolation" ON agendamentos;
CREATE POLICY "agendamentos_isolation" ON agendamentos
    FOR ALL
    USING (
      clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID)
      AND (
        current_profissional_role() IS DISTINCT FROM 'sublocatario'
        OR profissional_id = current_profissional_id()
      )
    );

-- 3.2 Faturamento
DROP POLICY IF EXISTS "faturamento_isolation" ON faturamento;
CREATE POLICY "faturamento_isolation" ON faturamento
    FOR ALL
    USING (
      clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID)
      AND (
        current_profissional_role() IS DISTINCT FROM 'sublocatario'
        OR profissional_executor_id = current_profissional_id()
      )
    );

-- 3.3 Anamneses
DROP POLICY IF EXISTS "anamneses_isolation" ON anamneses;
CREATE POLICY "anamneses_isolation" ON anamneses
    FOR ALL
    USING (
      paciente_id IN (
        SELECT id FROM pacientes WHERE clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID)
      )
      AND (
        current_profissional_role() IS DISTINCT FROM 'sublocatario'
        OR profissional_id = current_profissional_id()
      )
    );

-- 3.4 Pacientes: sublocatário só vê pacientes com quem já teve
-- agendamento ou anamnese (continua podendo cadastrar novos pacientes).
DROP POLICY IF EXISTS "pacientes_isolation" ON pacientes;
CREATE POLICY "pacientes_isolation" ON pacientes
    FOR ALL
    USING (
      clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID)
      AND (
        current_profissional_role() IS DISTINCT FROM 'sublocatario'
        OR id IN (SELECT paciente_id FROM agendamentos WHERE profissional_id = current_profissional_id())
        OR id IN (SELECT paciente_id FROM anamneses WHERE profissional_id = current_profissional_id())
      )
    );

-- 3.5 Odontograma: mesma visibilidade de paciente acima
DROP POLICY IF EXISTS "odontograma_isolation" ON odontograma;
CREATE POLICY "odontograma_isolation" ON odontograma
    FOR ALL
    USING (
      clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID)
      AND (
        current_profissional_role() IS DISTINCT FROM 'sublocatario'
        OR paciente_id IN (SELECT paciente_id FROM agendamentos WHERE profissional_id = current_profissional_id())
        OR paciente_id IN (SELECT paciente_id FROM anamneses WHERE profissional_id = current_profissional_id())
      )
    );
