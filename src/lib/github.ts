import { createAppAuth } from "@octokit/auth-app"
import { Octokit } from "@octokit/rest"
import { env } from "@/lib/env"

// Lazy singleton — o client é criado na primeira chamada, não na inicialização do módulo.
// Isso evita erros de env vars ausentes durante o build.
let _github: Octokit | null = null

export function getGithubClient(): Octokit {
  if (!_github) {
    _github = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: env.GITHUB_APP_ID,
        privateKey: env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, "\n"),
        installationId: Number(env.GITHUB_APP_INSTALLATION_ID),
      },
    })
  }
  return _github
}
