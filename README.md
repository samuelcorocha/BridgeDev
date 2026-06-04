# BridgeDev

Plataforma SaaS de simulação de ambientes corporativos para desenvolvedores em formação. Estudantes resolvem desafios técnicos em sandboxes e recebem um **Relatório de Prontidão** que valida autonomia técnica para recrutadores.

## Stack

| Camada | Tecnologia |
|---|---|
| Full-stack | Next.js 14 (App Router), TypeScript strict |
| UI | Tailwind CSS, shadcn/ui |
| Auth | NextAuth.js (GitHub OAuth) |
| Banco | Supabase (PostgreSQL) + Prisma ORM |
| Sandbox | GitHub Codespaces API |
| Jobs | Inngest (serverless) |
| PDF | @react-pdf/renderer |
| Deploy | Vercel + Supabase |

## Desenvolvimento

```bash
pnpm dev          # servidor de desenvolvimento (localhost:3000)
pnpm build        # build de produção
pnpm test         # testes com Vitest
pnpm lint         # ESLint
```

## Banco de dados

```bash
pnpm db:push      # sincroniza schema Prisma → banco
pnpm db:migrate   # cria e aplica migration
pnpm db:studio    # abre Prisma Studio
pnpm db:seed      # popula dados iniciais
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string do Supabase |
| `NEXTAUTH_SECRET` | Secret para NextAuth |
| `GITHUB_CLIENT_ID` | OAuth App do GitHub |
| `GITHUB_CLIENT_SECRET` | OAuth App do GitHub |
| `GITHUB_WEBHOOK_SECRET` | Secret para validação HMAC dos webhooks |
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação |

## Estrutura

```
src/
  app/              # Next.js App Router
    api/            # Route handlers
    (auth)/         # Login
    (dashboard)/    # Área logada (dashboard, desafios, sandbox, relatórios)
  components/       # Componentes React
  lib/              # Clientes e utilitários compartilhados
  server/           # Lógica server-only (evaluator, sandbox, pdf)
  types/            # Tipos TypeScript
prisma/
  schema.prisma
```

## Fluxo principal

```
Login GitHub OAuth
  → Catálogo de desafios
  → Iniciar desafio (provisiona Codespace via API)
  → Desenvolvedor trabalha no Codespace
  → Webhooks GitHub capturam push / PR / check_run
  → Submeter desafio → Readiness Score calculado
  → Relatório de Prontidão gerado (PDF exportável)
```

## Readiness Score

| Dimensão | Peso |
|---|---|
| Git Discipline | 25% |
| Test Coverage | 25% |
| Code Quality | 20% |
| Documentation | 15% |
| Delivery | 15% |

Mínimo para certificado: **70 pontos**.
