# Design: Polish Round 2 — Relatório, Cards, Sidebar, Estados

**Data:** 2026-06-04  
**Escopo:** Segunda rodada de refinamento visual — 4 áreas independentes

---

## Contexto

Após a primeira rodada (banners roxos + cards elevados + login split screen), o produto ainda apresenta inconsistências: relatório parece lista de dados, cards de desafio são visualmente idênticos, sidebar sem identidade do usuário, e estados vazios/loading são texto puro.

---

## A — Relatório de Prontidão

**Arquivos:** `src/components/report/report-view.tsx`, `src/components/report/dimension-card.tsx`, `src/components/report/score-gauge.tsx`

### Score card horizontal compacto

Substituir o score card atual por um layout horizontal com duas colunas:
- **Coluna esquerda:** `ScoreGauge` menor (w/h 80px) 
- **Coluna direita:**
  - Score grande (`text-4xl font-black`) com cor por faixa (≥80 emerald, ≥60 amber, <60 red)
  - Texto "/ 100 pts" em zinc-400
  - Badge de certificado (emitido ou mínimo 70pts)
  - 5 mini-barras horizontais das dimensões: label (6 chars) + barra `h-1.5` + score numérico

As 5 mini-barras ficam dentro do score card, abaixo do número. Cada barra tem `w-[score%]` com cor dinâmica (emerald ≥80, amber ≥60, red <60). Labels abreviados: "Git", "Testes", "Código", "Docs", "Entrega".

A ordem das dimensões nas mini-barras espelha a ordem dos `feedback` vindos do banco.

### DimensionCard com barra de progresso

Adicionar abaixo do header (label + score) uma barra `h-1.5 rounded-full` com preenchimento colorido por score. Manter pontos e melhorias como estão.

```tsx
// Após o header existente:
<div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
  <div
    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
    style={{ width: `${score}%` }}
  />
</div>
```

`barColor`: `bg-emerald-500` se score ≥ 80, `bg-amber-500` se ≥ 60, `bg-red-500` se < 60.

### ScoreGauge — prop `size`

Adicionar prop opcional `size?: number` (default `120`) ao componente. No score card do relatório, passar `size={80}`:

```tsx
// score-gauge.tsx
interface Props {
  score: number
  size?: number
}

export function ScoreGauge({ score, size = 120 }: Props) {
  // usar size no width/height do SVG
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-label={`Score: ${score}`}>
```

Uso no `report-view.tsx`: `<ScoreGauge score={report.scoreTotal} size={80} />`

---

## B — Cards de Desafio

**Arquivo:** `src/app/(dashboard)/challenges/page.tsx`

### Faixa de cor no topo por dificuldade

Cada card recebe `overflow-hidden` + faixa `h-1 absolute top-0 left-0 right-0` com gradiente por dificuldade:

| Dificuldade | Gradiente |
|---|---|
| BEGINNER | `from-emerald-400 to-emerald-500` |
| INTERMEDIATE | `from-amber-400 to-amber-500` |
| ADVANCED | `from-red-400 to-red-500` |

Extrair de `DIFFICULTY_COLORS` não é possível pois aquele mapa tem classes de background/text. Criar constante local `DIFFICULTY_BAR_COLORS` no mesmo arquivo.

### Barra de dificuldade no rodapé

Substituir o badge de texto de dificuldade por 3 blocos `w-3 h-1.5 rounded-sm`:
- BEGINNER: 1 bloco preenchido + 2 vazios
- INTERMEDIATE: 2 blocos preenchidos + 1 vazio
- ADVANCED: 3 blocos preenchidos

Cor dos blocos preenchidos: mesma do gradiente da faixa do topo (emerald/amber/red). Blocos vazios: `bg-zinc-200 dark:bg-zinc-700`.

O badge de texto de dificuldade (que ficava no canto direito do header do card) é **removido** — a faixa no topo + os blocos no rodapé substituem essa informação visualmente.

---

## C — Sidebar

**Arquivo:** `src/components/layout/sidebar.tsx`

### Avatar com iniciais

