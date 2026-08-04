"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/queries"
import { FileDown } from "lucide-react"

interface ReciboProps {
  dados: {
    paciente: string
    profissional: string
    procedimento: string
    valor: number
    comissao: number
    lucro: number
    data: string
    formaPagamento: string
    clinicaNome: string
    clinicaCnpj?: string
  }
}

export function ReciboPrint({ dados }: ReciboProps) {
  const ref = useRef<HTMLDivElement>(null)

  const gerarPDF = async () => {
    if (!ref.current) return
    const html2pdf = (await import("html2pdf.js")).default
    const opt: Record<string, any> = {
      margin: [10, 10],
      filename: `recibo-${dados.paciente.replace(/\s+/g, "-").toLowerCase()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: "avoid-all" },
    }
    html2pdf().set(opt).from(ref.current).save()
  }

  return (
    <div>
      <Button onClick={gerarPDF} variant="outline">
        <FileDown className="mr-2 h-4 w-4" />
        Baixar Recibo PDF
      </Button>

      <div ref={ref} className="hidden">
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            maxWidth: 190,
            margin: "0 auto",
            padding: 20,
            color: "#111",
            fontSize: 12,
          }}
        >
          {/* Cabeçalho */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #111", paddingBottom: 12, marginBottom: 16 }}>
            <h1 style={{ fontSize: 20, fontWeight: "bold", margin: 0 }}>{dados.clinicaNome}</h1>
            {dados.clinicaCnpj && (
              <p style={{ fontSize: 10, color: "#555", margin: "4px 0 0" }}>
                CNPJ: {dados.clinicaCnpj}
              </p>
            )}
          </div>

          <h2 style={{ textAlign: "center", fontSize: 14, fontWeight: "bold", textTransform: "uppercase", margin: "0 0 16px" }}>
            Recibo de Pagamento
          </h2>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {[
                ["Paciente", dados.paciente],
                ["Profissional", dados.profissional],
                ["Procedimento", dados.procedimento],
                ["Data", new Date(dados.data).toLocaleDateString("pt-BR")],
                ["Forma de Pagamento", dados.formaPagamento],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{ padding: "4px 8px", fontWeight: "bold", width: "40%", borderBottom: "1px solid #ddd" }}>
                    {label}
                  </td>
                  <td style={{ padding: "4px 8px", borderBottom: "1px solid #ddd" }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 20, borderTop: "2px solid #111", paddingTop: 12 }}>
            <table style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: "bold" }}>Valor Bruto</td>
                  <td style={{ textAlign: "right" }}>{formatCurrency(dados.valor)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: "bold", color: "#888" }}>Comissão</td>
                  <td style={{ textAlign: "right", color: "#888" }}>{formatCurrency(dados.comissao)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: "bold", fontSize: 14 }}>Valor Líquido</td>
                  <td style={{ textAlign: "right", fontSize: 14, fontWeight: "bold" }}>
                    {formatCurrency(dados.lucro)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 30, textAlign: "center", fontSize: 10, color: "#888", borderTop: "1px solid #ddd", paddingTop: 12 }}>
            <p style={{ margin: 0 }}>Documento gerado por DentalOS</p>
            <p style={{ margin: "4px 0 0" }}>Sistema de Gestão Odontológica</p>
          </div>
        </div>
      </div>
    </div>
  )
}
