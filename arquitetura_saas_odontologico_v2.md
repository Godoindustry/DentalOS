# 🦷 Arquitetura e Engenharia de Requisitos: SaaS Odontológico Premium (DentalOS)

Este documento estabelece o plano de arquitetura, especificações técnicas, modelagem de dados e mapa de competências para o desenvolvimento de um **SaaS Odontológico Multi-Tenant de Alta Performance**. O foco central deste ecossistema é ir além do básico (agenda/prontuário), entregando **inteligência de faturamento orientada a margem por procedimento**, **automação cirúrgica de fluxos de atendimento via n8n/WhatsApp** e **segurança jurídica rigorosa**.

---

## 🏗️ 1. Arquitetura de Referência & Stack Tecnológica

Para garantir escalabilidade com custo controlado, isolamento completo de dados (Multi-Tenancy) e atualizações em tempo real, a stack técnica foi selecionada estrategicamente:

```
[ Camada de Apresentação ] -> Next.js 14+ (App Router) hospedado na Vercel
                                     |
[ Camada de Autenticação ] -> Supabase Auth (JWT / MFA Opcional)
                                     |
   [ Camada de Banco ]     -> Supabase (PostgreSQL) com RLS (Row Level Security) ativo
                                     |
[ Motor de Automação ]    -> n8n (Webhooks + Triggers) acoplado à API do WhatsApp
                                     |
[ Camada de Mensageria ]   -> Resend (E-mails Transacionais com alta entregabilidade)
```

### Justificativas Técnicas da Stack:
* **Next.js (Vercel):** SSR (Server-Side Rendering) para carregamento instantâneo do dashboard de faturamento e componentes dinâmicos de agendamento.
* **Supabase (PostgreSQL):** O uso de **Row Level Security (RLS)** nativo garante que clínicas diferentes (*tenants*) compartilhem a mesma base lógica física, mas fiquem 100% isoladas via políticas de acesso no nível da linha da tabela.
* **n8n:** Flexibilidade para orquestrar e alterar regras de atendimento rapidamente sem a necessidade de refatorar o backend do sistema.
* **Resend:** Infraestrutura otimizada para envio de e-mails transacionais (relatórios financeiros, alertas de segurança) evitando filtros de spam através de DNS configurado (SPF, DKIM, DMARC).

---

## 📊 2. Modelagem Avançada de Banco de Dados (PostgreSQL / Supabase)

O script abaixo define a estrutura inicial do banco de dados, aplicando integridade referencial, indexação estratégica e precificação baseada em custos ocultos de insumos odontológicos.

```sql
-- Habilitar extensões de criptografia e UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABELA DE CLÍNICAS (TENANT MATRIX)
-- ==========================================
CREATE TABLE clinicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_fantasia VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255),
    cnpj VARCHAR(18) UNIQUE,
    plano_assinatura VARCHAR(50) DEFAULT 'basic', -- basic, pro, premium
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexação para busca rápida de Tenants
CREATE INDEX idx_clinicas_cnpj ON clinicas(cnpj);

-- ==========================================
-- 2. TABELA DE PROFISSIONAIS (DENTISTAS)
-- ==========================================
CREATE TABLE profissionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL, -- Vínculo com Supabase Auth
    nome VARCHAR(255) NOT NULL,
    cro VARCHAR(20) NOT NULL,
    uf_cro VARCHAR(2) NOT NULL,
    especialidade_principal VARCHAR(100),
    porcentagem_comissao NUMERIC(5,2) DEFAULT 0.00, -- Repasse financeiro padrão
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_profissionais_clinica ON profissionais(clinica_id);

-- ==========================================
-- 3. TABELA DE PACIENTES (LGPD COMPLIANT)
-- ==========================================
CREATE TABLE pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14),
    data_nascimento DATE NOT NULL,
    telefone_whatsapp VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    responsavel_legal VARCHAR(255), -- Obrigatório para menores de idade
    observacoes_criticas TEXT, -- Alergias graves ou cardiopatias sempre visíveis
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_pacientes_clinica_busca ON pacientes(clinica_id, nome, cpf);

-- ==========================================
-- 4. CADASTRO DE PROCEDIMENTOS E PRECIFICAÇÃO
-- ==========================================
CREATE TABLE procedimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE NOT NULL,
    nome_servico VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL, -- Ex: Endodontia, Implantodontia, Harmonização
    codigo_tuss VARCHAR(20), -- Padrão ANS útil para emissão de guias
    preco_venda NUMERIC(10,2) NOT NULL, -- Preço cobrado do cliente
    custo_insumos_direto NUMERIC(10,2) DEFAULT 0.00, -- Resinas, agulhas, anestésicos
    custo_laboratorio NUMERIC(10,2) DEFAULT 0.00, -- Custos com protéticos externos
    tempo_estimado_minutos INT DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================
-- 5. AGENDAMENTOS E CONTROLE DE FLUXO
-- ==========================================
CREATE TABLE agendamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE NOT NULL,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE RESTRICT NOT NULL,
    profissional_id UUID REFERENCES profissionais(id) ON DELETE RESTRICT NOT NULL,
    data_hora_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_hora_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'agendado', -- agendado, confirmado_wpp, cancelado, em_atendimento, finalizado
    canal_origem VARCHAR(50) DEFAULT 'painel', -- painel, bot_whatsapp, link_externo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================
-- 6. PRONTUÁRIO CLÍNICO & ANAMNESE IMUTÁVEL
-- ==========================================
CREATE TABLE anamneses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE NOT NULL,
    profissional_id UUID REFERENCES profissionais(id) NOT NULL,
    questionario_respondido JSONB NOT NULL, -- Histórico médico estruturado
    assinatura_digital_hash TEXT NOT NULL, -- Integridade jurídica dos dados de saúde (SHA-256)
    finalizado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================
-- 7. FATURAMENTO DETALHADO POR PROCEDIMENTO
-- ==========================================
CREATE TABLE faturamento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE NOT NULL,
    paciente_id UUID REFERENCES pacientes(id) NOT NULL,
    procedimento_id UUID REFERENCES procedimentos(id) NOT NULL,
    profissional_executor_id UUID REFERENCES profissionais(id) NOT NULL,
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
    valor_bruto_pago NUMERIC(10,2) NOT NULL,
    desconto_aplicado NUMERIC(10,2) DEFAULT 0.00,
    comissao_retida_dentista NUMERIC(10,2) NOT NULL, -- Calculado no momento da baixa
    lucro_liquido_clinica NUMERIC(10,2) NOT NULL, -- valor_bruto - desconto - insumos - laboratorio - comissao
    data_competencia DATE NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL, -- dinheiro, pix, credito_a_vista, parcelado
    status_pagamento VARCHAR(30) DEFAULT 'pago', -- pago, pendente, estornado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_faturamento_performance ON faturamento(clinica_id, data_competencia, procedimento_id);
```

