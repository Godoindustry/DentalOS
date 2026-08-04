import type { DenteData } from "./types"
import { FACE_CONFIG, PROCEDIMENTOS } from "./types"

// ─── Exportação JSON ──────────────────────────────────────────────────────────

export function exportarJSON(
  arcadaSup: DenteData[],
  arcadaInf: DenteData[],
  anotacoes: Record<number, { id: string; toothNumber: number; texto: string; criadoEm: string }[]>,
  nomePaciente?: string,
): void {
  const payload = {
    exportadoEm: new Date().toISOString(),
    paciente: nomePaciente ?? "Desconhecido",
    arcadaSuperior: arcadaSup,
    arcadaInferior: arcadaInf,
    anotacoes,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href     = url
  a.download = `odontograma-${nomePaciente?.replace(/\s+/g, "_") ?? "paciente"}-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Exportação PDF via Print ─────────────────────────────────────────────────

/**
 * Exporta o odontograma como PDF abrindo uma janela de impressão estilizada.
 * Usa apenas a API nativa do navegador — sem dependências externas.
 */
export function exportarPDF(
  arcadaSup: DenteData[],
  arcadaInf: DenteData[],
  anotacoes: Record<number, { id: string; toothNumber: number; texto: string; criadoEm: string }[]>,
  nomePaciente?: string,
  svgHtml?: string,
): void {
  const now = new Date()
  const dataFormatada = now.toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  })

  // Lista de procedimentos aplicados
  const procedimentosAplicados: { dente: number; face: string; status: string; cor: string }[] = []
  for (const d of [...arcadaSup, ...arcadaInf]) {
    if (d.ausente) {
      procedimentosAplicados.push({ dente: d.numero, face: "—", status: "Ausente", cor: "#9CA3AF" })
    }
    if (d.implante) {
      procedimentosAplicados.push({ dente: d.numero, face: "—", status: "Implante", cor: "#06B6D4" })
    }
    if (d.extracao) {
      procedimentosAplicados.push({ dente: d.numero, face: "—", status: "Extração Indicada", cor: "#8B5CF6" })
    }
    for (const face of d.faces) {
      if (face.status !== "saudavel") {
        const cfg = FACE_CONFIG[face.status]
        procedimentosAplicados.push({
          dente: d.numero,
          face: face.id.charAt(0).toUpperCase() + face.id.slice(1),
          status: cfg?.label ?? face.status,
          cor: cfg?.cor ?? "#9CA3AF",
        })
      }
    }
  }

  // Anotações para exibição
  const todasAnotacoes = Object.entries(anotacoes).flatMap(([num, notas]) =>
    notas.map((n) => ({ ...n, toothNumber: Number(num) })),
  ).sort((a, b) => a.toothNumber - b.toothNumber)

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Odontograma — ${nomePaciente ?? "Paciente"}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #fff;
      color: #1a1a2e;
      padding: 32px 40px;
      font-size: 12px;
    }
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .logo { font-size: 20px; font-weight: 800; color: #7c3aed; }
    .logo span { color: #06b6d4; }
    .meta { text-align: right; font-size: 11px; color: #6b7280; }
    .meta strong { color: #1a1a2e; font-size: 14px; display: block; margin-bottom: 4px; }
    .section-title {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: #6b7280;
      margin: 20px 0 10px;
    }
    .svg-container {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 16px;
      background: #1a1a2e;
      display: flex;
      justify-content: center;
    }
    .svg-container svg { max-width: 100%; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th {
      background: #f3f4f6; text-align: left;
      padding: 6px 10px; font-weight: 600;
      border-bottom: 1px solid #e5e7eb;
    }
    td { padding: 5px 10px; border-bottom: 1px solid #f3f4f6; }
    tr:nth-child(even) td { background: #fafafa; }
    .dot {
      display: inline-block; width: 8px; height: 8px;
      border-radius: 2px; margin-right: 6px; vertical-align: middle;
    }
    .nota-row { margin-bottom: 8px; border-left: 3px solid #7c3aed; padding-left: 10px; }
    .nota-tooth { font-weight: 700; color: #7c3aed; font-size: 11px; }
    .nota-text { color: #374151; margin: 2px 0; }
    .nota-date { color: #9ca3af; font-size: 10px; }
    .empty { color: #9ca3af; font-style: italic; }
    .footer {
      margin-top: 32px; padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      font-size: 10px; color: #9ca3af;
      display: flex; justify-content: space-between;
    }
    @media print {
      body { padding: 16px 20px; }
      @page { margin: 0.5cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Odonto<span>Lab</span></div>
      <div style="font-size:11px;color:#6b7280;margin-top:4px">Odontograma Clínico Interativo</div>
    </div>
    <div class="meta">
      <strong>${nomePaciente ?? "Paciente não identificado"}</strong>
      Data: ${dataFormatada}<br/>
      Dentição adulta (ISO 3950 / FDI)
    </div>
  </div>

  ${svgHtml ? `
  <div class="section-title">Odontograma</div>
  <div class="svg-container">${svgHtml}</div>
  ` : ""}

  <div class="section-title">Resumo de Procedimentos (${procedimentosAplicados.length})</div>
  ${procedimentosAplicados.length === 0 ? `<p class="empty">Nenhum procedimento registrado.</p>` : `
  <table>
    <thead>
      <tr>
        <th>Dente</th>
        <th>Face</th>
        <th>Status / Procedimento</th>
      </tr>
    </thead>
    <tbody>
      ${procedimentosAplicados.map((p) => `
        <tr>
          <td><strong>${p.dente}</strong></td>
          <td>${p.face}</td>
          <td>
            <span class="dot" style="background:${p.cor}"></span>
            ${p.status}
          </td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  `}

  <div class="section-title">Anotações Clínicas (${todasAnotacoes.length})</div>
  ${todasAnotacoes.length === 0 ? `<p class="empty">Nenhuma anotação registrada.</p>` : `
  <div>
    ${todasAnotacoes.map((a) => `
      <div class="nota-row">
        <div class="nota-tooth">Dente ${a.toothNumber}</div>
        <div class="nota-text">${a.texto}</div>
        <div class="nota-date">${new Date(a.criadoEm).toLocaleString("pt-BR")}</div>
      </div>
    `).join("")}
  </div>
  `}

  <div class="footer">
    <span>OdontoLab &copy; ${now.getFullYear()}</span>
    <span>Gerado em: ${now.toLocaleString("pt-BR")}</span>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`

  const win = window.open("", "_blank", "width=900,height=700")
  if (!win) {
    alert("Permita pop-ups para exportar o PDF.")
    return
  }
  win.document.write(html)
  win.document.close()
}
