"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { PageTransition } from "@/components/ui/page-transition"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useDashboardStats,
  useMonthlyRevenue,
  useUpcomingAppointments,
  useTopProcedures,
  formatCurrency,
} from "@/lib/queries"
import { Users, CalendarCheck, DollarSign, Stethoscope, TrendingUp, Clock } from "lucide-react"

const accentColors = {
  teal: { bar: "var(--clinical-teal)", bg: "color-mix(in srgb, var(--clinical-teal) 14%, transparent)" },
  cyan: { bar: "var(--clinical-cyan)", bg: "color-mix(in srgb, var(--clinical-cyan) 13%, transparent)" },
  emerald: { bar: "var(--clinical-emerald)", bg: "color-mix(in srgb, var(--clinical-emerald) 13%, transparent)" },
  amber: { bar: "var(--clinical-amber)", bg: "color-mix(in srgb, var(--clinical-amber) 13%, transparent)" },
}

const PIE_COLORS = ["#4FD1C5", "#7DD3FC", "#6EE7B7", "#FBBF77", "#C4B5FD", "#FCA5A5", "#A7F3D0", "#67E8F9"]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
  color,
  className,
}: {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  loading: boolean
  color: typeof accentColors[keyof typeof accentColors]
  className?: string
}) {
  return (
    <motion.div variants={itemVariants} className={className}>
      <Card className="group relative h-full overflow-hidden transition-all duration-300 hover:border-foreground/15 hover:shadow-lg hover:shadow-black/10">
        <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: color.bar }} />
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-300 group-hover:brightness-110" style={{ background: color.bg }}>
            <Icon className="h-4 w-4" style={{ color: color.bar }} />
          </div>
        </CardHeader>
        <CardContent className="relative">
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="animate-in fade-in zoom-in-95 rounded-xl border border-border bg-popover px-3.5 py-2.5 text-sm shadow-xl backdrop-blur-xl">
      <p className="text-muted-foreground text-xs mb-0.5 font-medium">{label}</p>
      <p className="text-foreground font-bold tracking-tight">{formatCurrency(payload[0].value)}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">Receita bruta registrada</p>
    </div>
  )
}

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="animate-in fade-in zoom-in-95 rounded-xl border border-border bg-popover px-3.5 py-2.5 text-sm shadow-xl backdrop-blur-xl">
      <p className="text-foreground font-semibold">{d.name}</p>
      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
        <span>{formatCurrency(d.faturamento)}</span>
        <span className="text-muted-foreground/40">|</span>
        <span>{d.quantidade}x</span>
      </div>
    </div>
  )
}

function CustomBar(props: any) {
  const { fill, x, y, width, height } = props
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} opacity={0.9} rx={6} ry={6} />
      <rect x={x} y={y + height * 0.58} width={width} height={height * 0.42} fill="var(--color-bg-primary)" opacity={0.18} rx={6} ry={6} />
    </g>
  )
}

