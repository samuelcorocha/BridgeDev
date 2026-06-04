# Design: Redesign Login + Páginas Internas

**Data:** 2026-06-04  
**Escopo:** Página de login e todas as páginas da área logada (exceto sidebar, já atualizada)

---

## Contexto

A home page já tem identidade visual forte (gradient-text, violet-glow, hero-bg, header sticky com blur). Login e páginas internas estão "sem graça" — fundo branco/zinc puro, cards com borda flat, sem hierarquia visual além da cor dos botões.

## Decisões de Design

- **Login:** Split screen (painel roxo à esquerda + formulário branco à direita)
- **Páginas internas:** Banner roxo no topo de cada página + cards elevados com shadow

Ambas mantêm dark mode via `next-themes` (já implementado).

---

## Login — Split Screen

**Arquivo:** `src/app/(auth)/login/page.tsx`

### Layout
- Tela dividida 50/50 em desktop
- Mobile: painel roxo vira faixa compacta no topo, formulário embaixo

### Painel esquerdo (roxo)
- Fundo: `linear-gradient(135deg, #4c1d95 → #6d28d9 → #7c3aed)`
- Conteúdo (de baixo para cima, alinhado ao fundo):
  - Snippet decorativo de terminal: `$ bridgedev init` em fonte mono
  - Tagline: "Prove sua prontidão técnica"
  - Subtexto: "Desafios reais. Avaliação real."
- Elementos decorativos: círculos grandes com `rgba(255,255,255,0.05)` para profundidade

### Painel direito (formulário)
- Fundo: `bg-white dark:bg-zinc-950`
- Conteúdo centralizado:
  - Logo "BridgeDev" pequeno em `gradient-text`
  - Subtítulo: "Simule o dia a dia de um desenvolvedor..."
  - `<LoginButton />` (já existente)
  - Texto de aviso GitHub (já existente)

---

## Páginas Internas — Banner Roxo + Cards Elevados

### Banner de página (padrão reutilizável)

Cada página ganha um bloco no topo com:
- Fundo: `linear-gradient(135deg, #4c1d95 → #6d28d9)` com `rounded-xl`
- Título branco + subtítulo em `rgba(255,255,255,0.7)`
- Padding generoso (`p-6` ou `p-8`)

Não é um componente separado — implementado inline em cada página para evitar over-abstração no MVP.

### Cards

Substituir o padrão `border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900` por:
```
bg-white dark:bg-zinc-900
shadow-sm hover:shadow-md
border border-zinc-100 dark:border-zinc-800
rounded-xl
transition-shadow duration-200
```

---

## Página a Página

### Dashboard (`src/app/(dashboard)/dashboard/page.tsx`)
- Banner: "Olá, [nome]" + "X desafio(s) concluído(s)"
- Cards de sandbox: shadow leve, status badge já colorido (mantido), barra de progresso roxa quando há score
- Estado vazio: card centralizado com ícone e CTA

### Catálogo de Desafios (`src/app/(dashboard)/challenges/page.tsx`)
- Banner: "Desafios" + "Escolha um ambiente para testar sua prontidão"
- Cards de desafio: shadow + hover com `violet-glow-sm` (utilitário já em globals.css)

### Detalhe do Desafio (`src/app/(dashboard)/challenges/[slug]/page.tsx`)
- Banner: título do desafio + badge de dificuldade + tempo estimado
- Card de instruções: fundo `zinc-50 dark:zinc-900` com borda `violet-200 dark:violet-900`

### Sandbox (`src/components/sandbox/sandbox-view.tsx`)
- Banner: título do desafio + status em texto (animado se provisioning)
- Card de ações: botões já coloridos (mantidos), shadow leve
- Card de instruções: mesmo estilo do detalhe

### Relatório (`src/components/report/report-view.tsx`)
- Banner: "Relatório de Prontidão" + nome do desafio + data
- Score em destaque mantido; card de score com shadow mais pronunciada + borda `violet-200`
- Cards de dimensão: shadow leve

---

## O que NÃO muda

- Sidebar (já atualizada com gradient-text e ativo violet)
- Lógica de negócio e queries de banco
- Componentes `LoginButton`, `SignOutButton`, `StartChallengeButton`
- Sistema de cores dos status badges e tech tags
- `ScoreGauge` e `DimensionCard` (estrutura mantida, só wrapper muda)

---

## Arquivos a modificar

1. `src/app/(auth)/login/page.tsx`
2. `src/app/(dashboard)/dashboard/page.tsx`
3. `src/app/(dashboard)/challenges/page.tsx`
4. `src/app/(dashboard)/challenges/[slug]/page.tsx`
5. `src/components/sandbox/sandbox-view.tsx`
6. `src/components/report/report-view.tsx`
