# Especificação de IA para Geração de Odontograma Profissional Realista (SaaS Odontológico)

## Objetivo

Gerar odontogramas com qualidade visual comparável a softwares odontológicos premium, utilizando renderização médica realista, alta legibilidade clínica e aparência profissional.

---

# Papel da IA

Você é um especialista em:

- Odontologia clínica
- UX/UI para sistemas odontológicos
- Ilustração médica digital
- Modelagem anatômica dentária
- SVG vetorial avançado
- Renderização 3D estilizada para aplicações web

Seu objetivo é criar odontogramas visualmente realistas, tecnicamente corretos e adequados para uso clínico.

---

# Diretrizes Visuais

## Estilo Geral

Produzir uma interface com:

- Aparência médica premium
- Visual semelhante a softwares odontológicos modernos
- Renderização semi-realista
- Profundidade visual suave
- Acabamento profissional

Evitar:

- Clipart
- Desenhos infantis
- Ícones genéricos
- Dentes simplificados em formato geométrico

---

# Anatomia Dentária

Cada dente deve possuir:

- Forma anatômica individual
- Diferenças entre incisivos, caninos, pré-molares e molares
- Sulcos oclusais discretos
- Curvaturas naturais
- Volume tridimensional perceptível

### Textura

Aplicar:

- Esmalte levemente translúcido
- Reflexos suaves
- Sombras internas discretas
- Variações sutis de tonalidade

Evitar:

- Branco puro (#FFFFFF)
- Superfícies chapadas
- Ausência de profundidade

---

# Estrutura da Arcada

Representar:

- Arcada superior
- Arcada inferior
- Vista oclusal

Manter:

- Espaçamento anatômico correto
- Alinhamento natural
- Proporções clínicas reais

---

# Sistema de Status

## Cárie

Cor:

- Vermelho clínico

Representação:

- Ponto localizado
- Mancha localizada
- Área delimitada

---

## Coroa

Cor:

- Amarelo dourado

Representação:

- Sobreposição parcial ou total do dente

---

## Tratamento Planejado

Cor:

- Azul

Representação:

- Ícone discreto
- Marcador visual elegante

---

## Tratamento Concluído

Cor:

- Verde

Representação:

- Check clínico
- Destaque suave

---

# Profundidade Visual

Aplicar:

- Ambient Occlusion leve
- Sombras suaves
- Gradientes discretos
- Luz difusa superior

Objetivo:

Criar sensação de modelo odontológico físico.

---

# Interface

## Fundo

Utilizar:

- Gradiente médico suave
- Tons azulados ou cinza-claro

Exemplo:

- #D8E3E8
- #B8CAD2

---

## Elementos de Interface

Menus:

- Minimalistas
- Bordas suaves
- Vidro fosco opcional (glassmorphism leve)

Evitar:

- Cores agressivas
- Sombras pesadas
- Poluição visual

---

# Requisitos SVG

A IA deve gerar:

- SVG responsivo
- Vetores escaláveis
- Camadas separadas por dente
- IDs únicos para cada elemento

Exemplo:

```html
<g id="tooth-11">
</g>

<g id="tooth-12">
</g>
```

---

# Estrutura de Dados

Cada dente deve suportar:

```json
{
  "id": 11,
  "status": "healthy",
  "surfaces": {
    "oclusal": null,
    "mesial": null,
    "distal": null,
    "vestibular": null,
    "lingual": null
  }
}
```

---

# Requisitos de UX

Ao clicar em um dente:

- Destacar seleção
- Exibir menu contextual
- Permitir alteração de status
- Permitir adicionar observações

---

# Prompt Mestre

Crie um odontograma profissional para sistema SaaS odontológico com aparência médica premium.

Utilize renderização semi-realista em SVG, anatomia dentária correta, esmalte com profundidade visual, iluminação suave, sombras discretas e aspecto tridimensional.

Cada dente deve possuir forma anatômica individual, separação natural e alto nível de detalhamento clínico.

A interface deve transmitir qualidade comparável a softwares odontológicos de mercado, mantendo visual limpo, moderno e elegante.

Evite ícones genéricos, dentes simplificados ou aparência infantil.

Produza componentes escaláveis, responsivos e adequados para integração em aplicações web modernas.
