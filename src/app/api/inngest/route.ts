import { serve } from "inngest/next"
import { inngest } from "@/lib/inngest"
import { provisionSandbox } from "@/server/sandbox/provision-job"
import { evaluateSandbox } from "@/server/sandbox/evaluate-job"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [provisionSandbox, evaluateSandbox],
})