Substituir `<p className="text-xs text-zinc-400 truncate px-3">{user.name}</p>` por:

```tsx
<div className="flex items-center gap-2 px-3">
  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
    {initials}
  </div>
  <div className="min-w-0">
    <p className="text-xs text-zinc-300 dark:text-zinc-300 truncate font-medium">
      {firstName}
    </p>
    <p className="text-[10px] text-violet-400 dark:text-violet-400 font-medium">
      {planLabel}
    </p>
  </div>
</div>
```

**`initials`:** primeiras letras das duas primeiras palavras do nome (`"Samuel Coronha" → "SC"`). Fallback: primeira letra do email ou "?".

**`planLabel`:** `user.plan === "B2B" ? "Empresa" : "Estudante"`. O campo `plan` já existe no tipo `Props`.

Computar no corpo do componente:
```tsx
const firstName = user.name?.split(" ")[0] ?? "Usuário"
const initials = user.name
  ?.split(" ")
  .slice(0, 2)
  .map((w) => w[0])
  .join("")
  .toUpperCase() ?? "?"
const planLabel = user.plan === "B2B" ? "Empresa" : "Estudante"
```

---

## D — Estados Vazios e Loading

### Empty state do dashboard

**Arquivo:** `src/app/(dashboard)/dashboard/page.tsx`

Substituir o card de estado vazio atual por:

```tsx
<div className="text-center py-16 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md border border-zinc-100 dark:border-zinc-800 rounded-xl transition-shadow duration-200">
  <div className="text-4xl mb-3">🚀</div>
  <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
    Seu primeiro desafio te espera
  </p>
  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5 max-w-xs mx-auto">
    Simule o dia a dia de um dev júnior e receba seu Relatório de Prontidão.
  </p>
  <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white">
    <Link href="/challenges">Ver desafios disponíveis</Link>
  </Button>
</div>
```

### Loading state do provisionamento (steps)

**Arquivo:** `src/components/sandbox/sandbox-view.tsx`

Substituir o card de provisionamento atual (dois parágrafos de texto) por uma lista de 3 steps com estado visual:

**Lógica dos steps:** o passo "Criando fork" fica sempre como concluído (✓) após o componente montar — na prática, se chegou ao frontend com status PROVISIONING o fork já foi iniciado. O passo "Configurando webhook" fica como "em andamento" (spinner). O passo "Pronto para começar" fica como pendente (círculo vazio).

```tsx
{sandbox.status === "PROVISIONING" && (
  <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 rounded-xl p-5">
    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
      Preparando seu ambiente
    </p>
    <div className="flex flex-col gap-3">
      {/* Passo 1: concluído */}
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
          <span className="text-emerald-600 dark:text-emerald-400 text-xs">✓</span>
        </div>
        <span className="text-sm text-zinc-400 dark:text-zinc-500 line-through">
          Criando fork do repositório
        </span>
      </div>
      {/* Passo 2: em andamento */}
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin shrink-0" />
        <span className="text-sm text-violet-600 dark:text-violet-400 font-medium">
          Configurando webhook...
        </span>
      </div>
      {/* Passo 3: pendente */}
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-zinc-200 dark:border-zinc-700 shrink-0" />
        <span className="text-sm text-zinc-400 dark:text-zinc-500">
          Pronto para começar
        </span>
      </div>
    </div>
    <p className="text-xs text-zinc-400 mt-4">Isso leva cerca de 30–60 segundos.</p>
  </div>
)}
```

---

## O que NÃO muda

- Lógica de negócio, queries, auth
- Banner roxo (já implementado)
- Botões coloridos por ação
- ThemeToggle, SignOutButton
- Polling e submit/reset do sandbox

---

## Arquivos a modificar

1. `src/components/report/report-view.tsx`
2. `src/components/report/dimension-card.tsx`
3. `src/app/(dashboard)/challenges/page.tsx`
4. `src/components/layout/sidebar.tsx`
5. `src/app/(dashboard)/dashboard/page.tsx`
6. `src/components/sandbox/sandbox-view.tsx`
