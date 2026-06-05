import { PrismaAdapter } from "@auth/prisma-adapter"
import type { NextAuthOptions } from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import { db } from "@/lib/db"
import { env } from "@/lib/env"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email repo codespace",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.plan = (user as unknown as { plan: string }).plan
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile && user.email) {
        const githubProfile = profile as { login: string; id: number }
        await db.user
          .update({
            where: { email: user.email },
            data: {
              githubLogin: githubProfile.login,
              githubId: githubProfile.id,
            },
          })
          .catch((err) => console.error("[auth] githubLogin update failed:", err))
      }
      return true
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "database" },
}
