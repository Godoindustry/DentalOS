import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type {
  Paciente,
  PacientePotencial,
  Profissional,
  Procedimento,
  Agendamento,
  Odontograma,
  ConversaBot,
  ConfiguracaoBot,
  BotMensagemProcessada,
} from "@/types/database"

function useSupabaseQuery<T>(
  table: string,
  options?: { order?: string; ascending?: boolean }
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    const query = supabase.from(table).select("*")
    if (options?.order) {
      query.order(options.order, { ascending: options.ascending ?? true })
    }
    const { data: result, error: err } = await query
    if (err) setError(err.message)
    else setData(result as T[])
    setLoading(false)
  }, [table, options?.order, options?.ascending])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

export function usePacientes() {
  return useSupabaseQuery<Paciente>("pacientes", { order: "created_at", ascending: false })
}

export function useProfissionais() {
  return useSupabaseQuery<Profissional>("profissionais", { order: "nome", ascending: true })
}

export function useProcedimentos() {
  return useSupabaseQuery<Procedimento>("procedimentos", { order: "nome_servico", ascending: true })
}

export function useProcedimento(id: string) {
  const [data, setData] = useState<Procedimento | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from("procedimentos").select("*").eq("id", id).single().then(({ data, error }) => {
      if (error) console.error(error)
      else setData(data as Procedimento)
      setLoading(false)
    })
  }, [id])

  return { data, loading }
}

export function useProfissional(id: string) {
  const [data, setData] = useState<Profissional | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from("profissionais").select("*").eq("id", id).single().then(({ data, error }) => {
      if (error) console.error(error)
      else setData(data as Profissional)
      setLoading(false)
    })
  }, [id])

  return { data, loading }
}

export function useAgendamentos() {
  return useSupabaseQuery<Agendamento>("agendamentos", { order: "data_hora_inicio", ascending: true })
}

export function usePacientesPotenciais() {
  return useSupabaseQuery<PacientePotencial>("pacientes_potenciais", { order: "ultima_interacao", ascending: false })
}

export function usePaciente(id: string) {
  const [data, setData] = useState<Paciente | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from("pacientes").select("*").eq("id", id).single().then(({ data, error }) => {
      if (error) console.error(error)
      else setData(data as Paciente)
      setLoading(false)
    })
  }, [id])

  return { data, loading }
}

export function useOdontograma(pacienteId: string) {
  const [data, setData] = useState<Odontograma | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("odontograma")
      .select("*")
      .eq("paciente_id", pacienteId)
      .maybeSingle()
    if (error) console.error(error)
    setData(data as Odontograma | null)
    setLoading(false)
  }, [pacienteId])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, refetch: fetch }
}

// ─── Dashboard ──────────────────────────────────────────────

export function useDashboardStats(year: number) {
  const [stats, setStats] = useState({
    totalPacientes: 0,
    consultasHoje: 0,
    faturamentoMensal: 0,
    procedimentosRealizados: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetch = async () => {
      const hoje = new Date()
      const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString()
      const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1).toISOString()
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString()
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1).toISOString()

      const [pacientes, agendamentosHoje, faturamentoMes, procedimentos] = await Promise.all([
        supabase.from("pacientes").select("*", { count: "exact", head: true }),
        supabase.from("agendamentos").select("*", { count: "exact", head: true })
          .gte("data_hora_inicio", inicioHoje).lt("data_hora_inicio", fimHoje),
        supabase.from("faturamento").select("valor_bruto_pago")
          .gte("data_competencia", inicioMes).lt("data_competencia", fimMes),
        supabase.from("faturamento").select("*", { count: "exact", head: true })
          .gte("data_competencia", `${year}-01-01`).lte("data_competencia", `${year}-12-31`),
      ])

      const faturamentoTotal = (faturamentoMes.data ?? []).reduce(
        (acc: number, f: any) => acc + Number(f.valor_bruto_pago), 0
      )

      setStats({
        totalPacientes: pacientes.count ?? 0,
        consultasHoje: agendamentosHoje.count ?? 0,
        faturamentoMensal: faturamentoTotal,
        procedimentosRealizados: procedimentos.count ?? 0,
      })
      setLoading(false)
    }
    fetch()
  }, [year])

  return { stats, loading }
}

export function useMonthlyRevenue(year: number) {
  const [data, setData] = useState<{ mes: number; nome: string; valor: number }[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from("faturamento")
      .select("data_competencia, valor_bruto_pago")
      .gte("data_competencia", `${year}-01-01`)
      .lte("data_competencia", `${year}-12-31`)
      .then(({ data: rows }) => {
        const meses = Array.from({ length: 12 }, (_, i) => ({
          mes: i + 1,
          nome: new Date(year, i).toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
          valor: 0,
        }))
        if (rows) {
          for (const r of rows) {
            const m = new Date(r.data_competencia).getMonth()
            meses[m].valor += Number(r.valor_bruto_pago)
          }
        }
        setData(meses)
        setLoading(false)
      })
  }, [year])

  return { data, loading }
}

export function useUpcomingAppointments(limit = 5) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from("agendamentos")
      .select("id, data_hora_inicio, status, pacientes (nome), profissionais (nome)")
      .gte("data_hora_inicio", new Date().toISOString())
      .in("status", ["agendado", "confirmado_wpp"])
      .order("data_hora_inicio", { ascending: true })
      .limit(limit)
      .then(({ data: rows }) => {
        setData(rows ?? [])
        setLoading(false)
      })
  }, [limit])

  return { data, loading }
}

