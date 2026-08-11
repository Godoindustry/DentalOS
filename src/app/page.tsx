"use client"

import { useState, useEffect, useRef, type FormEvent } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Stethoscope, Shield, BarChart3, MessageCircle, Sparkles, ChevronDown, Check, X, Menu, ArrowRight, Star, Users, TrendingUp, Clock, User, Mail, Phone, Hash, Calendar, FileText, Activity, DollarSign } from "lucide-react"

function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px", amount: threshold })
  return { ref, inView }
}

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useScrollAnimation()
  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </div>
  )
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-xl ${className}`}>
      {children}
    </div>
  )
}

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/[0.06]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left group"
      >
        <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{question}</span>
        <ChevronDown className={`h-4 w-4 text-white/40 transition-all duration-200 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-white/50 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FloatingOrb({ className = "", size = 300, color = "rgba(59,130,246,0.08)", duration = 20, delay = 0 }: { className?: string; size?: number; color?: string; duration?: number; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{ width: size, height: size, background: `radial-gradient(circle, ${color}, transparent 70%)` }}
      animate={{
        x: [0, 30, -20, 10, 0],
        y: [0, -40, 20, -10, 0],
        scale: [1, 1.05, 0.98, 1.02, 1],
      }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    />
  )
}

function Counter({ end, suffix = "", duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const increment = end / (duration * 60)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

const FEATURES = [
  { icon: Calendar, name: "Agenda Inteligente", desc: "Gestão visual de horários com drag-and-drop, confirmação via WhatsApp em um clique." },
  { icon: DollarSign, name: "Margem Cirúrgica Real", desc: "Custo de insumos + laboratório + comissão do protético deduzidos automaticamente." },
  { icon: Activity, name: "Odontograma 3D", desc: "Mapa dentário fotorrealista por face. Diagnóstico preciso, visual e rapidamente." },
  { icon: MessageCircle, name: "Automação WhatsApp", desc: "Confirmação humanizada com delays inteligentes. Zero risco de banimento." },
  { icon: FileText, name: "Anamnese Digital", desc: "Fichas 100% imutáveis com assinatura digital SHA-256. Conformidade RGPD total." },
  { icon: BarChart3, name: "Dashboards Executivos", desc: "Gráficos interativos que revelam os procedimentos mais lucrativos da sua clínica." },
  { icon: Users, name: "Split de Comissões", desc: "Rateio automático entre dentistas, clínica e laboratório. Transparente e sem erros." },
  { icon: Shield, name: "Segurança Jurídica", desc: "Isolamento de dados por clínica com RLS. Backup criptografado automático." },
]

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [leadSent, setLeadSent] = useState(false)
  const [leadError, setLeadError] = useState("")
  const [sending, setSending] = useState(false)
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly")
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleLeadSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSending(true)
    setLeadError("")
    const form = e.currentTarget
    const data = { nome: form.nome.value, email: form.email.value, telefone: form.telefone.value, cadeiras: form.cadeiras.value }
    const res = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (res.ok) setLeadSent(true)
    else setLeadError("Erro ao enviar. Tente novamente.")
    setSending(false)
  }

  const scrollTo = (id: string) => {
    setMobileMenu(false)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-[#002B36] text-white overflow-hidden selection:bg-primary/30 selection:text-white">
      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#002B36]/90 backdrop-blur-xl border-b border-white/[0.06]" : "bg-transparent"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold text-white">DentalOS</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[["Funcionalidades", "funcionalidades"], ["Preços", "precos"], ["FAQ", "faq"]].map(([label, href]) => (
              <button key={href} onClick={() => scrollTo(href)} className="text-sm text-white/60 hover:text-white transition-colors">
                {label}
              </button>
            ))}
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">Entrar</Link>
              <Link href="/cadastro">
                <Button variant="outline" size="sm">Criar Conta</Button>
              </Link>
              <Button size="sm" onClick={() => scrollTo("lead")}>Agendar Demo</Button>
            </div>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2">
            {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-white/[0.06] overflow-hidden bg-[#002B36]/95 backdrop-blur-xl">
              <div className="flex flex-col gap-3 px-4 py-4">
                {[["Funcionalidades", "funcionalidades"], ["Preços", "precos"], ["FAQ", "faq"]].map(([label, href]) => (
                  <button key={href} onClick={() => scrollTo(href)} className="text-sm text-white/60 hover:text-white py-2 text-left">
                    {label}
                  </button>
                ))}
                <Link href="/login" className="text-sm text-white/70 hover:text-white py-2">Entrar</Link>
                <Link href="/cadastro" className="w-full">
                  <Button variant="outline" className="w-full">Criar Conta</Button>
                </Link>
                <Button onClick={() => scrollTo("lead")} className="w-full">Agendar Demonstração</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#002B36] via-[#0A424F] to-[#002B36]" />

        {/* Orbs flutuantes */}
        <FloatingOrb className="top-20 -left-40" size={500} color="rgba(59,130,246,0.06)" duration={25} />
        <FloatingOrb className="top-40 right-20" size={350} color="rgba(16,185,129,0.06)" duration={20} delay={3} />
        <FloatingOrb className="bottom-40 left-1/3" size={400} color="rgba(168,85,247,0.04)" duration={30} delay={5} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

        {/* Formas geométricas flutuantes */}
        <motion.div
          className="absolute top-32 left-[15%] w-3 h-3 border border-primary/30 rounded-sm"
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-48 right-[20%] w-4 h-4 border border-emerald-400/20 rounded-full"
          animate={{ y: [-10, 10, -10], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-[10%] w-6 h-6 border border-purple-400/20"
          style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Sistema de gestão inteligente para clínicas odontológicas
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight"
          >
            O controlo financeiro e a automação que a{" "}
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient">sua clínica merece</span>.
            Sem esforço.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-white/60 leading-relaxed"
          >
            Vá além da agenda básica. Descubra a margem de lucro real de cada procedimento, automatize a confirmação de consultas via WhatsApp e ofereça um prontuário 3D fotorrealista. Criado exclusivamente para dentistas de alta performance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="h-12 px-8 text-base bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25 animate-pulse" onClick={() => scrollTo("lead")}>
              Agendar Demonstração Gratuita
            </Button>
            <Link href="/cadastro">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base group">
                Criar Conta Grátis
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="ghost" size="lg" className="h-12 px-6 text-base text-white/40 hover:text-white" onClick={() => scrollTo("funcionalidades")}>
              Ver Funcionalidades
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm"
          >
            <div className="flex items-center gap-2 text-white/40">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="ml-1 font-medium text-white/60"><Counter end={49} duration={3} />/<Counter end={10} duration={1} /></span>
            </div>
            <span className="text-white/30">·</span>
            <span className="text-white/40"><Users className="inline h-3.5 w-3.5 mr-1" /><Counter end={340} suffix="+" duration={3} /> clínicas confiam</span>
            <span className="text-white/30">·</span>
            <span className="text-white/40"><TrendingUp className="inline h-3.5 w-3.5 mr-1" />Aumento médio de <Counter end={22} suffix="%" duration={3} /> no lucro</span>
          </motion.div>
        </div>
      </section>

      {/* ── BLOCO 2: DOR OCULTA ── */}
      <section id="funcionalidades" className="relative px-4 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Sabe quanto lucrou verdadeiramente no último implante?</h2>
            <p className="text-center text-white/50 max-w-2xl mx-auto mb-16">
              A maioria dos softwares ignora os custos reais. O DentalOS revela a margem cirúrgica de cada procedimento.
            </p>
          </FadeUp>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "O Erro Comum",
                desc: "A maioria dos softwares regista apenas a entrada do dinheiro, mas ignora o custo flutuante das resinas, anestésicos e taxas do laboratório de prótese.",
                color: "border-red-500/20 bg-red-500/5",
                icon: X,
              },
              {
                number: "02",
                title: "A Consequência",
                desc: "Trabalhar muito, ver o consultório cheio, mas chegar ao fim do mês com a sensação de que a margem sumiu.",
                color: "border-amber-500/20 bg-amber-500/5",
                icon: TrendingUp,
              },
              {
                number: "03",
                title: "A Solução DentalOS",
                desc: "O DentalOS calcula o custo marginal de forma invisível. Abriu a ficha? O lucro líquido real já está calculado.",
                color: "border-emerald-500/20 bg-emerald-500/5",
                icon: Check,
              },
            ].map((item, i) => (
              <FadeUp key={item.title} delay={i * 0.1}>
                <GlassCard className={`border ${item.color} p-8 group hover:scale-[1.02] transition-transform duration-300`}>
                  <div className="flex items-start justify-between">
                    <span className="text-4xl font-bold text-white/10">{item.number}</span>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color} ${item.icon === Check ? "text-emerald-400" : item.icon === TrendingUp ? "text-amber-400" : "text-red-400"}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm text-white/50 leading-relaxed">{item.desc}</p>
                </GlassCard>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOCO 3: FEATURES GRID ── */}
      <section className="relative px-4 py-24 md:py-32 bg-white/[0.01] border-y border-white/[0.04]">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Tudo o que a sua clínica precisa</h2>
            <p className="text-center text-white/50 max-w-2xl mx-auto mb-16">
              Oito módulos integrados — da agenda ao financeiro — desenhados para dentistas de alta performance.
            </p>
          </FadeUp>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((item, i) => (
              <FadeUp key={item.name} delay={i * 0.05}>
                <GlassCard className="p-6 h-full group hover:border-white/[0.12] transition-all duration-300">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-primary group-hover:bg-primary/20 transition-colors`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-white">{item.name}</h3>
                  <p className="mt-2 text-xs text-white/50 leading-relaxed">{item.desc}</p>
                </GlassCard>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOCO 4: DEMONSTRAÇÃO VISUAL ── */}
      <section className="relative px-4 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Veja o DentalOS em ação</h2>
              <p className="text-white/50 max-w-2xl mx-auto">Uma interface limpa, rápida e livre de distrações. Desenhada para ser utilizada com luvas e cliques mínimos.</p>
            </div>
          </FadeUp>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { icon: BarChart3, title: "Dashboard Financeiro", desc: "Margem real de cada procedimento com gráficos interativos.", color: "from-primary/20 to-emerald-500/10" },
              { icon: Stethoscope, title: "Odontograma 3D Interativo", desc: "Selecione dente e face com um clique. Cores indicam estado clínico.", color: "from-purple-500/20 to-primary/10" },
              { icon: MessageCircle, title: "Feed de Automação WhatsApp", desc: "Confirmações enviadas com delays inteligentes. Status atualiza em tempo real.", color: "from-emerald-500/20 to-cyan-500/10" },
              { icon: FileText, title: "Anamnese Digital Imutável", desc: "Assinatura SHA-256. Conformidade RGPD total. Acesso vitalício.", color: "from-amber-500/20 to-orange-500/10" },
            ].map((item, i) => (
              <FadeUp key={item.title} delay={i * 0.08}>
                <GlassCard className={`p-6 group hover:scale-[1.01] transition-all duration-300 cursor-default`}>
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color}`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{item.title}</h3>
                      <p className="mt-1 text-sm text-white/50">{item.desc}</p>
                    </div>
                  </div>
                </GlassCard>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.2}>
            <GlassCard className="mt-8 p-2 md:p-4">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-[#0A424F] to-[#002B36] flex items-center justify-center border border-white/[0.06] relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05),transparent_60%)]" />
                <div className="text-center p-8 relative">
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30">
                        <Stethoscope className="h-7 w-7 text-primary" />
                      </div>
                      <span className="text-[10px] text-white/30 font-medium">Odontograma</span>
                    </div>
                    <div className="text-white/20 text-2xl font-thin">+</div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30">
                        <MessageCircle className="h-7 w-7 text-emerald-400" />
                      </div>
                      <span className="text-[10px] text-white/30 font-medium">WhatsApp</span>
                    </div>
                    <div className="text-white/20 text-2xl font-thin">+</div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/20 border border-purple-500/30">
                        <BarChart3 className="h-7 w-7 text-purple-400" />
                      </div>
                      <span className="text-[10px] text-white/30 font-medium">Financeiro</span>
                    </div>
                  </div>
                  <p className="text-lg text-white/40 font-medium">Odontograma 3D + Feed de Automação WhatsApp</p>
                  <p className="text-sm text-white/20 mt-2">Interface limpa, rápida e livre de distrações</p>
                </div>
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05),transparent_60%)]" />
              </div>
            </GlassCard>
          </FadeUp>
        </div>
      </section>

      {/* ── BLOCO 5: DEPOIMENTO ── */}
      <section className="relative px-4 py-24 md:py-32 bg-white/[0.01] border-y border-white/[0.04]">
        <div className="mx-auto max-w-4xl">
          <FadeUp>
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">O que dizem os nossos clientes</h2>
              <p className="text-white/50">Mais de 340 clínicas confiam no DentalOS em Portugal</p>
            </div>
          </FadeUp>

          <FadeUp>
            <GlassCard className="relative p-8 md:p-12 group hover:border-white/[0.12] transition-all duration-300">
              <div className="absolute -top-4 left-8 text-7xl text-primary/10 font-serif leading-none">"</div>
              <div className="flex gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="relative text-lg md:text-xl text-white/80 leading-relaxed italic">
                Mudei para o DentalOS pela promessa do bot de WhatsApp, mas o que salvou a minha clínica foi o módulo financeiro. Descobri que dois procedimentos que eu fazia muito tinham margem quase zero devido aos custos do protético. Ajustei os preços em uma semana e o faturamento líquido subiu 22%.
              </blockquote>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-400 text-white font-bold text-lg shadow-lg shadow-primary/20">
                  AM
                </div>
                <div>
                  <p className="font-semibold text-white">Dr. Alexandre Mendes</p>
                  <p className="text-sm text-white/40">Implantodontista · Lisboa</p>
                </div>
                <div className="ml-auto hidden sm:block">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </FadeUp>

          {/* Stats bar */}
          <FadeUp delay={0.2}>
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { icon: Users, value: "340+", label: "Clínicas Ativas" },
                { icon: Star, value: "4.9", label: "Classificação Média" },
                { icon: TrendingUp, value: "22%", label: "Aumento Médio no Lucro" },
              ].map((stat) => (
                <GlassCard key={stat.label} className="p-4 md:p-6 text-center">
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl md:text-3xl font-bold text-white"><Counter end={parseInt(stat.value)} duration={3} />{stat.value.includes("+") ? "+" : stat.value.includes(".") ? ".9" : "%"}</p>
                  <p className="text-xs text-white/40 mt-1">{stat.label}</p>
                </GlassCard>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── BLOCO 6: PREÇOS ── */}
      <section id="precos" className="relative px-4 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Planos e Preços</h2>
            <p className="text-center text-white/50 max-w-2xl mx-auto mb-8">
              Escolha o plano ideal para a sua clínica. Todos incluem 14 dias de teste gratuito.
            </p>

            {/* Toggle anual/mensal */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-sm ${billing === "monthly" ? "text-white" : "text-white/40"}`}>Mensal</span>
              <button
                onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
                className={`relative h-7 w-12 rounded-full transition-colors ${billing === "annual" ? "bg-primary" : "bg-white/20"}`}
              >
                <motion.div
                  className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white"
                  animate={{ x: billing === "annual" ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-sm ${billing === "annual" ? "text-white" : "text-white/40"}`}>
                Anual
                <span className="ml-1.5 rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-semibold">Poupe 17%</span>
              </span>
            </div>
          </FadeUp>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                name: "Start",
                monthly: "€29",
                annual: "€24",
                desc: "Para consultórios individuais",
                features: ["Agenda inteligente", "Cadastro de pacientes", "Financeiro básico", "1 profissional"],
                featured: false,
              },
              {
                name: "Pro",
                monthly: "€59",
                annual: "€49",
                desc: "Mais Escolhido",
                features: ["Tudo do Start +", "Odontograma 3D", "Automação WhatsApp", "Split de comissões", "3 profissionais"],
                featured: true,
              },
              {
                name: "Elite",
                monthly: "€99",
                annual: "€82",
                desc: "Para clínicas multi-profissionais",
                features: ["Tudo do Pro +", "n8n dedicado", "Pré-anamnese automática", "Relatórios executivos", "Profissionais ilimitados"],
                featured: false,
              },
            ].map((plan, i) => (
              <FadeUp key={plan.name} delay={i * 0.1}>
                <GlassCard className={`relative p-8 h-full flex flex-col group hover:scale-[1.02] transition-all duration-300 ${plan.featured ? "border-primary/40 shadow-xl shadow-primary/10 scale-105" : ""}`}>
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white whitespace-nowrap">
                      Mais Escolhido
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-white/40 mt-1">{plan.desc}</p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">{billing === "monthly" ? plan.monthly : plan.annual}</span>
                      <span className="text-sm text-white/40">/mês</span>
                    </div>
                    {billing === "annual" && (
                      <p className="text-xs text-emerald-400 mt-1">Equivalente a {plan.monthly}/mês se pago mensalmente</p>
                    )}
                  </div>
                  <ul className="flex-1 space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-white/60">
                        <Check className={`h-4 w-4 shrink-0 ${plan.featured ? "text-primary" : "text-emerald-400"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.featured ? "default" : "outline"}
                    className="w-full"
                    onClick={() => scrollTo("lead")}
                  >
                    {plan.featured ? "Começar Teste Grátis" : "Saber Mais"}
                  </Button>
                </GlassCard>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOCO 7: FAQ ── */}
      <section id="faq" className="relative px-4 py-24 md:py-32 bg-white/[0.01] border-y border-white/[0.04]">
        <div className="mx-auto max-w-3xl">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Perguntas Frequentes</h2>
            <p className="text-center text-white/50 max-w-2xl mx-auto mb-12">
              Tire as suas dúvidas sobre o DentalOS
            </p>
          </FadeUp>

          <FadeUp>
            <GlassCard className="p-6 md:p-8 divide-y divide-white/[0.06]">
              <AccordionItem question="É difícil migrar os dados do meu sistema antigo?" answer="Não. A nossa equipa de engenharia faz a migração de todo o seu histórico de pacientes de forma 100% gratuita e segura." />
              <AccordionItem question="O meu número de WhatsApp corre o risco de ser banido?" answer="Não. O nosso motor n8n utiliza uma arquitetura transacional com intervalos aleatórios (Throttling inteligente), emulando o comportamento humano perfeito." />
              <AccordionItem question="O sistema está em conformidade com o RGPD?" answer="Sim. Todos os dados de saúde são encriptados na base de dados do Supabase e o acesso é isolado por clínica através de protocolos RLS rigorosos." />
              <AccordionItem question="Posso testar antes de comprar?" answer="Sim! Oferecemos 14 dias de teste gratuito em todos os planos, sem necessidade de cartão de crédito." />
              <AccordionItem question="Como funciona o cálculo de margem real?" answer="O DentalOS deduz automaticamente o custo de insumos (resinas, anestésicos), taxas de laboratório de prótese e a comissão do dentista. O lucro líquido é atualizado em tempo real." />
              <AccordionItem question="Quantos profissionais posso adicionar?" answer="No plano Start pode adicionar 1 profissional, no Pro até 3, e no Elite profissionais ilimitados. Todos os planos podem ser actualizados a qualquer momento." />
              <AccordionItem question="O sistema funciona em tablets e iPads?" answer="Sim. O DentalOS foi desenhado mobile-first e funciona perfeitamente em tablets, iPads e smartphones. Ideal para ser usado junto ao paciente." />
            </GlassCard>
          </FadeUp>
        </div>
      </section>

      {/* ── BLOCO 8: LEAD CAPTURE ── */}
      <section id="lead" className="relative px-4 py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-primary/10" />
        <div className="relative mx-auto max-w-xl">
          <FadeUp>
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pare de perder dinheiro em planilhas e consultas desmarcadas
              </h2>
              <p className="text-white/50">
                Leve a sua clínica para o nível premium hoje. Teste grátis por 14 dias.
              </p>
            </div>

            {leadSent ? (
              <GlassCard className="p-12 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                  <div className="flex justify-center mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                      <Check className="h-8 w-8 text-emerald-400" />
                    </div>
                  </div>
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">Recebemos o seu pedido!</h3>
                <p className="text-sm text-white/50">Entraremos em contacto em até 24 horas para agendar a sua demonstração.</p>
              </GlassCard>
            ) : (
              <GlassCard className="p-8 md:p-10">
                <form onSubmit={handleLeadSubmit} className="space-y-5">
                  {leadError && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                      {leadError}
                    </motion.div>
                  )}
                  <div className="space-y-2">
                    <label htmlFor="nome" className="text-sm text-white/60 flex items-center gap-2"><User className="h-3.5 w-3.5" /> Nome</label>
                    <Input id="nome" name="nome" placeholder="O seu nome completo" required className="bg-white/[0.04] border-white/[0.1] text-white placeholder:text-white/30" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm text-white/60 flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> E-mail</label>
                    <Input id="email" name="email" type="email" placeholder="seu@email.com" required className="bg-white/[0.04] border-white/[0.1] text-white placeholder:text-white/30" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="telefone" className="text-sm text-white/60 flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> Telemóvel (WhatsApp)</label>
                    <Input id="telefone" name="telefone" placeholder="+55 (11) 99999-9999" required className="bg-white/[0.04] border-white/[0.1] text-white placeholder:text-white/30" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="cadeiras" className="text-sm text-white/60 flex items-center gap-2"><Hash className="h-3.5 w-3.5" /> Número de Cadeiras/Dentistas na Clínica</label>
                    <Input id="cadeiras" name="cadeiras" type="number" min="1" placeholder="Ex: 3" required className="bg-white/[0.04] border-white/[0.1] text-white placeholder:text-white/30" />
                  </div>
                  <Button type="submit" className="w-full h-12 text-base shadow-lg shadow-emerald-500/20" disabled={sending}>
                    {sending ? (
                      <span className="flex items-center gap-2">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                        Enviando...
                      </span>
                    ) : "Experimentar 14 Dias Sem Compromisso"}
                  </Button>
                  <p className="text-xs text-center text-white/20">Sem cartão de crédito necessário · Cancelamento a qualquer momento</p>
                </form>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/[0.06]" /></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-[#002B36] px-3 text-white/30">ou</span></div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/50 mb-3">Prefere criar a conta agora e explorar por conta própria?</p>
                  <Link href="/cadastro">
                    <Button variant="outline" className="w-full h-11">Criar Conta Gratuita</Button>
                  </Link>
                </div>
              </GlassCard>
            )}
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              <span className="font-bold text-white">DentalOS</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/40">
              <Link href="#" className="hover:text-white/60 transition-colors">Privacidade</Link>
              <span className="text-white/10">·</span>
              <Link href="#" className="hover:text-white/60 transition-colors">Termos</Link>
              <span className="text-white/10">·</span>
              <Link href="#" className="hover:text-white/60 transition-colors">LGPD</Link>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.04] pt-6">
            <div className="flex items-center gap-4 text-xs text-white/20">
              <span>🔒 Criptografia ponta-a-ponta</span>
              <span>📋 RGPD compliant</span>
              <span>⚡ Supabase infraestrutura</span>
            </div>
            <p className="text-xs text-white/20">
              &copy; {new Date().getFullYear()} DentalOS. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* ── STICKY CTA MOBILE ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-[#002B36]/95 backdrop-blur-xl px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs">
            <p className="text-white font-semibold">14 Dias Grátis</p>
            <p className="text-white/40">Sem cartão de crédito</p>
          </div>
          <div className="flex gap-2">
            <Link href="/cadastro">
              <Button variant="outline" size="sm">Criar Conta</Button>
            </Link>
            <Button size="sm" className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-white" onClick={() => scrollTo("lead")}>
              Agendar Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
