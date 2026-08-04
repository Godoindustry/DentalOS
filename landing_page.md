# 🚀 Estrutura de Conversão: Landing Page Premium (DentalOS)

Este documento estabelece a arquitetura de blocos, copywriting, gatilhos mentais e requisitos de design para a Landing Page do **DentalOS**. O objetivo é transformar tráfego qualificado (dentistas e donos de clínicas) em demonstrações agendadas ou subscrições ativas.

---

## 🎨 Diretrizes Visuais Gerais (Alinhamento com o SaaS)
* **Tema:** Dark Mode de Luxo (combinando com a interface do sistema). Fundo em azul-petróleo escuro (`#002B36`) com elementos em neon cirúrgico (ciano ou verde esmeralda suave) para botões de CTA (Call to Action).
* **Performance:** Carregamento em menos de 1.5 segundos (crítico para anúncios mobile). Pontuação máxima no Google PageSpeed Insights (uso de Next.js, imagens em WebP/AVIF e código limpo).
* **Vídeos e Animações:** Um vídeo em alta definição (ou animação Lottie) logo no primeiro bloco mostrando a interface 3D do odontograma e o painel financeiro a atualizar em tempo real.

---

## 🧱 Arquitetura de Blocos (Passo a Passo)

### Bloco 1: A Hero Section (O Topo da Página)
*O objetivo aqui é fazer o dentista parar de fazer scroll. Deve responder a: O que é? Para quem é? Que benefício traz?*
* **Título Principal (H1):** "O controlo financeiro e a automação que a sua clínica merece. Sem esforço."
* **Subtítulo:** "Vá além da agenda básica. Descubra a margem de lucro real de cada procedimento, automatize a confirmação de consultas via WhatsApp e ofereça um prontuário 3D fotorrealista. Criado exclusivamente para dentistas de alta performance."
* **CTA Principal (Botão):** [ Agendar Demonstração Gratuita ] (Cor esmeralda vibrante, efeito pulsar sutil).
* **Prova Social Imediata:** Abaixo do botão: "⭐ Classificado com 4.9/5 por mais de 340 clínicas em Portugal."

### Bloco 2: A Dor Oculta (Agitação do Problema)
*Dentistas odeiam burocracia e perdem dinheiro sem saber porquê. Vamos expor isso de forma elegante.*
* **Título:** "Sabe quanto lucrou verdadeiramente no último implante?"
* **Texto/Tópicos:**
    * *O Erro Comum:* A maioria dos softwares regista apenas a entrada do dinheiro, mas ignora o custo flutuante das resinas, anestésicos e taxas do laboratório de prótese.
    * *A Consequência:* Trabalhar muito, ver o consultório cheio, mas chegar ao fim do mês com a sensação de que a margem sumiu.
    * *A Solução:* O DentalOS calcula o custo marginal de forma invisível. Abriu a ficha? O lucro líquido real já está calculado.

### Bloco 3: Os 3 Pilares de Ouro (Funcionalidades Premium)
*Divisão visual em 3 colunas limpas com ícones lineares minimalistas.*

1.  **Inteligência Financeira Cirúrgica**
    * Dedução automática de insumos e comissões de dentistas parceiros. Dashboards executivos com gráficos interativos que mostram quais os serviços mais lucrativos da sua clínica.
2.  **Secretária Virtual 24/7 (n8n + WhatsApp)**
    * Chega de passar horas a ligar para confirmar consultas. O nosso assistente inteligente envia mensagens humanizadas com delays de segurança. O paciente confirma no WhatsApp e o status muda na sua agenda em tempo real.
3.  **Odontograma 3D e Segurança Jurídica**
    * Exporte a experiência clínica para o futuro. Um mapa dentário 3D interativo para diagnósticos precisos e fichas de anamnese 100% imutáveis com assinatura digital criptografada (SHA-256). Proteção total contra processos e conformidade estrita com o RGPD.

### Bloco 4: Demonstração Visual (A Prova Viva)
* **Elemento Visual:** Um mockup gigante de um MacBook Pro ou iPad Pro mostrando a tela do sistema com o menu lateral ocultado, destacando o Odontograma 3D e o feed de automação do WhatsApp ativo.
* **Legenda:** "Uma interface limpa, rápida e livre de distrações. Desenhada para ser utilizada com luvas e cliques mínimos."

### Bloco 5: Prova Social Avançada (Depoimentos)
*Depoimentos reais com foto, nome, CRO (Cédula Profissional) e cidade do dentista. Médicos confiam em médicos.*
* **Exemplo:** *"Mudei para o DentalOS pela promessa do bot de WhatsApp, mas o que salvou a minha clínica foi o módulo financeiro. Descobri que dois procedimentos que eu fazia muito tinham margem quase zero devido aos custos do protético. Ajustei os preços em uma semana e o faturamento líquido subiu 22%."* – **Dr. Alexandre Mendes, Implantodontista (Lisboa)**

### Bloco 6: Planos e Preços (Transparência Premium)
*Cards de preços elegantes com efeito de vidro fosco. O plano ideal deve estar destacado como "Mais Escolhido".*
* **Plano Start:** Focado em consultórios individuais (Agenda, Pacientes e Financeiro básico).
* **Plano Pro (Recomendado):** Inclui o Odontograma 3D, automação básica do WhatsApp e split de comissões.
* **Plano Elite/Clinic:** Para clínicas multi-profissionais. Inclui robô n8n dedicado com fluxos de pré-anamnese personalizados e e-mails de relatórios executivos via Resend.

### Bloco 7: FAQ (Quebra de Objeções Finais)
*Sanar as últimas dúvidas em formato Accordion (clica e expande).*
* *É difícil migrar os dados do meu sistema antigo?* "Não. A nossa equipa de engenharia faz a migração de todo o seu histórico de pacientes de forma 100% gratuita e segura."
* *O meu número de WhatsApp corre o risco de ser banido?* "Não. O nosso motor n8n utiliza uma arquitetura transacional com intervalos aleatórios (Throttling inteligente), emulando o comportamento humano perfeito."
* *O sistema está em conformidade com o RGPD?* "Sim. Todos os dados de saúde são encriptados na base de dados do Supabase e o acesso é isolado por clínica através de protocolos RLS rigorosos."

### Bloco 8: Rodapé e Call to Action Final (Footer)
* **Última chamada:** "Pare de perder dinheiro em planilhas e consultas desmarcadas. Leve a sua clínica para o nível premium hoje."
* **Botão:** [ Experimentar 14 Dias Sem Compromisso ]
* **Rodapé:** Links legais (Políticas de Privacidade, Termos de Uso), selos de segurança SSL e indicação de "Made with 🔒 security via Supabase".

---

## 🛠️ Requisitos Técnicos para o Programador Front-End
1.  **SEO On-Page:** Tags `h1`, `h2` e `h3` bem distribuídas seguindo a semântica deste documento. Meta-description focada em "Software Odontológico de Alta Performance".
2.  **Componentes Interativos:** Utilizar bibliotecas como `Framer Motion` na Landing Page para fazer com que os cartões e benefícios apareçam suavemente à medida que o utilizador faz o scroll (*fade-in up*).
3.  **Captação de Leads:** O formulário de CTA deve pedir apenas: Nome, E-mail, Telemóvel (WhatsApp) e "Número de Cadeiras/Dentistas na Clínica". Enviar estes dados diretamente para o Supabase (tabela `leads`) e disparar um e-mail de boas-vindas instantâneo usando o **Resend**.
