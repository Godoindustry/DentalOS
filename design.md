# 🎨 Especificação de Design System & UI/UX: DentalOS Premium

Este documento serve como a diretriz oficial de design, layout e experiência do usuário (UI/UX) para o desenvolvimento da interface do **DentalOS**. O objetivo é orientar designers e desenvolvedores front-end na construção de uma interface minimalista, de altíssimo valor percebido (padrão internacional de luxo) e focada na redução da carga cognitiva do dentista.

---

## 🌓 1. Conceito Geral e Atmosfera Visual (Look & Feel)

*   **Estilo Principal:** *Glassmorphism* (Efeito Vidro Fosco/Frosted Glass) moderno, combinado com uma estética médica minimalista e de alta tecnologia.
*   **Paleta de Cores Dominante (Dark Mode/Deep Theme):**
    *   **Fundo da Aplicação:** Base escura em tons de **Azul Petróleo Profundo / Ciano Escuro** (`#002B36` a `#0A424F`). Transmite seriedade, tecnologia, inovação e exclusividade.
    *   **Cartões e Containers:** Tons claros de cinza azulado com opacidade reduzida e efeito de desfoque de fundo (*backdrop-filter: blur*), criando uma superfície translúcida.
    *   **Textos e Dados:** Branco puro para títulos e dados de destaque; cinza claro texturizado para descrições secundárias.
*   **Cores de Destaque Clínico (Pastel Semáforo):** 
    *   `#EF4444` (Vermelho Suave): Diagnósticos ativos, cáries ou alertas de alergias críticas.
    *   `#F59E0B` (Amarelo/Laranja Pastel): Procedimentos planejados, coroas ou respostas pendentes no bot.
    *   `#10B981` (Verde Esmeralda Suave): Procedimentos concluídos, consultas confirmadas automaticamente e segurança jurídica.
    *   `#3B82F6` (Azul Royal): Especialidades como Ortodontia ou implantes finalizados.

---

## 📐 2. Layout, Organização e Componentes (Grid & Hierarchy)

### 2.1. Menu Lateral Ocultável (Sidebar)
*   **Comportamento:** Posicionado à esquerda, contendo o logotipo "DentalOS". Deve haver um botão de menu hambúrguer (`☰`) bem definido ao lado da marca.
*   **Ação:** Ao ser clicado, a barra lateral de navegação deve recolher suavemente através de uma animação CSS elegante (*slide-out* ou transição de *width*), expandindo a área útil do dashboard para 100% da tela. Os ícones devem ser exclusivos, de traço fino (estilo *linear icons*).

### 2.2. Grid de Widgets (Bordas e Sombras)
*   **Geometria:** Todos os blocos de conteúdo (Daily Overview, Faturamento, Odontograma, Prontuário) devem ser organizados em um formato de Grid flexível (utilizando *CSS Grid* ou *Flexbox*).
*   **Acabamento Premium:** Cartões com **cantos arredondados suavizados** (border-radius entre `12px` e `16px`). As bordas dos cartões devem ter uma linha interna finíssima e sutil (1px com opacidade muito baixa) para simular o efeito de profundidade física e vidro lapidado.

### 2.3. Cabeçalho Superior (Topbar)
*   **Elementos:** Uma barra limpa e transparente no topo que exibe a localização da clínica (com ícone de pin), ícones minimalistas de mensagens, notificações com badge de alerta vermelho discreto, e a foto de perfil arredondada do Dr. Moraes com um menu de contexto *dropdown*.

---

## 🦷 3. Componentes Especializados e Telas Críticas

### 3.1. Módulo Central: Odontograma 3D Fotorrealista
*   **Visual Avançado:** Substituir o desenho clássico em 2D por uma renderização de aspecto **3D fotorrealista**, exibindo texturas suaves de esmalte nos dentes e o tom rosado natural da gengiva. O formato geral mantém a disposição em arco (U-shape) para visualização rápida.
*   **Interatividade (Popover):** Ao passar o mouse (*hover*) ou clicar em um dente específico (ex: dente 10 ou 16), um menu flutuante (*popover*) elegante, translúcido e sem bordas duras deve aparecer com opções rápidas: `"Options"`, `"Notes"`, `"Treatments"`.
*   **Legenda Integrada:** Na base do widget do odontograma, uma legenda minimalista com pequenos círculos/quadrados coloridos identifica o status clínico de forma limpa (Cárie, Coroa, Planejado, Concluído).

### 3.2. Módulo Financeiro: Faturamento Avançado por Serviço
*   **Visual do Gráfico:** Um gráfico no estilo *Donut* (Rosca) centralizado de alta definição. O miolo branco exibe o faturamento total bruto em destaque (ex: `$4,500 Total`).
*   **Segmentação de Margem:** Divisão perfeita por fatias coloridas que representam o faturamento por especialidade:
    *   **Orthodontics:** 35% (Gradiente azul profundo)
    *   **Implants:** 25% (Gradiente ciano)
    *   **Endodontics:** 20% (Gradiente verde)
    *   **Restorations:** 20% (Gradiente verde claro)
*   **Tooltips:** Ao passar o mouse sobre as fatias, um *tooltip* flutuante em modo escuro exibe o valor líquido real deduzido dos custos de insumos.

### 3.3. Módulo de Automação: Comunicação Ativa (n8n/WhatsApp)
*   **Visual de Feed:** Posicionado na parte inferior central, o widget "Automated Communication" atua como um log vivo das ações do bot de atendimento.
*   **Cards de Status Dinâmicos:** Barras horizontais inteiriças com cantos arredondados e cores de fundo suaves que indicam o progresso:
    *   **Verde Claro (Sucesso/Automático):** `● Mariana Costa - Confirmed 15:00 (Auto)` indica que o n8n interceptou a resposta positiva do paciente e atualizou o banco.
    *   **Amarelo Pastel (Aguardando):** `● Luiz Silva - Pending response` mostra consultas enviadas que ainda não obtiveram retorno do paciente.

### 3.4. Módulo Lateral: Prontuário Rápido e Alertas Críticos
*   **Perfil do Paciente:** Um mini-card no topo direito com a foto da paciente atual (ex: Mariana Costa), nome em destaque, dados da última visita e link para histórico completo.
*   **Dados Críticos (Safety First):** Um bloco com fundo contrastante dedicado exclusivamente a informações de risco vital para o dentista ver antes de iniciar o procedimento (Alergias a Medicamentos como *Amoxicillin* e Condições como *Cardiopatia*).
*   **Segurança Legal (LGPD):** Um indicador visual com ícone de "check" esverdeado confirmando que a anamnese foi preenchida pelo paciente e assinada eletronicamente (`Signed SHA-256`), garantindo a imutabilidade jurídica dos dados.

---

## 🛠️ 4. Diretrizes para o Time de Desenvolvimento Front-End

1.  **Tailwind CSS & Shadcn/ui:** Utilizar componentes base do Shadcn/ui customizados com as cores de fundo escuras do tema. Aplicar a classe `backdrop-blur-md` e `bg-white/10` para obter o efeito glassmorphism nos cards.
2.  **Animações com Framer Motion:** Transições de abertura de popovers, recolhimento do menu lateral e carregamento dos gráficos de pizza devem ter curvas de animação suaves (*ease-in-out*) e duração máxima de `0.3s`.
3.  **Acessibilidade de Contraste:** Embora o tema seja escuro e elegante, garanta que os textos críticos (como as alergias do paciente) tenham contraste WCAG AAA para leitura imediata sob as luzes fortes do consultório odontológico.
