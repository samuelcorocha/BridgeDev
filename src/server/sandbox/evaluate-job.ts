import { inngest } from "@/lib/inngest"
import { db } from "@/lib/db"
import { calculateScore } from "@/server/evaluator/calculator"

export const evaluateSandbox = inngest.createFunction(
  {
    id: "sandbox-evaluate",
    retries: 1,
    triggers: [{ event: "sandbox/evaluate" as const }],
  },
  async ({ event }: { event: { data: { sandboxId: string } } }) => {
    const { sandboxId } = event.data

    const sandbox = await db.sandbox.findUniqueOrThrow({
      where: { id: sandboxId },
      include: { challenge: true, events: true, report: true },
    })

    const score = calculateScore(sandbox)

    await db.readinessReport.create({
      data: {
        sandboxId,
        userId: sandbox.userId,
        scoreTotal: score.total,
        scoreGit: score.git,
        scoreTests: score.tests,
        scoreCodeQuality: score.codeQuality,
        scoreDocs: score.docs,
        scoreDelivery: score.delivery,
        feedback: score.feedback as unknown as import("@prisma/client").Prisma.InputJsonValue,
        certified: score.total >= 70,
      },
    })

    await db.sandbox.update({
      where: { id: sandboxId },
      data: { status: "EVALUATED", finishedAt: new Date() },
    })
  }
)
