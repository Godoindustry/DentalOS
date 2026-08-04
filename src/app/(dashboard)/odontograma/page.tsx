"use client"

import { useState } from "react"
import { DerecLayout } from "@/components/odontograma/derec/derec-layout"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TrendingUp, TrendingDown, Users, Calendar, Clock, CreditCard, ChevronRight } from "lucide-react"

export default function OdontogramaPage() {
  const [activeTab, setActiveTab] = useState<"odontograma" | "historico">("odontograma")

  return (
    <div className="flex w-full h-[calc(100vh-5rem)] bg-slate-50 gap-6 overflow-hidden p-6 font-sans">
      
      {/* ── COLUNA CENTRAL (Paciente + Odontograma) ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Cabeçalho do Paciente */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 border-2 border-white shadow-sm ring-2 ring-teal-500/20">
              <AvatarFallback className="bg-gradient-to-br from-teal-400 to-teal-600 text-white font-bold text-lg">
                JM
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Juliana Martins</h2>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <span>Nasc. 15/03/1988 (36 anos)</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span>ID: <span className="font-mono">8521</span></span>
              </div>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button 
              onClick={() => setActiveTab("odontograma")}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "odontograma" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Odontograma
            </button>
            <button 
              onClick={() => setActiveTab("historico")}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "historico" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Histórico
            </button>
          </div>
        </div>

        {/* Odontograma DEREC.ch Style */}
        <div className="flex-1 min-h-0 relative rounded-2xl">
          {activeTab === "odontograma" ? (
            <DerecLayout />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 font-medium">
              Histórico Clínico da Paciente
            </div>
          )}
        </div>

      </div>

      {/* ── COLUNA DIREITA (Cards de Apoio) ── */}
      <div className="hidden lg:flex w-80 flex-col gap-6 h-full overflow-y-auto">
        
        {/* Card Financeiro */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Resumo Financeiro</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Faturamento (Mês)</p>
                <p className="text-2xl font-bold text-slate-800">R$ 45.230</p>
              </div>
              <div className="flex items-center gap-1 text-teal-500 bg-teal-50 px-2 py-1 rounded-md text-xs font-bold">
                <TrendingUp className="w-3 h-3" /> +12.5%
              </div>
            </div>

            <div className="h-px bg-slate-100 w-full" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1"><CreditCard className="w-3 h-3"/> Recebido</p>
                <p className="text-sm font-bold text-slate-700 mt-1">R$ 32.850</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3"/> A Receber</p>
                <p className="text-sm font-bold text-slate-700 mt-1">R$ 12.380</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Agendamentos */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col flex-1 min-h-0">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
            Agenda de Hoje
            <span className="bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full text-[10px]">12</span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            
            <AppointmentCard 
              time="09:00" 
              patient="Ana Paula Lima" 
              proc="Limpeza / Profilaxia" 
              status="confirmado" 
            />
            <AppointmentCard 
              time="10:30" 
              patient="João Victor Silva" 
              proc="Restauração Resina" 
              status="pendente" 
            />
            <AppointmentCard 
              time="11:45" 
              patient="Juliana Martins" 
              proc="Avaliação Periodontal" 
              status="em-atendimento" 
              active
            />
            <AppointmentCard 
              time="14:00" 
              patient="Marcos Nogueira" 
              proc="Extração Siso" 
              status="confirmado" 
            />
            <AppointmentCard 
              time="15:30" 
              patient="Carla Dias" 
              proc="Revisão Aparelho" 
              status="pendente" 
            />

          </div>

          <button className="mt-4 w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-semibold transition-colors flex items-center justify-center gap-1">
            Ver agenda completa <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  )
}

function AppointmentCard({ time, patient, proc, status, active }: any) {
  const statusColors = {
    confirmado: "bg-teal-50 text-teal-600 border-teal-100",
    pendente: "bg-yellow-50 text-yellow-600 border-yellow-100",
    "em-atendimento": "bg-blue-50 text-blue-600 border-blue-100"
  }
  const statusLabels = {
    confirmado: "Confirmado",
    pendente: "Pendente",
    "em-atendimento": "Em Atendimento"
  }

  return (
    <div className={`p-3 rounded-xl border transition-all ${
      active 
        ? "border-blue-500/30 bg-blue-50/50 shadow-sm" 
        : "border-slate-100 hover:border-slate-200"
    }`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-sm">
          {time}
        </span>
        <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border ${statusColors[status as keyof typeof statusColors]}`}>
          {statusLabels[status as keyof typeof statusLabels]}
        </span>
      </div>
      <p className="text-sm font-bold text-slate-800">{patient}</p>
      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{proc}</p>
    </div>
  )
}
