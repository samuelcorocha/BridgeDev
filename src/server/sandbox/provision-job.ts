import { Octokit } from "@octokit/rest"
import { inngest } from "@/lib/inngest"
import { getGithubClient } from "@/lib/github"
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

    if (!sandbox.user.githubLogin) {
      await db.sandbox.update({ where: { id: sandboxId }, data: { status: "FAILED" } })
      throw new Error("Usuário sem githubLogin")
    }

    const account = await db.account.findFirst({
      where: { userId: sandbox.user.id, provider: "github" },
    })

    if (!account?.access_token) {
      await db.sandbox.update({ where: { id: sandboxId }, data: { status: "FAILED" } })
      throw new Error("Token OAuth do usuário não encontrado")
    }

    // Usa token OAuth do usuário para criar o fork na conta pessoal dele
    const userGh = new Octokit({ auth: account.access_token })
    const appGh = getGithubClient()

    const [templateOwner, templateRepoName] = sandbox.challenge.templateRepo.split("/")
    const forkName = `bridgedev-${sandbox.challenge.slug}`
    const forkOwner = sandbox.user.githubLogin

    try {
      // Cria fork do template na conta pessoal do usuário (ignora se já existir)
      await userGh.repos.createFork({
        owner: templateOwner,
        repo: templateRepoName,
        name: forkName,
        default_branch_only: true,
      }).catch((err: { status?: number }) => {
        if (err.status === 422) return
        throw err
      })

      // GitHub cria forks de forma assíncrona
      await new Promise((r) => setTimeout(r, 6000))

      // Configura webhook no fork via token do usuário (ignora se já existir)
      await userGh.repos.createWebhook({
        owner: forkOwner,
        repo: forkName,
        config: {
          url: env.GITHUB_WEBHOOK_PROXY_URL ?? `${env.NEXT_PUBLIC_APP_URL}/api/webhooks/github`,
          content_type: "json",
          secret: env.GITHUB_WEBHOOK_SECRET,
        },
        events: ["push", "pull_request", "check_run", "workflow_run"],
      }).catch((err: { status?: number; message?: string }) => {
        if (err.status === 422 && err.message?.includes("already exists")) return
        throw err
      })

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
