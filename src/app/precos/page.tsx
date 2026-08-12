import { PageTransition } from "@/components/ui/page-transition"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Check, Stethoscope, Zap, Crown } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Basic",
    price: "R$ 297",
    period: "/mês",
    description: "Funcionalidades essenciais para clínicas em crescimento",
    icon: Stethoscope,
    features: [
      "Pacientes",
      "Profissionais",
      "Agendamentos",
      "Financeiro básico",
    ],
    highlighted: false,
    cta: "Assinar Basic",
  },
  {
    name: "Professional",
    price: "R$ 497",
    period: "/mês",
    description: "Tudo do Basic + automação e relatórios avançados",
    icon: Zap,
    features: [
      "Tudo do Basic",
      "Bot de atendimento",
      "Google Calendar",
      "Relatórios avançados",
    ],
    highlighted: true,
    cta: "Assinar Professional",
  },
  {
    name: "Enterprise",
    price: "R$ 897",
    period: "/mês",
    description: "Tudo do Professional + multi-clínica e suporte prioritário",
    icon: Crown,
    features: [
      "Tudo do Professional",
      "Multi-clínica",
      "Suporte prioritário",
      "Integrações customizadas",
    ],
    highlighted: false,
    cta: "Assinar Enterprise",
  },
]

export default function PrecosPage() {
  return (
    <PageTransition className="min-h-screen">
      <div className="relative overflow-hidden py-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#002B36] via-[#0A424F] to-[#002B36]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.05),transparent_50%)]" />

        <div className="relative mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
              Planos e Preços
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Escolha o plano ideal para sua clínica. Todos os planos incluem 14 dias grátis.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon
              return (
                <Card
                  key={plan.name}
                  className={`relative border-white/[0.08] shadow-2xl shadow-black/30 ${
                    plan.highlighted
                      ? "border-primary/50 bg-gradient-to-b from-primary/10 to-transparent"
                      : ""
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-[#042f34]">
                        Mais popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-3">
                      <div
                        className={`rounded-2xl p-3 ${
                          plan.highlighted
                            ? "bg-primary/20 shadow-lg shadow-primary/20"
                            : "bg-white/10"
                        }`}
                      >
                        <Icon
                          className={`h-6 w-6 ${
                            plan.highlighted ? "text-primary" : "text-white/70"
                          }`}
                        />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-white">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <span className="text-4xl font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="text-white/60">{plan.period}</span>
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm text-white/80">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className={`w-full h-11 ${
                        plan.highlighted
                          ? "bg-primary text-[#042f34] hover:bg-primary/90"
                          : "bg-white/10 text-white hover:bg-white/15 border border-white/10"
                      }`}
                      asChild
                    >
                      <Link href="/ativar">{plan.cta}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-white/40">
              Tem dúvidas?{" "}
              <Link href="#" className="text-primary hover:underline">
                Fale com o suporte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
