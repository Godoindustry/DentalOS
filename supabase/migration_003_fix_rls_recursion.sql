-- =============================================
-- MIGRATION 003: corrige recursão infinita nas
-- políticas de RLS introduzidas na migration 002.
--
-- Causa: "pacientes_isolation" consultava agendamentos/
-- anamneses, e "anamneses_isolation" consultava pacientes
-- de volta -> ciclo. Postgres detecta e recusa (42P17).
--
-- Fix: mover a subconsulta de agendamentos/anamneses para
-- uma função SECURITY DEFINER, que roda com privilégio do
-- dono da tabela e não reaplica a política RLS de quem
-- chamou, quebrando o ciclo.
-- =============================================

CREATE OR REPLACE FUNCTION sublocatario_paciente_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT paciente_id FROM agendamentos WHERE profissional_id = current_profissional_id()
  UNION
  SELECT paciente_id FROM anamneses WHERE profissional_id = current_profissional_id()
$$;

DROP POLICY IF EXISTS "pacientes_isolation" ON pacientes;
CREATE POLICY "pacientes_isolation" ON pacientes
    FOR ALL
    USING (
      clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID)
      AND (
        current_profissional_role() IS DISTINCT FROM 'sublocatario'
        OR id IN (SELECT sublocatario_paciente_ids())
      )
    );

DROP POLICY IF EXISTS "odontograma_isolation" ON odontograma;
CREATE POLICY "odontograma_isolation" ON odontograma
    FOR ALL
    USING (
      clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::UUID)
      AND (
        current_profissional_role() IS DISTINCT FROM 'sublocatario'
        OR paciente_id IN (SELECT sublocatario_paciente_ids())
      )
    );