### Configuração de Row Level Security (RLS):
Para garantir o isolamento absoluto de dados de saúde entre clínicas concorrentes, toda query executada pelo Next.js passará pela validação do JWT extraído da sessão do Supabase:

```sql
-- Ativar RLS na tabela de pacientes
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;

-- Criar política de isolamento baseada no meta-dado da clínica associado ao usuário autenticado
CREATE POLICY paciente_isolation_policy ON pacientes
    FOR ALL
    USING (clinica_id = (SELECT (auth.jwt() -> 'user_metadata' ->> 'clinica_id')::uuid));
```

---

## 🎛️ 3. Módulos Críticos e Regras de Negócio Diferenciais

### 3.1. Inteligência Financeira e Engenharia de Custos
SaaS genéricos registram apenas entradas e saídas ordinárias. O diferencial do seu produto é a **Dedução Automatizada de Custos Marginais**:
* **Margem Real por Categoria:** O dashboard deve calcular a receita subtraindo os custos diretos de protéticos e insumos cadastrados no procedimento.
* **Split de Comissões Inteligente:** Quando um procedimento é marcado como finalizado, o sistema executa uma trigger ou função que calcula automaticamente a comissão retida ao profissional parceiro com base no percentual configurado na tabela `profissionais`, mitigando erros manuais.

### 3.2. Prontuário Médico & Odontograma Baseado em Vetores (SVG)
* **Odontograma Dinâmico:** Utilizar um mapa interativo em formato SVG onde cada elemento geométrico representa uma face dentária (mesial, distal, oclusal, palatina, vestibular) ou a raiz. O clique altera o estado visual (ex: vermelho para cárie diagnosticada, azul para procedimento realizado).
* **Imutabilidade Jurídica (LGPD):** Conforme normas dos conselhos de odontologia, os dados da anamnese e do prontuário, uma vez salvos e finalizados, devem gerar um Hash SHA-256 e ser trancados para edição, permitindo apenas a adição de adendos assinados subsequentes.

### 3.3. Automação de Atendimento via n8n (Anti-Banimento & Humanizado)
A engine n8n atuará como o assistente virtual ativo 24/7 da clínica, orquestrando fluxos assíncronos de forma extremamente profissional para mitigar riscos de bloqueio no WhatsApp.