export function useTopProcedures(year: number) {
  const [data, setData] = useState<{ nome: string; quantidade: number; faturamento: number }[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from("faturamento")
      .select("valor_bruto_pago, procedimentos (nome_servico)")
      .gte("data_competencia", `${year}-01-01`)
      .lte("data_competencia", `${year}-12-31`)
      .then(({ data: rows }) => {
        const map = new Map<string, { quantidade: number; faturamento: number }>()
        if (rows) {
          for (const r of rows as any[]) {
            const nome = r.procedimentos?.nome_servico ?? "Sem nome"
            const item = map.get(nome) ?? { quantidade: 0, faturamento: 0 }
            item.quantidade++
            item.faturamento += Number(r.valor_bruto_pago)
            map.set(nome, item)
          }
        }
        setData(
          Array.from(map.entries())
            .map(([nome, v]) => ({ nome, ...v }))
            .sort((a, b) => b.faturamento - a.faturamento)
        )
        setLoading(false)
      })
  }, [year])

  return { data, loading }
}

export function useBotSessions(limit = 20) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from("bot_sessions")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(limit)
      .then(({ data: rows }) => {
        setData(rows ?? [])
        setLoading(false)
      })
  }, [limit])

  return { data, loading }
}

export function useBotStats() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    novoLead: 0,
    emConversa: 0,
    leadAgendamento: 0,
    atendimentoHumano: 0,
    emTriagem: 0,
    agendou: 0,
    convertidos: 0,
    desistiram: 0,
    sessoesAtivas: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetch = async () => {
      const [
        leads, novoLead, emConversa, leadAgendamento, atendimentoHumano,
        emTriagem, agendou, convertidos, desistiram, sessoes
      ] = await Promise.all([
        supabase.from("pacientes_potenciais").select("*", { count: "exact", head: true }),
        supabase.from("pacientes_potenciais").select("*", { count: "exact", head: true }).eq("status", "novo_lead"),
        supabase.from("pacientes_potenciais").select("*", { count: "exact", head: true }).eq("status", "lead_em_conversa"),
        supabase.from("pacientes_potenciais").select("*", { count: "exact", head: true }).eq("status", "lead_agendamento"),
        supabase.from("pacientes_potenciais").select("*", { count: "exact", head: true }).eq("status", "atendimento_humano"),
        supabase.from("pacientes_potenciais").select("*", { count: "exact", head: true }).eq("status", "em_triagem"),
        supabase.from("pacientes_potenciais").select("*", { count: "exact", head: true }).eq("status", "agendou"),
        supabase.from("pacientes_potenciais").select("*", { count: "exact", head: true }).eq("status", "convertido"),
        supabase.from("pacientes_potenciais").select("*", { count: "exact", head: true }).eq("status", "desistiu"),
        supabase.from("conversas_bot").select("*", { count: "exact", head: true }),
      ])

      setStats({
        totalLeads: leads.count ?? 0,
        novoLead: novoLead.count ?? 0,
        emConversa: emConversa.count ?? 0,
        leadAgendamento: leadAgendamento.count ?? 0,
        atendimentoHumano: atendimentoHumano.count ?? 0,
        emTriagem: emTriagem.count ?? 0,
        agendou: agendou.count ?? 0,
        convertidos: convertidos.count ?? 0,
        desistiram: desistiram.count ?? 0,
        sessoesAtivas: sessoes.count ?? 0,
      })
      setLoading(false)
    }
    fetch()
  }, [])

  return { stats, loading }
}

export function useConversasBot(leadId: string) {
  const [data, setData] = useState<ConversaBot[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!leadId) { setLoading(false); return }
    supabase
      .from("conversas_bot")
      .select("*")
      .eq("paciente_potencial_id", leadId)
      .order("created_at", { ascending: true })
      .then(({ data: rows }) => {
        setData(rows as ConversaBot[] ?? [])
        setLoading(false)
      })
  }, [leadId])

  return { data, loading }
}

export function useConversasRecentes(limit = 20) {
  const [data, setData] = useState<ConversaBot[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from("conversas_bot")
      .select("*, pacientes_potenciais(nome, telefone, status, canal)")
      .order("created_at", { ascending: false })
      .limit(limit)
      .then(({ data: rows }) => {
        setData(rows as any[] ?? [])
        setLoading(false)
      })
  }, [limit])

  return { data, loading }
}

export function useConfiguracaoBot() {
  const [data, setData] = useState<ConfiguracaoBot | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data: user } = await supabase.auth.getUser()
    const clinicaId = user.user?.user_metadata?.clinica_id
    if (!clinicaId) { setLoading(false); return }

    const { data: config } = await supabase
      .from("configuracoes_bot")
      .select("*")
      .eq("clinica_id", clinicaId)
      .maybeSingle()

    setData(config as ConfiguracaoBot | null)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, refetch: fetch }
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

export function calculateAge(dataNascimento: string) {
  const hoje = new Date()
  const nasc = new Date(dataNascimento)
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const mes = hoje.getMonth() - nasc.getMonth()
  if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}
