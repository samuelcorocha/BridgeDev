import { Octokit } from "@octokit/rest"
import { inngest } from "@/lib/inngest"
import { db } from "@/lib/db"
import { env } from "@/lib/env"

export const provisionSandbox = inngest.createFunction(
  {
    id: "sandbox-provision",
    retries: 2,
    triggers: [{ event: "sandbox/provision" as const }],
  },
  async ({ event }: { event: { data: { sandboxId: string } } }) => {
    const { sandboxId } = event.data as { sandboxId: string }

    const sandbox = await db.sandbox.findUniqueOrThrow({
      where: { id: sandboxId },
      include: { challenge: true, user: true },
    })

    const account = await db.account.findFirst({
      where: { userId: sandbox.user.id, provider: "github" },
    })

    if (!account?.access_token) {
      await db.sandbox.update({ where: { id: sandboxId }, data: { status: "FAILED" } })
      throw new Error("Token OAuth do usuário não encontrado")
    }

    const userGh = new Octokit({ auth: account.access_token })

    // Garante que o githubLogin está disponível — faz fallback à API se necessário
    let githubLogin = sandbox.user.githubLogin
    if (!githubLogin) {
      const { data: ghUser } = await userGh.users.getAuthenticated()
      githubLogin = ghUser.login
      await db.user
        .update({ where: { id: sandbox.user.id }, data: { githubLogin } })
        .catch(() => null)
    }

    if (!githubLogin) {
      await db.sandbox.update({ where: { id: sandboxId }, data: { status: "FAILED" } })
      throw new Error("Não foi possível determinar o GitHub login do usuário")
    }

    const [templateOwner, templateRepoName] = sandbox.challenge.templateRepo.split("/")
    const forkName = `bridgedev-${sandbox.challenge.slug}`
    const forkOwner = githubLogin

    try {
      // Verifica se o fork já existe antes de tentar criar
      const forkExists = await userGh.repos
        .get({ owner: forkOwner, repo: forkName })
        .then(() => true)
        .catch(() => false)

      if (!forkExists) {
        await userGh.repos.createFork({
          owner: templateOwner,
          repo: templateRepoName,
          name: forkName,
          default_branch_only: true,
        })
        // GitHub cria forks de forma assíncrona
        await new Promise((r) => setTimeout(r, 6000))
      }

      // Verifica se o webhook já existe antes de tentar criar
      const hooks = await userGh.repos
        .listWebhooks({ owner: forkOwner, repo: forkName })
        .then((r) => r.data)
        .catch(() => [])

      const webhookUrl =
        env.GITHUB_WEBHOOK_PROXY_URL ?? `${env.NEXT_PUBLIC_APP_URL}/api/webhooks/github`

      const hookExists = hooks.some((h) => h.config.url === webhookUrl)

      if (!hookExists) {
        await userGh.repos.createWebhook({
          owner: forkOwner,
          repo: forkName,
          config: {
            url: webhookUrl,
            content_type: "json",
            secret: env.GITHUB_WEBHOOK_SECRET,
          },
          events: ["push", "pull_request", "check_run", "workflow_run"],
        })
      }

      await db.sandbox.update({
        where: { id: sandboxId },
        data: {
          forkRepo: `${forkOwner}/${forkName}`,
          codespaceUrl: `https://github.com/codespaces/new?repo=${forkOwner}/${forkName}`,
          status: "READY",
        },
      })
    } catch (err) {
      await db.sandbox.update({ where: { id: sandboxId }, data: { status: "FAILED" } })
      throw err
    }
  }
)
