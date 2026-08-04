"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquarePlus, Trash2, ChevronDown, ChevronUp, Clock } from "lucide-react"
import { useOdontogramaStore } from "@/store/odontograma-store"
import type { AnotacaoClinical } from "./types"
import { cn } from "@/lib/utils"

// ─── Formatador de data ───────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "2-digit",
      hour: "2-digit", minute: "2-digit",
    })
  } catch {
    return iso
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AnotacaoPanelProps {
  /** Número FDI do dente cujas anotações serão exibidas */
  toothNumber: number
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function AnotacaoPanel({ toothNumber }: AnotacaoPanelProps) {
  const anotacoes = useOdontogramaStore((s) => s.anotacoes[toothNumber]) ?? []
  const addAnotacao = useOdontogramaStore((s) => s.addAnotacao)
  const removeAnotacao = useOdontogramaStore((s) => s.removeAnotacao)

  const [texto, setTexto]       = useState("")
  const [expanded, setExpanded] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const MAX = 500

  const handleAdd = () => {
    if (!texto.trim()) return
    addAnotacao(toothNumber, texto)
    setTexto("")
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
          <MessageSquarePlus className="h-3.5 w-3.5" />
          Anotações Clínicas
          {anotacoes.length > 0 && (
            <span className="rounded-full bg-purple-500/25 px-1.5 py-0.5 text-[9px] font-bold text-purple-300/80">
              {anotacoes.length}
            </span>
          )}
        </span>
        {expanded
          ? <ChevronUp className="h-3.5 w-3.5 text-white/25" />
          : <ChevronDown className="h-3.5 w-3.5 text-white/25" />
        }
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-0.5">
              {/* Textarea de nova anotação */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value.slice(0, MAX))}
                  onKeyDown={handleKeyDown}
                  rows={3}
                  placeholder={`Anotação para dente ${toothNumber}...\n(Enter para salvar, Shift+Enter para nova linha)`}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.07] px-3 pt-3 pb-8 text-xs text-white/80 placeholder:text-white/20 resize-none outline-none focus:border-purple-500/40 focus:bg-purple-500/5 transition-all leading-relaxed"
                />
                {/* Contador e botão */}
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  <span className={cn(
                    "text-[9px] font-mono",
                    texto.length > MAX * 0.9 ? "text-red-400/60" : "text-white/20",
                  )}>
                    {texto.length}/{MAX}
                  </span>
                  <motion.button
                    onClick={handleAdd}
                    whileTap={{ scale: 0.9 }}
                    disabled={!texto.trim()}
                    className={cn(
                      "rounded-lg px-2 py-1 text-[10px] font-medium border transition-all",
                      texto.trim()
                        ? "border-purple-500/40 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                        : "border-white/[0.05] text-white/20 cursor-not-allowed",
                    )}
                  >
                    Salvar
                  </motion.button>
                </div>
              </div>

              {/* Lista de anotações */}
              {anotacoes.length === 0 ? (
                <p className="text-[10px] text-white/20 text-center py-2">
                  Nenhuma anotação para o dente {toothNumber}.
                </p>
              ) : (
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-0.5 scrollbar-thin">
                  <AnimatePresence>
                    {anotacoes.map((a: AnotacaoClinical) => (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, x: -10, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: "auto" }}
                        exit={{ opacity: 0, x: 10, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="group relative rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 overflow-hidden"
                      >
                        {/* Borda esquerda colorida */}
                        <div className="absolute left-0 inset-y-0 w-0.5 bg-purple-500/40 rounded-r-full" />

                        <p className="text-xs text-white/70 leading-relaxed break-words">
                          {a.texto}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="flex items-center gap-1 text-[9px] text-white/25">
                            <Clock className="h-2.5 w-2.5" />
                            {formatDate(a.criadoEm)}
                          </span>
                          <motion.button
                            onClick={() => removeAnotacao(toothNumber, a.id)}
                            whileTap={{ scale: 0.9 }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md p-1 text-red-400/50 hover:text-red-400 hover:bg-red-400/10"
                            title="Remover anotação"
                          >
                            <Trash2 className="h-3 w-3" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
