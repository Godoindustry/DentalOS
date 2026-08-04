# 🦷 DentalOS - Master Design, Engineering & UI Skill Guide

Este documento consolida as especificações de UI/UX, arquitetura de Landing Page, engenharia do módulo de Odontograma e a metodologia da skill de design clínico para o **DentalOS**. O objetivo é servir como uma única fonte de verdade para designers, engenheiros de software e especialistas em marketing.

---

## 🎨 1. A Skill Chave: Design de Dados Clínicos com Redução de Carga Cognitiva

Para o nicho odontológico, o design "impecável" vai além da estética: ele trata da eficiência sob pressão e da ergonomia visual. A aplicação desta skill divide-se em quatro pilares fundamentais:

### 1.1. Psicologia das Cores Clínicas (UI/UX)
*   **Tema Escuro Sofisticado:** Fundos base em tons de **Azul Petróleo Profundo / Ciano Escuro** (`#002B36` a `#0A424F`). Esta paleta reduz drasticamente a fadiga ocular sob as luzes fortes do consultório e emula telas de equipamentos cirúrgicos de alta tecnologia.
*   **Paleta Semáforo Pastel:** Cores de alertas, diagnósticos ou status nunca devem ser puras ou fluorescentes. Utilizam-se tons suavizados e elegantes para manter o contraste focado e profissional.

### 1.2. Engenharia de Gráficos Context-Aware
*   **Gráfico Donut Avançado:** Gráficos financeiros que deduzem automaticamente custos variáveis (insumos, taxas de protéticos) e divisões de comissões. O miolo exibe o valor bruto de forma limpa, enquanto as fatias contam a história da margem líquida real.
*   **Sparklines de Ocupação:** Micrográficos de linha integrados aos cards secundários para exibir a taxa de ocupação das cadeiras da clínica em tempo real, sem poluir a área principal.

### 1.3. Manipulação Vetorial Dinâmica (Mapeamento SVG)
*   **Gráficos Anatômicos Clicáveis:** Uso de gradientes e máscaras de sombreamento no vetor para criar profundidade fotorrealista sem o peso de motores 3D (WebGL).
*   **Segmentação por Paths:** Cada elemento dentário é quebrado em múltiplos caminhos representando as faces clínicas, reagindo a eventos de *hover* e cliques com precisão cirúrgica.

### 1.4. Design de Segurança Visível (UI Trust)
*   **Badges de Imutabilidade:** Componentes específicos com efeito de vidro fosco para sinalizar que uma anamnese está criptografada e assinada digitalmente (ex: `Signed SHA-256`), gerando confiança jurídica imediata.

---

## 🖥️ 2. Especificação do Dashboard Premium

### 2.1. Layout e Componentes
*   **Menu Lateral Ocultável (Sidebar):** No canto superior esquerdo, um botão de menu hambúrguer (`☰`) permite recolher a barra de navegação suavemente através de uma transição CSS (*slide-out*), expandindo a área útil do dashboard para 100% da tela.
*   **Grid de Widgets (Bordas e Sombras):** Organização em cartões com **cantos arredondados suavizados** (border-radius entre `12px` e `16px`). As bordas dos cartões possuem uma linha interna finíssima (1px com opacidade baixa) para o efeito de vidro lapidado (*Glassmorphism*).
*   **Cabeçalho Superior (Topbar):** Barra transparente exibindo localização da clínica, ícones minimalistas de mensagens, notificações com badge de alerta discreto e perfil do profissional com menu *dropdown*.

---

## 🚀 3. Estrutura de Conversão: Landing Page Premium

### 3.1. Arquitetura de Blocos da LP
1.  **A Hero Section (O Topo):**
    *   *H1:* "O controlo financeiro e a automação que a sua clínica merece. Sem esforço."
    *   *Subtítulo:* "Vá além da agenda básica. Descubra a margem de lucro real de cada procedimento, automatize a confirmação de consultas via WhatsApp e ofereça um prontuário 3D fotorrealista."
    *   *CTA:* Botão `[ Agendar Demonstração Gratuita ]` em verde-esmeralda com efeito pulsar sutil.
2.  **A Dor Oculta (Agitação do Problema):** Demonstração visual de como os softwares comuns ignoram os custos flutuantes de materiais e protéticos, minando a margem de lucro real do dentista.
3.  **Os 3 Pilares de Ouro:** Apresentação das features: Inteligência Financeira Cirúrgica, Secretária Virtual 24/7 (n8n + WhatsApp) e Odontograma Interativo.
4.  **Demonstração Visual:** Mockup de alta fidelidade mostrando a interface do sistema com o menu lateral ocultado.
5.  **Prova Social Avançada:** Depoimentos reais de dentistas com foto, nome, cédula profissional e cidade.
6.  **Planos e Preços:** Cards transparentes estilo *glassmorphism* divididos em *Start*, *Pro* (Recomendado) e *Elite/Clinic*.
7.  **FAQ (Quebra de Objeções):** Respostas sobre migração gratuita de dados, segurança contra banimento no WhatsApp e conformidade estrita com o RGPD.

---

## 🦷 4. Guia Técnico do Odontograma Interativo

### 4.1. Mapeamento de Faces e Estados
Cada dente possui um grupo de caminhos (`<path>`) representando suas faces clínicas (Vestibular, Lingual, Palatina, Oclusal, Mesial, Distal). Ao clicar, abre-se um componente Popover translúcido (Shadcn/ui) para alteração de status.

### 4.2. Arquitetura de Dados (TypeScript)
```typescript
interface FaceDente {
  id: 'vestibular' | 'lingual' | 'palatina' | 'oclusal' | 'mesial' | 'distal';
  status: 'saudavel' | 'carie' | 'restaurado' | 'planejado';
  observacoes?: string;
}

interface DenteData {
  numero: number;
  nome: string;
  ausente: boolean;
  implante: boolean;
  coroa: boolean;
  faces: FaceDente[];
}
```

### 4.3. Legenda e Mapeamento de Cores UI
*   **Cárie / Patologia Ativa:** `#EF4444` (Preenchimento translúcido na face afetada).
*   **Procedimento Planejado:** `#F59E0B` (Borda tracejada ou preenchimento amarelo fosco).
*   **Tratamento Concluído:** `#10B981` (Selo esmeralda ou check sutil).
*   **Elemento Ausente / Extraído:** Opacidade reduzida para 20% no elemento SVG.

---

## 🛠️ 5. Diretrizes de Desenvolvimento Front-End
1.  **Estilização:** Utilizar **Tailwind CSS** e **Shadcn/ui** aplicados com as classes `backdrop-blur-md` e `bg-white/10`.
2.  **Animações:** Transições de abertura dos menus, recolhimento da sidebar e carregamento dos gráficos devem usar **Framer Motion** com curvas suaves (*ease-in-out*) e duração de `0.3s`.
3.  **Integração:** O formulário da Landing Page deve enviar os leads diretamente para o banco de dados do **Supabase** (tabela `leads`) e disparar e-mails automáticos transacionais usando o **Resend**.
