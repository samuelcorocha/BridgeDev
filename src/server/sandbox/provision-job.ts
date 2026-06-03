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

    const [templateOwner, templateRepoName] = sandbox.challenge.templateRepo.split("/")
    const forkName = `${sandbox.user.githubLogin}-${sandbox.challenge.slug}`

    try {
      const gh = getGithubClient()

      // Cria fork do template repo para a organização BridgeDev
      await gh.repos.createFork({
        owner: templateOwner,
        repo: templateRepoName,
        organization: env.GITHUB_ORG,
        name: forkName,
      })

      // GitHub cria forks de forma assíncrona
      await new Promise((r) => setTimeout(r, 6000))

      // Cria Codespace no fork
      const { data: codespace } = await (
        gh.codespaces as {
          createWithRepoForAuthenticatedUser: (opts: {
            owner: string
            repo: string
            location: string
          }) => Promise<{ data: { id: number; web_url: string } }>
        }
      ).createWithRepoForAuthenticatedUser({
        owner: env.GITHUB_ORG,
        repo: forkName,
        location: "SouthAmericaEast",
      })

      // Configura webhook no fork
      await gh.repos.createWebhook({
        owner: env.GITHUB_ORG,
        repo: forkName,
        config: {
          url: `${env.NEXT_PUBLIC_APP_URL}/api/webhooks/github`,
          content_type: "json",
          secret: env.GITHUB_WEBHOOK_SECRET,
        },
        events: ["push", "pull_request", "check_run", "workflow_run"],
      })

      await db.sandbox.update({
        where: { id: sandboxId },
        data: {
          forkRepo: `${env.GITHUB_ORG}/${forkName}`,
          codespaceId: String(codespace.id),
          codespaceUrl: codespace.web_url,
          status: "READY",
        },
      })
    } catch (err) {
      await db.sandbox.update({ where: { id: sandboxId }, data: { status: "FAILED" } })
      throw err
    }
  }
)
