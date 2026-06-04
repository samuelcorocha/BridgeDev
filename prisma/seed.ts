import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

const challenges = [
  {
    slug: "legacy-api-refactor",
    title: "Refatoração de API Legada",
    description:
      "Uma API Node.js/Express foi entregue sem testes, com funções de 200+ linhas e sem separação de responsabilidades. Sua missão é refatorar seguindo princípios SOLID, adicionar testes unitários e documentar.",
    difficulty: "INTERMEDIATE" as const,
    estimatedMinutes: 90,
    stack: ["Node.js", "Express", "Jest", "Git"],
    templateRepo: "bridgedev-challenges/challenge-legacy-api",
    instructions: `## Contexto
Você acaba de entrar em uma empresa e recebeu a tarefa de melhorar uma API legada crítica.

## Tarefas
1. Identifique code smells no código existente
2. Refatore pelo menos 3 funções seguindo SRP
3. Adicione testes unitários (cobertura mínima: 70%)
4. Atualize o README com as mudanças feitas
5. Faça commits atômicos com mensagens descritivas

## Critérios de Avaliação
- Qualidade dos commits e histórico do Git
- Cobertura e qualidade dos testes
- Aderência aos princípios SOLID
- Documentação das mudanças`,
    isActive: true,
  },
  {
    slug: "ci-cd-pipeline",
    title: "Configuração de Pipeline CI/CD",
    description:
      "Um projeto sem qualquer automação precisa de um pipeline de CI/CD. Configure GitHub Actions com lint, testes e build.",
    difficulty: "BEGINNER" as const,
    estimatedMinutes: 60,
    stack: ["GitHub Actions", "Docker", "Git", "YAML"],
    templateRepo: "bridgedev-challenges/challenge-cicd-pipeline",
    instructions: `## Contexto
A equipe está cansada de deploys manuais e bugs que passam para produção.

## Tarefas
1. Crie workflow de CI que roda em todo PR: lint + testes
2. Crie workflow de CD que faz build da imagem Docker e publica no GHCR
3. Adicione badge de status no README
4. Configure branch protection rules (documente como configurar)

## Critérios de Avaliação
- Pipeline funcional (workflows passando)
- Organização e clareza dos arquivos YAML
- Documentação do processo`,
    isActive: true,
  },
  {
    slug: "docker-compose-setup",
    title: "Containerização com Docker Compose",
    description:
      "Uma aplicação fullstack (API + frontend + banco) precisa ser containerizada para rodar com um único comando em qualquer máquina.",
    difficulty: "INTERMEDIATE" as const,
    estimatedMinutes: 75,
    stack: ["Docker", "Docker Compose", "PostgreSQL", "Git"],
    templateRepo: "bridgedev-challenges/challenge-docker-compose",
    instructions: `## Contexto
"Funciona na minha máquina" — esse é o problema que você vai resolver.

## Tarefas
1. Crie Dockerfile para a API (multi-stage build)
2. Crie Dockerfile para o frontend
3. Configure docker-compose.yml com: api, frontend, postgres, volume para dados
4. Variáveis de ambiente via .env.example
5. README com instruções de como rodar

## Critérios de Avaliação
- Aplicação sobe com \`docker compose up\`
- Multi-stage build para imagem menor
- Boas práticas de segurança (não rodar como root, .dockerignore)
- Documentação clara`,
    isActive: true,
  },
]

async function main() {
  for (const challenge of challenges) {
    await db.challenge.upsert({
      where: { slug: challenge.slug },
      update: challenge,
      create: challenge,
    })
  }
  console.log("Seed concluído: 3 desafios criados")
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