export default function DashboardPage() {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)

  const { stats, loading: statsLoading } = useDashboardStats(selectedYear)
  const { data: revenueData, loading: revenueLoading } = useMonthlyRevenue(selectedYear)
  const { data: upcomingAppts, loading: apptsLoading } = useUpcomingAppointments(5)
  const { data: topProcedures, loading: proceduresLoading } = useTopProcedures(selectedYear)

  const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i)

  const hasRevenue = !revenueLoading && revenueData.some((d) => d.valor > 0)
  const hasProcedures = !proceduresLoading && topProcedures.length > 0

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral da clínica odontológica</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <span className="text-xs font-medium text-emerald-400">Online</span>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground/80 outline-none backdrop-blur-xl transition-colors hover:border-foreground/20 focus:border-primary/50"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* ── Bento Grid ────────────────────────────────────────────────────────
          12 colunas, blocos de tamanhos assimétricos: faturamento (grande) +
          KPIs empilhados ao lado + consultas (alta) + procedimentos (largo). */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:auto-rows-[minmax(0,1fr)]"
      >
        {/* Faturamento mensal — bloco grande */}
        <motion.div variants={itemVariants} className="lg:col-span-8 lg:row-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Faturamento Mensal
                </CardTitle>
                <span className="text-xs text-muted-foreground font-medium tracking-wide">{selectedYear}</span>
              </div>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <Skeleton className="h-[280px] w-full" />
              ) : !hasRevenue ? (
                <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent mb-4">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium">Nenhum dado de faturamento</p>
                  <p className="text-xs mt-1">Os gráficos serão exibidos automaticamente conforme os registros</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={revenueData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                    <XAxis
                      dataKey="nome"
                      tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                      axisLine={{ stroke: "var(--glass-border)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={50}
                      tickFormatter={(v: number) =>
                        v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
                      }
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--glass-fill)" }} />
                    <Bar
                      dataKey="valor"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={44}
                      shape={<CustomBar />}
                    >
                      {revenueData.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={entry.valor > 0 ? "var(--clinical-teal)" : "var(--glass-fill)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* KPIs — coluna estreita ao lado do faturamento */}
        <StatCard
          className="lg:col-span-4"
          title="Pacientes Ativos"
          value={stats.totalPacientes.toString()}
          icon={Users}
          loading={statsLoading}
          color={accentColors.teal}
        />
        <StatCard
          className="lg:col-span-4"
          title="Consultas Hoje"
          value={stats.consultasHoje.toString()}
          icon={CalendarCheck}
          loading={statsLoading}
          color={accentColors.cyan}
        />

        {/* Próximas consultas — bloco alto à direita */}
        <motion.div variants={itemVariants} className="lg:col-span-4 lg:row-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Próximas Consultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {apptsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[68px] w-full rounded-xl" />
                  ))}
                </div>
              ) : upcomingAppts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent mb-4">
                    <CalendarCheck className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium">Nenhuma consulta futura</p>
                  <p className="text-xs mt-1 text-center">As próximas consultas aparecerão aqui</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcomingAppts.map((appt: any, i: number) => (
                    <motion.div
                      key={appt.id}
                      initial={false}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="group flex items-center gap-3 rounded-xl border border-border/60 bg-accent/40 p-3 transition-all duration-200 hover:border-foreground/15 hover:bg-accent"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground/90 truncate group-hover:text-foreground transition-colors">
                          {(appt as any).pacientes?.nome ?? "Paciente"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {(appt as any).profissionais?.nome ?? "Profissional"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium text-foreground/70">
                          {new Date(appt.data_hora_inicio).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(appt.data_hora_inicio).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* KPIs restantes */}
        <StatCard
          className="lg:col-span-4"
          title="Faturamento Mensal"
          value={formatCurrency(stats.faturamentoMensal)}
          icon={DollarSign}
          loading={statsLoading}
          color={accentColors.emerald}
        />
        <StatCard
          className="lg:col-span-4"
          title="Procedimentos Realizados"
          value={stats.procedimentosRealizados.toString()}
          icon={Stethoscope}
          loading={statsLoading}
          color={accentColors.amber}
        />

        {/* Procedimentos mais executados — bloco largo, base do grid */}
        <motion.div variants={itemVariants} className="lg:col-span-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-accent">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                </div>
                Procedimentos Mais Executados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proceduresLoading ? (
                <Skeleton className="h-[260px] w-full" />
              ) : !hasProcedures ? (
                <div className="flex flex-col items-center justify-center h-[260px] text-muted-foreground">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent mb-4">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium">Nenhum procedimento registrado</p>
                  <p className="text-xs mt-1">Os dados aparecerão após o primeiro faturamento</p>
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2 items-center">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={topProcedures.slice(0, 8)}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={105}
                        paddingAngle={4}
                        dataKey="faturamento"
                        stroke="var(--color-bg-secondary)"
                        strokeWidth={2}
                      >
                        {topProcedures.slice(0, 8).map((_, idx) => (
                          <Cell
                            key={idx}
                            fill={PIE_COLORS[idx % PIE_COLORS.length]}
                            className="transition-all duration-200 hover:opacity-80"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2.5">
                    {topProcedures.slice(0, 8).map((p, idx) => {
                      const total = topProcedures.reduce((s, x) => s + x.faturamento, 0)
                      const pct = total > 0 ? ((p.faturamento / total) * 100).toFixed(1) : "0"
                      return (
                        <div key={p.nome} className="group flex items-center gap-3 rounded-lg border border-transparent px-2 py-1.5 transition-all duration-200 hover:border-border hover:bg-accent/40">
                          <div
                            className="h-3 w-3 shrink-0 rounded-full ring-2 ring-transparent transition-all group-hover:ring-foreground/20"
                            style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground/80 truncate group-hover:text-foreground transition-colors">{p.nome}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatCurrency(p.faturamento)}</span>
                              <span className="text-muted-foreground/40">·</span>
                              <span>{p.quantidade}x</span>
                              <span className="text-muted-foreground/40">·</span>
                              <span>{pct}%</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </PageTransition>
  )
}
