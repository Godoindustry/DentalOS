import Link from "next/link"
import {
  Check,
  Stethoscope,
  Users,
  Building2,
  Network,
  MessageCircle,
  ArrowRight,
} from "lucide-react"

const WHATSAPP_VENDAS = "5511966230438"

const plans = [
  {
    name: "Individual",
    price: "R$ 247",
    period: "/mês",
    description: "1 dentista + bot de WhatsApp com IA para captação e agendamento.",
    icon: Stethoscope,
    highlighted: false,
    features: [
      "1 dentista titular com login próprio",
      "Bot de WhatsApp com IA: capta leads, faz triagem de urgência e coleta a ficha de anamnese",
      "Agendamento sincronizado automaticamente com o Google Calendar",
      "Confirmação automática de consulta via WhatsApp",
      "Cadastro de pacientes com prontuário e histórico completo",
      "Anamnese digital estruturada",
      "Odontograma interativo (2D) + visualização 3D",
      "Faturamento com cálculo automático de comissão e lucro líquido por procedimento",
      "Dashboard executivo: faturamento, KPIs, procedimentos mais lucrativos",
      "Verificação de CRO (formato + conferência assistida)",
      "Suporte por e-mail",
    ],
  },
  {
    name: "Clínica",
    price: "R$ 697",
    period: "/mês",
    description: "Tudo do Individual + até 4 perfis (dentistas, cadeiras ou salas), com você como administrador geral.",
    icon: Users,
    highlighted: true,
    badge: "Mais popular",
    features: [
      "Tudo do plano Individual",
      "Até 4 perfis (dentistas sublocatários, cadeiras ou salas)",
      "Você como administrador geral — visão completa da clínica",
      "1 bot de WhatsApp dedicado para cada profissional",
      "Controle de acesso por papel: sublocatário só vê seus próprios pacientes e agenda",
      "Módulo de sublocação de cadeiras/salas com cobrança automática (valor fixo ou % do faturamento)",
      "Relatórios consolidados de toda a clínica",
      "Suporte prioritário",
    ],
  },
  {
    name: "Clínica Plus",
    price: "R$ 1.297",
    period: "/mês",
    description: "Tudo do Clínica + até 8 perfis, para clínicas maiores com múltiplos consultórios.",
    icon: Building2,
    highlighted: false,
    features: [
      "Tudo do plano Clínica",
      "Até 8 perfis (dentistas sublocatários, cadeiras ou salas)",
      "1 bot de WhatsApp dedicado para cada profissional",
      "Relatórios comparativos entre profissionais",
      "Suporte prioritário com SLA",
    ],
  },
]

const b2bFeatures = [
  "Site institucional personalizado para sua marca",
  "Sistema ERP completo, sob sua marca (white label)",
  "Bot de WhatsApp com IA dedicado",
  "Banco de dados próprio e hospedagem inclusa",
  "Cadastro e onboarding completo assistido pela nossa equipe",
  "Dashboard personalizado por marca",
  "Acesso ao agente financeiro parceiro",
]

export default function PrecosPage() {
  const whatsappHref = `https://wa.me/${WHATSAPP_VENDAS}?text=${encodeURIComponent(
    "Olá! Quero saber mais sobre o plano B2B / Rede do DentalOS."
  )}`

  return (
    <div className="min-h-screen bg-[#F7FAFA] text-[#0B2E33]">
      {/* Tech grid backdrop */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(13,148,136,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(13,148,136,0.08) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(13,148,136,0.10),transparent_55%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <div className="text-center mb-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0D9488]/20 bg-[#0D9488]/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0D9488]">
            <Stethoscope className="h-3.5 w-3.5" />
            DentalOS
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#0B2E33] mb-4">
            Planos e Preços
          </h1>
          <p className="text-lg text-[#4B6B70] max-w-2xl mx-auto">
            Da clínica de um dentista só até uma rede completa. Escolha o plano ideal e comece hoje.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-lg ${
                  plan.highlighted
                    ? "border-[#0D9488] shadow-md ring-1 ring-[#0D9488]/20"
                    : "border-[#0B2E33]/[0.08]"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-[#0D9488] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      plan.highlighted ? "bg-[#0D9488] text-white" : "bg-[#0D9488]/10 text-[#0D9488]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0B2E33]">{plan.name}</h3>
                </div>
                <p className="text-sm text-[#4B6B70] mb-5 min-h-[40px]">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#0B2E33]">{plan.price}</span>
                  <span className="text-[#7C979B]">{plan.period}</span>
                </div>
                <ul className="mb-6 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0D9488]" />
                      <span className="text-sm text-[#2A4448]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/ativar"
                  className={`flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? "bg-[#0D9488] text-white hover:bg-[#0B7C72]"
                      : "border border-[#0B2E33]/15 bg-white text-[#0B2E33] hover:bg-[#0D9488]/[0.05]"
                  }`}
                >
                  Assinar {plan.name}
                </Link>
              </div>
            )
          })}
        </div>

        {/* B2B — preço oculto, CTA pro WhatsApp */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-[#0B2E33]/10 bg-gradient-to-br from-[#0B2E33] to-[#0D5B54] p-8 sm:p-10 text-white shadow-lg">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                <Network className="h-5 w-5 text-[#4FD1C5]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#4FD1C5]">Plano 4 · B2B / Rede</span>
              </div>
              <h3 className="mb-2 text-2xl font-bold">Automação completa da sua rede odontológica</h3>
              <p className="mb-4 max-w-xl text-sm text-white/70">
                Site, sistema, bot, banco de dados e hospedagem — tudo sob sua marca, com onboarding assistido pela nossa equipe.
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {b2bFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/85">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#4FD1C5]" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full shrink-0 sm:w-auto">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4FD1C5] px-6 text-sm font-semibold text-[#042f34] transition-colors hover:bg-[#6EE7B7] sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" />
                Falar com nosso assistente
                <ArrowRight className="h-4 w-4" />
              </a>
              <p className="mt-2 text-center text-xs text-white/40">Clique para saber mais</p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-[#7C979B]">
            Todos os planos incluem 14 dias de teste gratuito.{" "}
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="text-[#0D9488] hover:underline">
              Fale com o suporte
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