#### Fluxo 1: Confirmação de Consultas Dinâmica
1.  **Trigger (Cron):** O n8n roda diariamente em horários estratégicos buscando na tabela `agendamentos` os registros do dia seguinte com `status = 'agendado'`.
2.  **Estratégia Anti-Bloqueio (Throttling & Delays):** O n8n **nunca** deve fazer disparos em massa idênticos de forma simultânea. Deve-se injetar um node de código para introduzir atrasos (*delays*) aleatórios entre **5 a 15 segundos** entre cada mensagem enviada, além de parametrizar dinamicamente o texto com variáveis como o primeiro nome do paciente e o horário exato.
3.  **Resposta do Paciente (Webhook):** Se o paciente responder confirmando, o n8n intercepta o webhook da API do WhatsApp e roda um comando de `UPDATE agendamentos SET status = 'confirmado_wpp'` atualizando a dashboard do painel Next.js em tempo real via WebSockets.

#### Fluxo 2: Recorrência Preventiva Automatizada (LTV Tracker)
* **Regra de Negócio:** Tratamentos de prevenção (ex: limpeza/profilaxia) precisam ser refeitos a cada 6 meses. O n8n monitora os procedimentos finalizados há 180 dias e envia um convite personalizado via WhatsApp para agendamento de retorno, gerando faturamento passivo e recorrente para a clínica.

#### Fluxo 3: Pré-Anamnese via Celular
* **Experiência do Paciente:** Assim que o agendamento é confirmado, o n8n dispara uma mensagem com um link seguro. O paciente preenche a ficha de anamnese direto do smartphone antes mesmo de chegar ao consultório, otimizando o tempo de recepção.

---

## 💻 4. Mapa Completo de Competências e Skills Necessárias

Para implementar este ecossistema com maturidade corporativa, as competências técnicas e funcionais estão dividídas nas seguintes frentes:

### 🛠️ Hard Skills (Domínio Técnico)

#### 1. Arquitetura Frontend & UI Avançada
* **Next.js 14+ (App Router):** Domínio de Server Components para renderização veloz de dados estáticos e Client Components para telas dinâmicas (agendas com suporte a arrastar e soltar cards).
* **Interface Limpa e Otimizada (Shadcn/ui & TailwindCSS):** Médicos e dentistas rejeitam sistemas poluídos ou lentos. É essencial construir uma UI minimalista, ágil e focada em produtividade (reduzir a quantidade de cliques necessária para completar uma ação).
* **Manipulação Gráfica:** Domínio de manipulação de SVGs no React para criar o mapa interativo do odontograma sem gerar gargalos de performance ou renderizações desnecessárias.

#### 2. Engenharia de Dados & Postgres Backend (Supabase)
* **Linguagem Procedural (PL/pgSQL):** Escrita de Triggers para automação de cálculos financeiros (lucro líquido e comissões) no momento de inserção dos dados na tabela `faturamento`.
* **Segurança Estrita:** Configuração rigorosa de políticas RLS (Row Level Security) e isolamento lógico para garantir proteção contra vazamento de dados confidenciais de pacientes.
* **Otimização de Consultas:** Criação de índices estruturados para que relatórios financeiros complexos carreguem instantaneamente.

#### 3. Integrações e Orquestração de APIs (n8n)
* **Manipulação de Payloads JSON:** Uso de nodes de código (*JavaScript*) no n8n para validação, formatação e tratamento das strings de mensagem recebidas de instâncias do WhatsApp (Evolution API, Z-API, etc.).
* **Infraestrutura Transacional:** Configuração das chaves e parâmetros DNS (DKIM, SPF e DMARC) no Resend para garantir que e-mails de relatórios semanais gerados em formato PDF não caiam na aba de spam.

---

## 🚀 5. Plano de Execução Técnica e Engenharia de Software

### Fase 1: Fundação do Sistema (Sprints 1 a 4)
* [ ] Configuração do repositório no GitHub com Branching Strategy (Main, Develop, Feature Branches) e CI/CD via GitHub Actions para deploy automatizado na Vercel.
* [ ] Execução do script DDL de banco de dados no Supabase e ativação estrita das políticas globais de RLS.
* [ ] Criação das telas de autenticação, onboarding de novas clínicas e cadastro básico de Pacientes, Profissionais e Procedimentos.

### Fase 2: Módulos Clínicos & Core Financeiro (Sprints 5 a 8)
* [ ] Implementação da agenda de marcação de consultas em tempo real com conexões via WebSockets/Supabase Realtime.
* [ ] Construção do componente interativo do Odontograma SVG integrado com o histórico de evolução clínica do paciente.
* [ ] Desenvolvimento das telas de lançamentos financeiros, telas de cálculo de comissão de dentistas e gráficos analíticos de lucratividade por procedimento.

### Fase 3: Conectividade & Automação Completa (Sprints 9 a 12)
* [ ] Deploy da infraestrutura n8n em ambiente seguro e criação dos webhooks de escuta integrados ao Supabase.
* [ ] Homologação da API do WhatsApp para o fluxo automatizado de confirmação de consultas com delays de segurança e re-engajamento de pacientes (LTV).
* [ ] Implementação do serviço Resend para disparo de relatórios financeiros semanais consolidados em PDF direcionados aos diretores das clínicas.
